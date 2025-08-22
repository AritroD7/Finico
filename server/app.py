import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import stripe
import jwt
from functools import wraps

# ------------ ENV ------------
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PRICE_MONTHLY = os.getenv("STRIPE_PRICE_MONTHLY", "")  # e.g. price_123
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")  # optional for webhooks
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")  # from Supabase project settings (JWT secret)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

stripe.api_key = STRIPE_SECRET_KEY

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_ORIGIN, "http://localhost:5173"]}}, supports_credentials=True)

# ------------ Helpers ------------
def to_float(x, default=0.0):
    try:
        return float(x)
    except (ValueError, TypeError):
        return default

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "missing_token"}), 401
        token = auth.split(" ", 1)[1]
        try:
            # Supabase JWT default algorithm HS256
            payload = jwt.decode(
    token,
    SUPABASE_JWT_SECRET,
    algorithms=["HS256"],
    options={"verify_aud": False},   # <— ignore 'aud' claim
)
        except Exception as e:
            return jsonify({"error": "invalid_token", "detail": str(e)}), 401
        return f(*args, **kwargs)
    return wrapper

# ------------ Health ------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ------------ Budget ------------
@app.route("/api/budget/summary", methods=["POST"])
def budget_summary():
    data = request.get_json(force=True) or {}
    income = to_float(data.get("monthly_income", 0))
    fixed = sum([to_float(v) for v in data.get("fixed_expenses", [])])
    variable = sum([to_float(v) for v in data.get("variable_expenses", [])])
    other = sum([to_float(v) for v in data.get("other_expenses", [])])

    total_expenses = fixed + variable + other
    savings = income - total_expenses
    savings_rate = (savings / income * 100.0) if income > 0 else 0.0

    allocations = {
        "Fixed": fixed, "Variable": variable, "Other": other, "Savings": max(savings, 0.0)
    }
    return jsonify({
        "monthly_income": income,
        "total_expenses": total_expenses,
        "net_savings": savings,
        "savings_rate_pct": savings_rate,
        "allocations": allocations,
        "fixed": fixed, "variable": variable, "other": other,
        "savings_component": max(savings, 0.0)
    })

# ------------ Wealth Forecast (monthly compounding; annual or monthly inputs; fees; escalation) ------------
@app.route("/api/forecast/compound", methods=["POST"])
def forecast_compound():
    d = request.get_json(force=True) or {}
    initial = to_float(d.get("initial", 0))
    monthly = to_float(d.get("monthly_contrib", 0))
    years = int(d.get("years", 10))
    rate_mode = (d.get("rate_mode") or "annual").lower().strip()

    # annual inputs
    r_a = to_float(d.get("annual_return_pct", 5))/100.0
    i_a = to_float(d.get("annual_inflation_pct", 2))/100.0
    fee_a = to_float(d.get("annual_fee_pct", 0))/100.0
    esc_a = to_float(d.get("contrib_escalation_pct", 0))/100.0

    # monthly inputs
    r_m_input = to_float(d.get("monthly_return_pct", 0))/100.0
    i_m_input = to_float(d.get("monthly_inflation_pct", 0))/100.0

    if rate_mode == "monthly":
        r_m_gross = r_m_input
        i_m = i_m_input
    else:
        r_m_gross = (1 + r_a) ** (1/12) - 1
        i_m = (1 + i_a) ** (1/12) - 1

    fee_m = (1 + fee_a) ** (1/12) - 1
    r_m = r_m_gross - fee_m
    esc_m = (1 + esc_a) ** (1/12) - 1

    months = years * 12
    balances_nominal, balances_real = [], []
    bal = initial
    real_factor = 1.0
    curr_monthly = monthly

    for m in range(months + 1):
        balances_nominal.append(float(bal))
        balances_real.append(float(bal / real_factor if real_factor > 0 else bal))
        bal = bal * (1 + r_m) + curr_monthly
        real_factor *= (1 + i_m)
        curr_monthly *= (1 + esc_m)

    return jsonify({
        "months": list(range(months + 1)),
        "balances_nominal": balances_nominal,
        "balances_real": balances_real,
        "meta": {
            "r_month": float(r_m), "i_month": float(i_m),
            "esc_month": float(esc_m), "fee_month": float(fee_m),
            "rate_mode": rate_mode
        }
    })

# ------------ Monte Carlo (goal metrics included) ------------
@app.route("/api/forecast/montecarlo", methods=["POST"])
def forecast_montecarlo():
    d = request.get_json(force=True) or {}
    initial = to_float(d.get("initial", 0))
    monthly = to_float(d.get("monthly_contrib", 0))
    years = int(d.get("years", 10))
    sims = int(d.get("simulations", 2000))
    mean_a = to_float(d.get("mean_annual_return_pct", 6))/100.0
    std_a = to_float(d.get("stdev_annual_return_pct", 12))/100.0
    infl_a = to_float(d.get("annual_inflation_pct", 2))/100.0

    goal_target = d.get("goal_target", None)
    goal_target = float(goal_target) if goal_target not in (None, "") else None
    goal_year = int(d.get("goal_year", years))

    months = years*12
    mean_m = (1 + mean_a) ** (1/12) - 1
    std_m = std_a/np.sqrt(12)
    infl_m = (1 + infl_a) ** (1/12) - 1

    rng = np.random.default_rng()
    monthly_returns = rng.normal(loc=mean_m, scale=std_m, size=(sims, months))

    balances = np.full((sims,), initial, dtype=float)
    real_factor = 1.0
    yearly_snapshots = []

    for m in range(months):
        balances = balances * (1 + monthly_returns[:, m]) + monthly
        real_factor *= (1 + infl_m)
        if (m+1) % 12 == 0:
            yearly_snapshots.append(balances.copy() / real_factor)

    yearly_percentiles = []
    for arr in yearly_snapshots:
        yearly_percentiles.append({
            "p5": float(np.percentile(arr, 5)),
            "p50": float(np.percentile(arr, 50)),
            "p95": float(np.percentile(arr, 95)),
        })

    final_real = yearly_snapshots[-1] if yearly_snapshots else np.array([0.0])
    hist_counts, bin_edges = np.histogram(final_real, bins=30)
    histogram = {"bins": [float(x) for x in bin_edges.tolist()], "counts": [int(c) for c in hist_counts.tolist()]}

    goal_metrics = None
    if goal_target is not None and years > 0 and len(yearly_snapshots) >= 1:
        idx = min(max(goal_year, 1), years) - 1
        target_arr = yearly_snapshots[idx] if idx < len(yearly_snapshots) else yearly_snapshots[-1]
        hits = target_arr >= goal_target
        success_prob = float(np.mean(hits)) if target_arr.size > 0 else 0.0
        shortfalls = goal_target - target_arr[~hits]
        exp_shortfall = float(np.mean(shortfalls)) if shortfalls.size > 0 else 0.0
        goal_metrics = {
            "year": int(goal_year), "target": float(goal_target),
            "success_prob": success_prob,
            "expected_shortfall_if_fail": max(exp_shortfall, 0.0)
        }

    return jsonify({
        "years": list(range(1, years+1)),
        "yearly_percentiles": yearly_percentiles,
        "histogram": histogram,
        "goal": goal_metrics,
        "metadata": {"simulations": int(sims), "mean_monthly": float(mean_m), "stdev_monthly": float(std_m)}
    })

# ------------ Premium: Goal Planner (solve required monthly contrib) ------------
def _mc_success_prob(initial, monthly, years, sims, mean_a, std_a, infl_a):
    months = years*12
    mean_m = (1 + mean_a) ** (1/12) - 1
    std_m = std_a / np.sqrt(12)
    infl_m = (1 + infl_a) ** (1/12) - 1
    rng = np.random.default_rng()
    monthly_returns = rng.normal(loc=mean_m, scale=std_m, size=(sims, months))
    balances = np.full((sims,), initial, dtype=float)
    real_factor = 1.0
    for m in range(months):
        balances = balances * (1 + monthly_returns[:, m]) + monthly
        real_factor *= (1 + infl_m)
    real_final = balances / real_factor
    return real_final

@app.route("/api/goal/required-contribution", methods=["POST"])
@require_auth
def required_contribution():
    """
    Find monthly contribution to reach a target (real) with at least target_prob success at 'years'.
    Inputs: initial, years, mean_annual_return_pct, stdev_annual_return_pct, annual_inflation_pct,
            simulations, target, target_prob (0..1)
    """
    d = request.get_json(force=True) or {}
    initial = to_float(d.get("initial", 0))
    years = int(d.get("years", 20))
    sims = int(d.get("simulations", 4000))
    mean_a = to_float(d.get("mean_annual_return_pct", 7))/100.0
    std_a = to_float(d.get("stdev_annual_return_pct", 14))/100.0
    infl_a = to_float(d.get("annual_inflation_pct", 2.5))/100.0
    target = to_float(d.get("target", 500000))
    target_prob = to_float(d.get("target_prob", 0.7))

    # binary search monthly contribution
    lo, hi = 0.0, max(100.0, target/years/12*2)  # heuristic upper bound
    best = None
    for _ in range(28):  # ~1e-8 precision scale
        mid = (lo + hi) / 2
        finals = _mc_success_prob(initial, mid, years, sims, mean_a, std_a, infl_a)
        prob = float(np.mean(finals >= target))
        if prob >= target_prob:
            best = mid
            hi = mid
        else:
            lo = mid
    return jsonify({"required_monthly": float(best if best is not None else hi)})

# ========== Billing (Stripe) ==========
@app.route("/api/billing/create-checkout-session", methods=["POST"])
@require_auth
def create_checkout():
    if not STRIPE_SECRET_KEY or not STRIPE_PRICE_MONTHLY:
        return jsonify({"error": "stripe_not_configured"}), 500

    user = getattr(request, "user", {})
    email = user.get("email")
    user_id = user.get("id")
    if not email:
        return jsonify({"error": "email_required"}), 400

    data = request.get_json(force=True) or {}
    price_id = data.get("price_id") or STRIPE_PRICE_MONTHLY

    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{FRONTEND_ORIGIN}/account?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_ORIGIN}/account",
        customer_email=email,
        metadata={"user_id": user_id},
        allow_promotion_codes=True
    )
    return jsonify({"url": session.url})

@app.route("/api/billing/create-portal-session", methods=["POST"])
@require_auth
def create_portal():
    d = request.get_json(force=True) or {}
    customer_id = d.get("customer_id")
    if not customer_id:
        return jsonify({"error": "missing_customer_id"}), 400
    portal = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{FRONTEND_ORIGIN}/account"
    )
    return jsonify({"url": portal.url})

@app.route("/api/billing/session", methods=["GET"])
@require_auth
def get_session_info():
    session_id = request.args.get("session_id")
    if not session_id:
        return jsonify({"error": "missing_session_id"}), 400
    sess = stripe.checkout.Session.retrieve(session_id, expand=["customer", "subscription"])
    customer_id = sess.customer.id if hasattr(sess, "customer") and sess.customer else None
    sub_status = sess.subscription.status if hasattr(sess, "subscription") and sess.subscription else "none"
    return jsonify({"customer_id": customer_id, "subscription_status": sub_status})

@app.route("/api/billing/status", methods=["GET"])
@require_auth
def billing_status():
    """Check if user has an active subscription. Prefer customer_id query param if provided."""
    customer_id = request.args.get("customer_id")
    email = request.user.get("email")
    try:
        if not customer_id and email:
            # try find latest customer by email
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                customer_id = customers.data[0].id
        if not customer_id:
            return jsonify({"active": False, "reason": "no_customer"}), 200
        subs = stripe.Subscription.list(customer=customer_id, status="all", limit=10)
        active = any(s.status in ("active", "trialing", "past_due") for s in subs.auto_paging_iter())
        return jsonify({"active": bool(active), "customer_id": customer_id})
    except Exception as e:
        return jsonify({"active": False, "error": str(e)}), 200

# Optional webhook skeleton (configure STRIPE_WEBHOOK_SECRET and point Stripe to /api/billing/webhook)
@app.route("/api/billing/webhook", methods=["POST"])
def stripe_webhook():
    if not STRIPE_WEBHOOK_SECRET:
        return jsonify({"received": True})  # no-op in dev
    payload = request.data
    sig = request.headers.get("Stripe-Signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # handle events if you later add a database
    # if event["type"] == "customer.subscription.updated": ...
    return jsonify({"received": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)), debug=True)

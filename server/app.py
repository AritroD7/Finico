# FILE: server/app.py
import os
from functools import wraps
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import stripe
import jwt

try:
    from dotenv import load_dotenv  # optional
    load_dotenv()
except Exception:
    pass

# ---------- Env ----------
PORT = int(os.getenv("PORT", "5001"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "").strip()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_PRICE_MONTHLY = os.getenv("STRIPE_PRICE_MONTHLY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

# ---------- App ----------
app = Flask(__name__)
CORS(
    app,
    resources={r"/api/*": {"origins": [FRONTEND_ORIGIN, "http://localhost:5173"]}},
    supports_credentials=True,
)

# ---------- Helpers ----------
def to_float(x, default=0.0):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default

def json_error(message, status=400):
    return jsonify({"error": message}), status

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not SUPABASE_JWT_SECRET:
            return fn(*args, **kwargs)  # dev: allow through if not configured
        auth = request.headers.get("Authorization", "").split()
        if len(auth) != 2 or auth[0].lower() != "bearer":
            return json_error("Missing bearer token", 401)
        token = auth[1]
        try:
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
            request.user = {"id": payload.get("sub"), "email": payload.get("email")}
        except jwt.InvalidTokenError as e:
            return json_error(f"Invalid token: {e}", 401)
        return fn(*args, **kwargs)
    return wrapper

def monthly_rate_from_annual(annual_pct: float) -> float:
    return (1.0 + annual_pct/100.0) ** (1.0 / 12.0) - 1.0

def monthly_from_pct(monthly_pct: float) -> float:
    return monthly_pct / 100.0

# ---------- Routes ----------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "time": datetime.now(timezone.utc).isoformat()})

# -------- Budget summary (simple math) --------
@app.route("/api/budget/summary", methods=["POST"])
@require_auth
def budget_summary():
    data = request.get_json(force=True) or {}
    income = to_float(data.get("monthly_income", 0))
    fixed = [to_float(v) for v in (data.get("fixed_expenses", []) or [])]
    variable = [to_float(v) for v in (data.get("variable_expenses", []) or [])]
    other = [to_float(v) for v in (data.get("other_expenses", []) or [])]
    total_expenses = sum(fixed) + sum(variable) + sum(other)
    savings = income - total_expenses
    savings_rate = (savings / income) * 100 if income > 0 else 0
    return jsonify({
        "monthly_income": income,
        "fixed_total": sum(fixed),
        "variable_total": sum(variable),
        "other_total": sum(other),
        "total_expenses": total_expenses,
        "savings": savings,
        "savings_rate_pct": round(savings_rate, 2),
    })

# -------- Deterministic compound forecast (page-compatible) --------
@app.route("/api/forecast/compound", methods=["POST"])
@require_auth
def forecast_compound():
    d = request.get_json(force=True) or {}

    # inputs (support both your old keys and simpler ones)
    initial = to_float(d.get("initial", 0))
    monthly = to_float(d.get("monthly", d.get("monthly_contrib", 0)))
    years   = max(int(to_float(d.get("years", 0))), 0)

    rate_mode = (d.get("rate_mode") or "annual").lower()
    if rate_mode == "monthly":
        r_m   = monthly_from_pct(to_float(d.get("monthly_return_pct", 0)))
        i_m   = monthly_from_pct(to_float(d.get("monthly_inflation_pct", 0)))
    else:
        r_m   = monthly_rate_from_annual(to_float(d.get("annual_return_pct", 7)))
        i_m   = monthly_rate_from_annual(to_float(d.get("annual_inflation_pct", 2.5)))

    fee_m = monthly_rate_from_annual(to_float(d.get("annual_fee_pct", 0.0)))
    esc_m = monthly_rate_from_annual(to_float(d.get("contrib_escalation_pct", d.get("contribution_escalation_pct", 0.0))))

    months = years * 12
    months_arr = list(range(months + 1))

    bal = initial
    real_factor = 1.0
    contrib = monthly
    nominal = [bal]
    real    = [bal]

    for _m in range(1, months + 1):
        bal = bal * (1 + (r_m - fee_m)) + contrib
        real_factor *= (1 + i_m)
        contrib *= (1 + esc_m)
        nominal.append(bal)
        real.append(bal / real_factor)

    return jsonify({
        "months": months_arr,  # array, as your page expects
        "balances_nominal": nominal,
        "balances_real": real,
        "ending_nominal": nominal[-1],
        "ending_real": real[-1],
        "meta": { "r_month": r_m, "i_month": i_m, "fee_month": fee_m, "esc_month": esc_m },
        "inputs": d
    })

# -------- Monte Carlo forecast (page-compatible) --------
@app.route("/api/forecast/montecarlo", methods=["POST"])
@require_auth
def forecast_montecarlo():
    d = request.get_json(force=True) or {}

    initial = to_float(d.get("initial", 0))
    monthly = to_float(d.get("monthly", d.get("monthly_contrib", 0)))
    years   = max(int(to_float(d.get("years", 0))), 0)
    sims    = max(int(to_float(d.get("simulations", 1000))), 1)

    mean_a  = to_float(d.get("mean_annual_return_pct", 7))
    stdev_a = to_float(d.get("stdev_annual_return_pct", 15))
    infl_a  = to_float(d.get("annual_inflation_pct", 2.5))
    fee_a   = to_float(d.get("annual_fee_pct", 0.0))  # optional

    seed = int(to_float(d.get("seed", 0)))
    if seed:
        np.random.seed(seed)

    r_m      = monthly_rate_from_annual(mean_a) - monthly_rate_from_annual(fee_a)
    sigma_m  = (stdev_a / 100.0) / np.sqrt(12.0)
    i_m      = monthly_rate_from_annual(infl_a)

    months = years * 12
    paths = np.zeros((sims, months + 1), dtype=np.float64)
    for s in range(sims):
        bal = initial
        contrib = monthly
        paths[s, 0] = bal
        for m in range(1, months + 1):
            shock = np.random.normal(loc=r_m, scale=sigma_m)
            bal = bal * (1 + shock) + contrib
            paths[s, m] = bal

    # monthly percentiles
    p5  = np.percentile(paths, 5,  axis=0).tolist()
    p10 = np.percentile(paths, 10, axis=0).tolist()
    p50 = np.percentile(paths, 50, axis=0).tolist()
    p90 = np.percentile(paths, 90, axis=0).tolist()
    p95 = np.percentile(paths, 95, axis=0).tolist()

    # deflate to "real"
    deflate = np.cumprod(np.ones(months+1) * (1 + i_m))
    p5_real  = (np.array(p5)  / deflate).tolist()
    p10_real = (np.array(p10) / deflate).tolist()
    p50_real = (np.array(p50) / deflate).tolist()
    p90_real = (np.array(p90) / deflate).tolist()
    p95_real = (np.array(p95) / deflate).tolist()

    # annual snapshots (years + yearly_percentiles as your Risk page reads)
    years_arr = list(range(0, years + 1))
    idx = [y * 12 for y in years_arr]
    yearly_percentiles = [
        {"p5":  float(p5_real[i]), "p50": float(p50_real[i]), "p95": float(p95_real[i])}
        for i in idx
    ]

    return jsonify({
        "months": months,  # keep integer too (for other uses)
        "p5": p5_real, "p10": p10_real, "p50": p50_real, "p90": p90_real, "p95": p95_real,
        "ending": {"p5": p5_real[-1], "p50": p50_real[-1], "p95": p95_real[-1]},
        "years": years_arr,
        "yearly_percentiles": yearly_percentiles,
        "inputs": d
    })

# -------- Goal: required monthly contribution (deterministic OR MC) --------
@app.route("/api/goal/required-contribution", methods=["POST"])
@require_auth
def goal_required_contribution():
    d = request.get_json(force=True) or {}
    target = to_float(d.get("target", d.get("target_amount", 0)))
    years  = max(int(to_float(d.get("years", 0))), 0)
    initial= to_float(d.get("initial", 0))

    # If simulations + target_prob are present, do MC bisection to hit probability
    sims = int(to_float(d.get("simulations", 0)))
    target_prob = to_float(d.get("target_prob", 0))  # 0..1

    mean_a  = to_float(d.get("mean_annual_return_pct", d.get("annual_return_pct", 7)))
    stdev_a = to_float(d.get("stdev_annual_return_pct", 15))
    infl_a  = to_float(d.get("annual_inflation_pct", 2.5))
    fee_a   = to_float(d.get("annual_fee_pct", 0.0))

    if sims and target_prob:
        # --- Monte-Carlo solver ---
        r_m     = monthly_rate_from_annual(mean_a) - monthly_rate_from_annual(fee_a)
        sigma_m = (stdev_a / 100.0) / np.sqrt(12.0)
        i_m     = monthly_rate_from_annual(infl_a)
        months  = years * 12

        def success_rate(monthly_contrib: float, n_sims: int) -> float:
            paths_end = []
            for s in range(n_sims):
                bal = initial
                contrib = monthly_contrib
                for _m in range(1, months + 1):
                    shock = np.random.normal(loc=r_m, scale=sigma_m)
                    bal = bal * (1 + shock) + contrib
                real_ending = bal / ((1 + i_m) ** months)
                paths_end.append(real_ending)
            paths_end = np.array(paths_end)
            return float(np.mean(paths_end >= target))

        # bisection on monthly contribution
        lo, hi = 0.0, max(1.0, target / max(1, months//12))  # crude high bound
        # expand upper bound until success >= target_prob
        while success_rate(hi, max(200, sims//10)) < target_prob:
            hi *= 1.7
            if hi > target * 10:
                break
        # refine
        for _ in range(18):
            mid = (lo + hi) / 2.0
            rate = success_rate(mid, sims)
            if rate >= target_prob:
                hi = mid
            else:
                lo = mid
        required = hi
        return jsonify({
            "required_monthly": required,
            "used_simulations": sims,
            "method": "montecarlo",
            "inputs": d
        })

    # --- Deterministic closed-form (growing annuity) ---
    r_m   = monthly_rate_from_annual(mean_a - fee_a)
    i_m   = monthly_rate_from_annual(infl_a)
    esc_m = monthly_rate_from_annual(to_float(d.get("contribution_escalation_pct", 0.0)))
    months = years * 12
    if months == 0:
        return jsonify({"required_monthly": 0.0, "method": "deterministic", "inputs": d})

    target_real = target  # inputs already intended as "real"
    fv_without_pmt = initial * ((1 + r_m) ** months)
    need = max(target_real - fv_without_pmt, 0.0)

    if abs(r_m - esc_m) < 1e-9:
        denom = months * ((1 + r_m) ** (months - 1))
    else:
        denom = ((1 + r_m) ** months - (1 + esc_m) ** months) / (r_m - esc_m)
    pmt0 = need / denom if denom > 0 else 0.0
    return jsonify({
        "required_monthly": pmt0,
        "method": "deterministic",
        "inputs": d
    })

# -------- Stripe (unchanged minimal) --------
@app.route("/api/billing/create-checkout-session", methods=["POST"])
@require_auth
def billing_create_checkout_session():
    if not STRIPE_SECRET_KEY or not STRIPE_PRICE_MONTHLY:
        return json_error("Stripe not configured", 400)
    body = request.get_json(force=True) or {}
    success_url = body.get("success_url") or f"{FRONTEND_ORIGIN}/account?session=success"
    cancel_url = body.get("cancel_url") or f"{FRONTEND_ORIGIN}/account?session=cancel"
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": STRIPE_PRICE_MONTHLY, "quantity": 1}],
            success_url=success_url,
            cancel_url=cancel_url,
            allow_promotion_codes=True,
        )
        return jsonify({"id": session.id, "url": session.url})
    except Exception as e:
        return json_error(str(e), 400)

@app.route("/api/billing/create-portal-session", methods=["POST"])
@require_auth
def billing_create_portal_session():
    if not STRIPE_SECRET_KEY:
        return json_error("Stripe not configured", 400)
    body = request.get_json(force=True) or {}
    return_url = body.get("return_url") or f"{FRONTEND_ORIGIN}/account"
    customer = body.get("customer_id")
    if not customer:
        return json_error("customer_id required", 400)
    try:
        session = stripe.billing_portal.Session.create(customer=customer, return_url=return_url)
        return jsonify({"url": session.url})
    except Exception as e:
        return json_error(str(e), 400)

@app.route("/api/billing/session", methods=["GET"])
@require_auth
def billing_session():
    session_id = request.args.get("id")
    if not session_id:
        return json_error("id required", 400)
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return jsonify({"session": session})
    except Exception as e:
        return json_error(str(e), 400)

@app.route("/api/billing/status", methods=["GET"])
@require_auth
def billing_status():
    return jsonify({"active": False, "plan": None})

@app.route("/api/billing/webhook", methods=["POST"])
def billing_webhook():
    if not STRIPE_WEBHOOK_SECRET:
        return jsonify({"received": True})
    payload = request.data
    sig = request.headers.get("Stripe-Signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        return json_error(f"Webhook signature failed: {e}", 400)
    return jsonify({"received": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)

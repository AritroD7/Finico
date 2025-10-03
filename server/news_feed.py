# FILE: server/news_feed.py
import os, time, json, urllib.parse, urllib.request
from flask import Blueprint, jsonify

bp_news = Blueprint("bp_news", __name__, url_prefix="/api")

CACHE = {"ts": 0, "data": {"items": []}}
TTL_SECONDS = 15 * 60  # refresh every 15 minutes

def _http_get(url, timeout=8):
    req = urllib.request.Request(url, headers={"User-Agent": "FinicoNews/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "ignore")

def _from_finnhub():
    token = os.getenv("FINNHUB_TOKEN")
    if not token:
        return []
    url = f"https://finnhub.io/api/v1/news?category=general&token={token}"
    try:
        raw = json.loads(_http_get(url))
        items = []
        for it in raw[:20]:
            txt = it.get("headline") or it.get("summary") or ""
            href = it.get("url") or "#"
            items.append({"type": "marketUp", "text": txt[:140], "href": href})
        return items
    except Exception:
        return []

def _from_newsapi():
    key = os.getenv("NEWSAPI_KEY")
    if not key:
        return []
    q = urllib.parse.quote("personal finance OR investing OR budgeting OR inflation")
    url = f"https://newsapi.org/v2/everything?q={q}&language=en&sortBy=publishedAt&pageSize=20&apiKey={key}"
    try:
        raw = json.loads(_http_get(url))
        items = []
        for a in raw.get("articles", []):
            title = a.get("title") or ""
            href = a.get("url") or "#"
            items.append({"type": "article", "text": title[:140], "href": href})
        return items
    except Exception:
        return []

def _fallback_guides():
    return [
        {"type": "article", "text": "Sinking funds: the stress-free way to plan big expenses", "href": "/help"},
        {"type": "article", "text": "Nominal vs real returns: beating inflation the simple way", "href": "/help"},
        {"type": "article", "text": "The 50/30/20 rule — does it still make sense in 2025?", "href": "/help"},
    ]

def _load_news():
    items = _from_finnhub()
    if not items:
        items = _from_newsapi()
    if not items:
        items = _fallback_guides()
    # de-dup + truncate
    seen = set()
    unique = []
    for it in items:
        key = it["text"]
        if key in seen: 
            continue
        seen.add(key)
        unique.append(it)
    return unique[:24]

@bp_news.route("/news")
def get_news():
    now = time.time()
    if now - CACHE["ts"] > TTL_SECONDS or not CACHE["data"]["items"]:
        CACHE["data"] = {"items": _load_news()}
        CACHE["ts"] = now
    return jsonify(CACHE["data"])

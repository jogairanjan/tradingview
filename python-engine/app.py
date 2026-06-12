"""
Flask REST API for AI trading signal engine.
Runs on port 8000 by default.

Endpoints:
  GET  /health
  POST /api/generate-signal
  POST /api/batch-signals
"""

import logging
from datetime import datetime, timezone

from flask import Flask, jsonify, request

from config import Config
from signal_generator import get_generator

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
  """Health check endpoint for load balancers and monitoring."""
  return jsonify({
    "status": "ok",
    "service": "trading-signal-engine",
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "exchange": Config.EXCHANGE_ID,
    "version": "1.0.0",
  }), 200


@app.route("/api/generate-signal", methods=["POST"])
def generate_signal():
  """
  Generate a single trading signal.

  Request JSON:
    {
      "symbol": "BTC/USDT",      // required
      "timeframe": "1h",         // optional, default from config
      "market_type": "spot"      // optional: spot | future
    }
  """
  body = request.get_json(silent=True) or {}

  symbol = body.get("symbol")
  if not symbol:
    return jsonify({"error": "symbol is required"}), 400

  requested_tf = body.get("timeframe", Config.DEFAULT_TIMEFRAME)
  timeframe = Config.normalize_timeframe(requested_tf)
  market_type = body.get("market_type", Config.DEFAULT_MARKET_TYPE)

  try:
    generator = get_generator()
    signal = generator.generate(symbol, timeframe, market_type)
    signal["timeframe"] = requested_tf
    return jsonify({"success": True, "signal": signal}), 200
  except Exception as exc:
    logger.exception("generate-signal failed")
    return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/batch-signals", methods=["POST"])
def batch_signals():
  """
  Generate signals for multiple symbols.

  Request JSON:
    {
      "symbols": ["BTC/USDT", "ETH/USDT"],  // required
      "timeframe": "1h",                     // optional
      "market_type": "spot"                  // optional
    }
  """
  body = request.get_json(silent=True) or {}

  symbols = body.get("symbols")
  if not symbols or not isinstance(symbols, list):
    return jsonify({"error": "symbols must be a non-empty array"}), 400

  requested_tf = body.get("timeframe", Config.DEFAULT_TIMEFRAME)
  timeframe = Config.normalize_timeframe(requested_tf)
  market_type = body.get("market_type", Config.DEFAULT_MARKET_TYPE)

  try:
    generator = get_generator()
    signals = generator.generate_batch(symbols, timeframe, market_type)
    for signal in signals:
      signal["timeframe"] = requested_tf
    return jsonify({
      "success": True,
      "count": len(signals),
      "signals": signals,
    }), 200
  except Exception as exc:
    logger.exception("batch-signals failed")
    return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/tickers", methods=["POST"])
def tickers():
  """Live ticker quotes for watchlist / symbol bar."""
  from tickers import fetch_tickers, DEFAULT_SYMBOLS

  body = request.get_json(silent=True) or {}
  symbols = body.get("symbols") or DEFAULT_SYMBOLS
  market_type = body.get("market_type", Config.DEFAULT_MARKET_TYPE)

  try:
    data = fetch_tickers(symbols, market_type)
    return jsonify({"success": True, "data": data}), 200
  except Exception as exc:
    logger.exception("tickers failed")
    return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/chart-indicators", methods=["POST"])
def chart_indicators():
  """
  Compute OHLCV + indicator series (RSI, MACD, Bollinger, ADX, DMI) for chart UI.

  Request JSON:
    { "symbol": "BTC/USDT", "timeframe": "1h", "limit": 200 }
  """
  from indicator_series import compute_chart_indicators

  body = request.get_json(silent=True) or {}
  symbol = body.get("symbol")
  if not symbol:
    return jsonify({"error": "symbol is required"}), 400

  requested_tf = body.get("timeframe", Config.DEFAULT_TIMEFRAME)
  limit = int(body.get("limit", 200))

  try:
    payload = compute_chart_indicators(symbol, requested_tf, limit)
    return jsonify({"success": True, "data": payload}), 200
  except Exception as exc:
    logger.exception("chart-indicators failed")
    return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/custom-script/run", methods=["POST"])
def custom_script_run():
  """Run user-provided Python signal script."""
  from custom_script_runner import run_custom_script

  body = request.get_json(silent=True) or {}
  code = body.get("code")
  if not code:
    return jsonify({"error": "code is required"}), 400

  symbol = body.get("symbol", "BTC/USDT")
  requested_tf = body.get("timeframe", Config.DEFAULT_TIMEFRAME)
  timeframe = Config.normalize_timeframe(requested_tf)
  market_type = body.get("market_type", Config.DEFAULT_MARKET_TYPE)

  try:
    result = run_custom_script(code, symbol, timeframe, market_type)
    result["timeframe"] = requested_tf
    return jsonify({"success": True, "result": result}), 200
  except Exception as exc:
    logger.exception("custom-script failed")
    return jsonify({"success": False, "error": str(exc)}), 400


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
  logger.info("Starting signal engine on %s:%s", Config.FLASK_HOST, Config.FLASK_PORT)
  app.run(
    host=Config.FLASK_HOST,
    port=Config.FLASK_PORT,
    debug=Config.FLASK_DEBUG,
  )

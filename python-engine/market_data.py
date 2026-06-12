"""
Market data fetcher using ccxt with synthetic OHLCV fallback.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import ccxt
import numpy as np
import pandas as pd

from config import Config

logger = logging.getLogger(__name__)


def _get_exchange() -> ccxt.Exchange:
    """Build ccxt exchange instance from config."""
    exchange_class = getattr(ccxt, Config.EXCHANGE_ID, ccxt.binance)
    params = {"enableRateLimit": True}
    if Config.EXCHANGE_API_KEY:
        params["apiKey"] = Config.EXCHANGE_API_KEY
    if Config.EXCHANGE_API_SECRET:
        params["secret"] = Config.EXCHANGE_API_SECRET
    exchange = exchange_class(params)
    if Config.EXCHANGE_SANDBOX and hasattr(exchange, "set_sandbox_mode"):
        exchange.set_sandbox_mode(True)
    return exchange


def _normalize_symbol(symbol: str, market_type: str) -> str:
    """Normalize symbol to ccxt format (e.g. BTC/USDT)."""
    symbol = symbol.upper().replace("-", "/").replace("_", "/")
    if "/" not in symbol:
        symbol = f"{symbol}/USDT"
    return symbol


def _generate_synthetic_ohlcv(
    symbol: str,
    timeframe: str = "1h",
    limit: int = 200,
) -> pd.DataFrame:
    """
    Generate realistic synthetic OHLCV when exchange fetch fails.
    Uses geometric Brownian motion with volume correlation.
    """
    logger.warning("Using synthetic OHLCV for %s (%s)", symbol, timeframe)

    # Parse base price from symbol hint
    base_prices = {"BTC": 65000, "ETH": 3500, "SOL": 150, "BNB": 600}
    base_asset = symbol.split("/")[0] if "/" in symbol else symbol[:3]
    base_price = base_prices.get(base_asset, 100.0)

    # Timeframe to minutes
    tf_minutes = {
        "1m": 1, "5m": 5, "15m": 15, "30m": 30,
        "1h": 60, "4h": 240, "1d": 1440, "1w": 10080,
    }
    minutes = tf_minutes.get(timeframe, 60)
    now = datetime.utcnow()
    timestamps = [now - timedelta(minutes=minutes * i) for i in range(limit - 1, -1, -1)]

    np.random.seed(hash(symbol + timeframe) % (2**32))
    returns = np.random.normal(0.0002, 0.015, limit)
    closes = base_price * np.cumprod(1 + returns)

    opens = np.roll(closes, 1)
    opens[0] = base_price
    highs = np.maximum(opens, closes) * (1 + np.abs(np.random.normal(0, 0.005, limit)))
    lows = np.minimum(opens, closes) * (1 - np.abs(np.random.normal(0, 0.005, limit)))
    volumes = np.random.lognormal(10, 0.5, limit) * (1 + np.abs(returns) * 50)

    df = pd.DataFrame({
        "timestamp": timestamps,
        "open": opens,
        "high": highs,
        "low": lows,
        "close": closes,
        "volume": volumes,
    })
    df["symbol"] = symbol
    df["timeframe"] = timeframe
    df["source"] = "synthetic"
    return df


def fetch_ohlcv(
    symbol: str,
    timeframe: str = "1h",
    market_type: str = "spot",
    limit: Optional[int] = None,
) -> pd.DataFrame:
    """
    Fetch OHLCV candles from exchange via ccxt.
    Falls back to synthetic data on any failure.

    Returns DataFrame with columns:
    timestamp, open, high, low, close, volume, symbol, timeframe, source
    """
    limit = limit or Config.OHLCV_LIMIT
    timeframe = Config.normalize_timeframe(timeframe)
    symbol = _normalize_symbol(symbol, market_type)

    try:
        exchange = _get_exchange()
        if market_type == "future" and hasattr(exchange, "options"):
            exchange.options["defaultType"] = "future"

        ohlcv = exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
        if not ohlcv or len(ohlcv) < 30:
            raise ValueError(f"Insufficient OHLCV data: {len(ohlcv) if ohlcv else 0} bars")

        df = pd.DataFrame(
            ohlcv,
            columns=["timestamp_ms", "open", "high", "low", "close", "volume"],
        )
        df["timestamp"] = pd.to_datetime(df["timestamp_ms"], unit="ms", utc=True)
        df.drop(columns=["timestamp_ms"], inplace=True)
        df["symbol"] = symbol
        df["timeframe"] = timeframe
        df["source"] = "exchange"
        logger.info("Fetched %d bars for %s from %s", len(df), symbol, Config.EXCHANGE_ID)
        return df

    except Exception as exc:
        logger.error("Exchange fetch failed for %s: %s", symbol, exc)
        return _generate_synthetic_ohlcv(symbol, timeframe, limit)

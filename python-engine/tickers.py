"""Live ticker quotes via ccxt."""

import logging
from typing import Dict, List

from market_data import _get_exchange, _normalize_symbol

logger = logging.getLogger(__name__)

DEFAULT_SYMBOLS = [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
    "XRP/USDT", "ADA/USDT", "AVAX/USDT", "DOT/USDT",
]


def _format_volume(vol) -> str:
    if vol is None:
        return "—"
    v = float(vol)
    if v >= 1e9:
        return f"{v / 1e9:.1f}B"
    if v >= 1e6:
        return f"{v / 1e6:.0f}M"
    return f"{v:,.0f}"


def fetch_ticker(symbol: str, market_type: str = "spot") -> Dict:
    symbol = _normalize_symbol(symbol, market_type)
    try:
        exchange = _get_exchange()
        t = exchange.fetch_ticker(symbol)
        last = float(t.get("last") or t.get("close") or 0)
        pct = float(t.get("percentage") or 0)
        return {
            "symbol": symbol,
            "price": last,
            "change": round(pct, 2),
            "open": float(t.get("open") or last),
            "high": float(t.get("high") or last),
            "low": float(t.get("low") or last),
            "volume": _format_volume(t.get("quoteVolume") or t.get("baseVolume")),
        }
    except Exception as exc:
        logger.warning("Ticker fetch failed for %s: %s", symbol, exc)
        return {
            "symbol": symbol,
            "price": 0,
            "change": 0,
            "open": 0,
            "high": 0,
            "low": 0,
            "volume": "—",
        }


def fetch_tickers(symbols: List[str] = None, market_type: str = "spot") -> List[Dict]:
    symbols = symbols or DEFAULT_SYMBOLS
    return [fetch_ticker(s, market_type) for s in symbols]

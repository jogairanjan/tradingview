"""
Application configuration loaded from environment variables.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Optional — app still runs using system environment variables
    pass


class Config:
    """Central config for Flask app and signal engine."""

    # Flask
    FLASK_HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    FLASK_PORT = int(os.getenv("FLASK_PORT", "8000"))
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() in ("1", "true", "yes")

    # Exchange (ccxt)
    EXCHANGE_ID = os.getenv("EXCHANGE_ID", "binance")
    EXCHANGE_API_KEY = os.getenv("EXCHANGE_API_KEY", "")
    EXCHANGE_API_SECRET = os.getenv("EXCHANGE_API_SECRET", "")
    EXCHANGE_SANDBOX = os.getenv("EXCHANGE_SANDBOX", "false").lower() in ("1", "true", "yes")

    # Signal defaults
    DEFAULT_TIMEFRAME = os.getenv("DEFAULT_TIMEFRAME", "1h")
    DEFAULT_MARKET_TYPE = os.getenv("DEFAULT_MARKET_TYPE", "spot")
    OHLCV_LIMIT = int(os.getenv("OHLCV_LIMIT", "200"))
    MIN_CONFIDENCE = float(os.getenv("MIN_CONFIDENCE", "0.35"))

    # Risk / target levels (ATR-based)
    ATR_STOP_MULTIPLIER = float(os.getenv("ATR_STOP_MULTIPLIER", "1.5"))
    ATR_TARGET_1 = float(os.getenv("ATR_TARGET_1", "1.0"))
    ATR_TARGET_2 = float(os.getenv("ATR_TARGET_2", "2.0"))
    ATR_TARGET_3 = float(os.getenv("ATR_TARGET_3", "3.0"))

    # Supported ccxt kline intervals
    TIMEFRAME_MAP = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "1h": "1h",
        "4h": "4h",
        "1d": "1d",
        "1w": "1w",
    }

    # UI chart labels (incl. sub-minute) -> nearest ccxt interval
    TIMEFRAME_ALIASES = {
        "1s": "1m",
        "5s": "1m",
        "15s": "1m",
        "30s": "1m",
        "3m": "3m",
        "45m": "30m",
        "1H": "1h",
        "2H": "4h",
        "4H": "4h",
        "1D": "1d",
        "1W": "1w",
        "1M": "1d",
    }

    @classmethod
    def normalize_timeframe(cls, timeframe=None) -> str:
        """Map TradingView-style labels to a ccxt-supported interval."""
        raw = str(timeframe or cls.DEFAULT_TIMEFRAME).strip()
        if raw in cls.TIMEFRAME_ALIASES:
            return cls.TIMEFRAME_ALIASES[raw]
        lower = raw.lower()
        if lower in cls.TIMEFRAME_ALIASES:
            return cls.TIMEFRAME_ALIASES[lower]
        if lower in cls.TIMEFRAME_MAP:
            return cls.TIMEFRAME_MAP[lower]
        if raw in cls.TIMEFRAME_MAP:
            return cls.TIMEFRAME_MAP[raw]
        return cls.DEFAULT_TIMEFRAME

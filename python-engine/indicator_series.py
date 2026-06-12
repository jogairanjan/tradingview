"""
Compute chart-ready indicator time series for frontend lightweight-charts.
Uses pandas + ta library (same engine as signal generation).
"""

import logging
from typing import Any, Dict, List

import pandas as pd
import ta

from config import Config
from market_data import fetch_ohlcv
from indicators import add_all_indicators

logger = logging.getLogger(__name__)


def _to_unix(ts) -> int:
    if isinstance(ts, (int, float)):
        t = int(ts)
        return t // 1000 if t > 1_000_000_000_000 else t
    stamp = pd.Timestamp(ts)
    if stamp.tzinfo is None:
        stamp = stamp.tz_localize("UTC")
    else:
        stamp = stamp.tz_convert("UTC")
    return int(stamp.timestamp())


def _series_from_df(df: pd.DataFrame, col: str) -> List[Dict[str, Any]]:
    out = []
    if col not in df.columns:
        return out
    for ts, val in df[col].items():
        if pd.isna(val):
            continue
        out.append({"time": _to_unix(ts), "value": float(val)})
    return out


def _ohlcv_list(df: pd.DataFrame) -> List[Dict[str, Any]]:
    rows = []
    for ts, row in df.iterrows():
        t = _to_unix(ts)
        rows.append({
            "time": t,
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row.get("volume", 0)),
        })
    return rows


def compute_chart_indicators(symbol: str, timeframe: str = "1h", limit: int = 200) -> Dict[str, Any]:
    """Fetch OHLCV, compute indicators, return JSON-serializable series."""
    tf = Config.normalize_timeframe(timeframe)
    df = fetch_ohlcv(symbol, tf, limit=limit)
    if df is None or df.empty:
        raise ValueError(f"No market data for {symbol}")

    if "timestamp" in df.columns:
        df = df.set_index(pd.DatetimeIndex(df["timestamp"]))
    df = add_all_indicators(df)

    close = df["close"]
    high, low = df["high"], df["low"]

    # DMI (+DI / -DI) via ta
    df["dmi_plus"] = ta.trend.adx_pos(high, low, close, window=14)
    df["dmi_minus"] = ta.trend.adx_neg(high, low, close, window=14)

    macd_hist = df["macd_hist"].fillna(0)
    hist_colors = []
    for i, row in df.iterrows():
        t = _to_unix(i)
        v = float(row["macd_hist"]) if not pd.isna(row["macd_hist"]) else 0
        hist_colors.append({
            "time": t,
            "value": v,
            "color": "#26a69a" if v >= 0 else "#ef5350",
        })

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "source": "python-ta",
        "ohlcv": _ohlcv_list(df),
        "indicators": {
            "rsi": _series_from_df(df, "rsi"),
            "macd": {
                "line": _series_from_df(df, "macd"),
                "signal": _series_from_df(df, "macd_signal"),
                "histogram": hist_colors,
            },
            "bollinger": {
                "upper": _series_from_df(df, "bb_upper"),
                "middle": _series_from_df(df, "bb_middle"),
                "lower": _series_from_df(df, "bb_lower"),
            },
            "adx": _series_from_df(df, "adx"),
            "dmi": {
                "plus": _series_from_df(df, "dmi_plus"),
                "minus": _series_from_df(df, "dmi_minus"),
            },
        },
        "latest": {
            "rsi": float(df["rsi"].iloc[-1]) if not pd.isna(df["rsi"].iloc[-1]) else None,
            "adx": float(df["adx"].iloc[-1]) if not pd.isna(df["adx"].iloc[-1]) else None,
            "macd": float(df["macd"].iloc[-1]) if not pd.isna(df["macd"].iloc[-1]) else None,
        },
    }

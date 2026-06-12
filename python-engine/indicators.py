"""
Technical indicator calculations using the `ta` library.
Computes RSI, MACD, EMA, SMA, Bollinger Bands, ATR, volume metrics, and patterns.
"""

import logging
from typing import Dict, List

import numpy as np
import pandas as pd
import ta

logger = logging.getLogger(__name__)


def add_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Enrich OHLCV DataFrame with technical indicators.
    Mutates and returns the same DataFrame for chaining.
    """
    df = df.copy()
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]

    # --- Trend: EMA & SMA ---
    df["ema_9"] = ta.trend.ema_indicator(close, window=9)
    df["ema_21"] = ta.trend.ema_indicator(close, window=21)
    df["ema_50"] = ta.trend.ema_indicator(close, window=50)
    df["sma_20"] = ta.trend.sma_indicator(close, window=20)
    df["sma_50"] = ta.trend.sma_indicator(close, window=50)

    # --- Momentum: RSI & MACD ---
    df["rsi"] = ta.momentum.rsi(close, window=14)
    macd = ta.trend.MACD(close, window_slow=26, window_fast=12, window_sign=9)
    df["macd"] = macd.macd()
    df["macd_signal"] = macd.macd_signal()
    df["macd_hist"] = macd.macd_diff()

    # --- Volatility: Bollinger Bands & ATR ---
    bb = ta.volatility.BollingerBands(close, window=20, window_dev=2)
    df["bb_upper"] = bb.bollinger_hband()
    df["bb_middle"] = bb.bollinger_mavg()
    df["bb_lower"] = bb.bollinger_lband()
    df["bb_width"] = (df["bb_upper"] - df["bb_lower"]) / df["bb_middle"]
    df["atr"] = ta.volatility.average_true_range(high, low, close, window=14)

    # --- Volume ---
    df["volume_sma"] = volume.rolling(window=20).mean()
    df["volume_ratio"] = volume / df["volume_sma"].replace(0, np.nan)

    # --- ADX for trend strength ---
    df["adx"] = ta.trend.adx(high, low, close, window=14)

    # --- Candlestick pattern flags ---
    df = _add_candlestick_patterns(df)

    return df


def _add_candlestick_patterns(df: pd.DataFrame) -> pd.DataFrame:
    """Detect simple candlestick patterns on the last few bars."""
    o, h, l, c = df["open"], df["high"], df["low"], df["close"]
    body = (c - o).abs()
    upper_shadow = h - np.maximum(o, c)
    lower_shadow = np.minimum(o, c) - l
    range_hl = (h - l).replace(0, np.nan)

    # Doji: small body relative to range
    df["pattern_doji"] = (body / range_hl) < 0.1

    # Hammer: long lower shadow, small upper shadow, bullish close preferred
    df["pattern_hammer"] = (
        (lower_shadow > 2 * body)
        & (upper_shadow < body)
        & (c >= o)
    )

    # Shooting star: long upper shadow
    df["pattern_shooting_star"] = (
        (upper_shadow > 2 * body)
        & (lower_shadow < body)
        & (c <= o)
    )

    # Engulfing (bullish / bearish) on last bar vs previous
    prev_body_bull = c.shift(1) > o.shift(1)
    curr_body_bull = c > o
    prev_body_bear = c.shift(1) < o.shift(1)
    curr_body_bear = c < o

    df["pattern_bullish_engulfing"] = (
        prev_body_bear
        & curr_body_bull
        & (o < c.shift(1))
        & (c > o.shift(1))
    )
    df["pattern_bearish_engulfing"] = (
        prev_body_bull
        & curr_body_bear
        & (o > c.shift(1))
        & (c < o.shift(1))
    )

    return df


def compute_trend_strength(df: pd.DataFrame) -> float:
    """
    Trend strength score 0-1 based on EMA alignment and ADX.
    """
    last = df.iloc[-1]
    score = 0.0

    # EMA stack alignment
    if last["ema_9"] > last["ema_21"] > last["ema_50"]:
        score += 0.4
    elif last["ema_9"] < last["ema_21"] < last["ema_50"]:
        score -= 0.4

    # Price vs EMAs
    if last["close"] > last["ema_50"]:
        score += 0.2
    else:
        score -= 0.2

    # ADX contribution (normalized 0-1, cap at 50)
    adx = last.get("adx", 20)
    if not np.isnan(adx):
        adx_norm = min(float(adx) / 50.0, 1.0)
        direction = 1 if last["close"] > last["ema_21"] else -1
        score += direction * adx_norm * 0.4

    return float(np.clip(abs(score), 0, 1))


def compute_volatility(df: pd.DataFrame) -> float:
    """Normalized volatility from BB width and ATR."""
    last = df.iloc[-1]
    bb_w = last.get("bb_width", 0.04)
    atr_pct = last.get("atr", 0) / last["close"] if last["close"] else 0.02
    vol = (float(bb_w) + float(atr_pct)) / 2
    return float(np.clip(vol, 0, 1))


def get_active_indicators(df: pd.DataFrame) -> List[str]:
    """List indicator names that contributed to the latest bar signal context."""
    last = df.iloc[-1]
    active = ["RSI", "MACD", "EMA", "SMA", "Bollinger Bands", "Volume", "ATR", "ADX"]

    patterns = []
    if last.get("pattern_doji", False):
        patterns.append("Doji")
    if last.get("pattern_hammer", False):
        patterns.append("Hammer")
    if last.get("pattern_shooting_star", False):
        patterns.append("Shooting Star")
    if last.get("pattern_bullish_engulfing", False):
        patterns.append("Bullish Engulfing")
    if last.get("pattern_bearish_engulfing", False):
        patterns.append("Bearish Engulfing")

    if patterns:
        active.append("Candlestick: " + ", ".join(patterns))

    return active


def indicator_snapshot(df: pd.DataFrame) -> Dict:
    """Return latest indicator values for debugging / API enrichment."""
    last = df.iloc[-1]
    return {
        "rsi": round(float(last["rsi"]), 2) if not np.isnan(last["rsi"]) else None,
        "macd": round(float(last["macd"]), 4) if not np.isnan(last["macd"]) else None,
        "macd_signal": round(float(last["macd_signal"]), 4) if not np.isnan(last["macd_signal"]) else None,
        "ema_9": round(float(last["ema_9"]), 4),
        "ema_21": round(float(last["ema_21"]), 4),
        "ema_50": round(float(last["ema_50"]), 4),
        "sma_20": round(float(last["sma_20"]), 4),
        "bb_upper": round(float(last["bb_upper"]), 4),
        "bb_lower": round(float(last["bb_lower"]), 4),
        "adx": round(float(last["adx"]), 2) if not np.isnan(last.get("adx", np.nan)) else None,
        "atr": round(float(last["atr"]), 4),
        "volume_ratio": round(float(last["volume_ratio"]), 2) if not np.isnan(last.get("volume_ratio", np.nan)) else None,
    }

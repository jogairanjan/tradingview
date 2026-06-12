"""
AI trading signal generator.

Combines RSI, MACD, EMA/SMA trend, Bollinger Bands, volume, ADX trend strength,
and candlestick patterns into a weighted ensemble score.
Uses scikit-learn-style feature weighting (rule-based ensemble, no training required).
"""

import logging
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from config import Config
from indicators import (
    add_all_indicators,
    compute_trend_strength,
    compute_volatility,
    get_active_indicators,
    indicator_snapshot,
)
from market_data import fetch_ohlcv

logger = logging.getLogger(__name__)


class SignalGenerator:
    """
    Main signal engine: fetches data, computes indicators, scores BUY/SELL,
    and derives entry / stop-loss / take-profit levels from ATR.
    """

    # Feature weights for ensemble scoring (positive = bullish, negative = bearish)
    WEIGHTS = {
        "rsi": 0.15,
        "macd": 0.20,
        "ema_trend": 0.20,
        "sma_trend": 0.10,
        "bollinger": 0.12,
        "volume": 0.08,
        "adx_trend": 0.10,
        "candlestick": 0.05,
    }

    def __init__(self):
        self.scaler = MinMaxScaler(feature_range=(-1, 1))

    def generate(
        self,
        symbol: str,
        timeframe: Optional[str] = None,
        market_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a single trading signal for the given symbol.

        Returns dict matching API contract:
        pair, signal_type, entry_price, stop_loss, target_1/2/3,
        confidence_score, timeframe, trend_strength, volatility, indicators_used
        """
        timeframe = timeframe or Config.DEFAULT_TIMEFRAME
        market_type = market_type or Config.DEFAULT_MARKET_TYPE

        # 1. Fetch OHLCV (exchange or synthetic fallback)
        df = fetch_ohlcv(symbol, timeframe, market_type)
        pair = df["symbol"].iloc[0] if "symbol" in df.columns else symbol

        # 2. Compute all technical indicators
        df = add_all_indicators(df)
        df = df.dropna(subset=["rsi", "macd", "ema_50"]).reset_index(drop=True)

        if len(df) < 30:
            return self._neutral_signal(pair, timeframe, "Insufficient data after indicator warmup")

        # 3. Score features and determine signal direction
        scores = self._compute_feature_scores(df)
        raw_score = sum(scores.values())
        confidence = self._score_to_confidence(raw_score, scores)

        signal_type = "BUY" if raw_score > 0.05 else ("SELL" if raw_score < -0.05 else "HOLD")
        if signal_type == "HOLD":
            signal_type = "BUY" if raw_score >= 0 else "SELL"

        # 4. Price levels from ATR
        last = df.iloc[-1]
        entry = float(last["close"])
        atr = float(last["atr"]) if not np.isnan(last["atr"]) else entry * 0.02
        levels = self._price_levels(entry, atr, signal_type)

        trend_strength = compute_trend_strength(df)
        volatility = compute_volatility(df)

        return {
            "pair": pair,
            "signal_type": signal_type,
            "entry_price": round(entry, 6),
            "stop_loss": round(levels["stop_loss"], 6),
            "target_1": round(levels["target_1"], 6),
            "target_2": round(levels["target_2"], 6),
            "target_3": round(levels["target_3"], 6),
            "confidence_score": round(confidence, 4),
            "timeframe": timeframe,
            "trend_strength": round(trend_strength, 4),
            "volatility": round(volatility, 4),
            "indicators_used": get_active_indicators(df),
            "market_type": market_type,
            "data_source": df["source"].iloc[0] if "source" in df.columns else "unknown",
            "raw_score": round(raw_score, 4),
            "indicator_values": indicator_snapshot(df),
            "feature_scores": {k: round(v, 4) for k, v in scores.items()},
        }

    def generate_batch(
        self,
        symbols: List[str],
        timeframe: Optional[str] = None,
        market_type: Optional[str] = None,
    ) -> List[Dict]:
        """Generate signals for multiple symbols."""
        results = []
        for sym in symbols:
            try:
                results.append(self.generate(sym, timeframe, market_type))
            except Exception as exc:
                logger.exception("Batch signal failed for %s", sym)
                results.append({
                    "pair": sym,
                    "signal_type": "ERROR",
                    "error": str(exc),
                    "confidence_score": 0.0,
                })
        return results

    def _compute_feature_scores(self, df: pd.DataFrame) -> Dict[str, float]:
        """Compute normalized bullish (+) / bearish (-) scores per feature group."""
        last = df.iloc[-1]
        prev = df.iloc[-2]
        scores: Dict[str, float] = {}

        # RSI: oversold bullish, overbought bearish
        rsi = float(last["rsi"])
        if rsi < 30:
            scores["rsi"] = self.WEIGHTS["rsi"]
        elif rsi > 70:
            scores["rsi"] = -self.WEIGHTS["rsi"]
        else:
            scores["rsi"] = self.WEIGHTS["rsi"] * ((50 - rsi) / 50)

        # MACD: histogram crossover
        hist = float(last["macd_hist"])
        prev_hist = float(prev["macd_hist"])
        if hist > 0 and prev_hist <= 0:
            scores["macd"] = self.WEIGHTS["macd"]
        elif hist < 0 and prev_hist >= 0:
            scores["macd"] = -self.WEIGHTS["macd"]
        else:
            scores["macd"] = (
                self.WEIGHTS["macd"]
                * np.sign(hist)
                * min(abs(hist) / (abs(float(last["close"])) * 0.001 + 1e-9), 1)
            )

        # EMA trend alignment
        ema_bull = last["ema_9"] > last["ema_21"] > last["ema_50"]
        ema_bear = last["ema_9"] < last["ema_21"] < last["ema_50"]
        scores["ema_trend"] = (
            self.WEIGHTS["ema_trend"] if ema_bull
            else (-self.WEIGHTS["ema_trend"] if ema_bear else 0)
        )

        # SMA trend
        sma_bull = last["close"] > last["sma_20"] > last["sma_50"]
        sma_bear = last["close"] < last["sma_20"] < last["sma_50"]
        scores["sma_trend"] = (
            self.WEIGHTS["sma_trend"] if sma_bull
            else (-self.WEIGHTS["sma_trend"] if sma_bear else 0)
        )

        # Bollinger: mean reversion at bands
        close = float(last["close"])
        if close <= float(last["bb_lower"]):
            scores["bollinger"] = self.WEIGHTS["bollinger"]
        elif close >= float(last["bb_upper"]):
            scores["bollinger"] = -self.WEIGHTS["bollinger"]
        else:
            band_pos = (close - float(last["bb_lower"])) / (
                float(last["bb_upper"]) - float(last["bb_lower"]) + 1e-9
            )
            scores["bollinger"] = self.WEIGHTS["bollinger"] * (0.5 - band_pos)

        # Volume confirmation
        vol_ratio = float(last.get("volume_ratio", 1.0))
        if not np.isnan(vol_ratio) and vol_ratio > 1.2:
            direction = 1 if close > float(prev["close"]) else -1
            scores["volume"] = self.WEIGHTS["volume"] * direction
        else:
            scores["volume"] = 0.0

        # ADX trend direction
        adx = float(last.get("adx", 20))
        if not np.isnan(adx) and adx > 25:
            direction = 1 if last["close"] > last["ema_21"] else -1
            scores["adx_trend"] = self.WEIGHTS["adx_trend"] * direction * min(adx / 50, 1)
        else:
            scores["adx_trend"] = 0.0

        # Candlestick patterns
        cs_score = 0.0
        if last.get("pattern_hammer") or last.get("pattern_bullish_engulfing"):
            cs_score += self.WEIGHTS["candlestick"]
        if last.get("pattern_shooting_star") or last.get("pattern_bearish_engulfing"):
            cs_score -= self.WEIGHTS["candlestick"]
        scores["candlestick"] = cs_score

        return scores

    def _score_to_confidence(self, raw_score: float, scores: Dict[str, float]) -> float:
        """Map ensemble raw score to confidence 0-1."""
        magnitude = abs(raw_score)
        non_zero = [v for v in scores.values() if abs(v) > 0.01]
        if not non_zero:
            return 0.3
        same_sign = sum(1 for v in non_zero if np.sign(v) == np.sign(raw_score))
        agreement = same_sign / len(non_zero)
        confidence = min(magnitude * 2.5, 1.0) * (0.5 + 0.5 * agreement)
        return float(np.clip(confidence, 0.1, 0.99))

    def _price_levels(self, entry: float, atr: float, signal_type: str) -> Dict[str, float]:
        """Compute stop-loss and three take-profit targets using ATR multiples."""
        stop_dist = atr * Config.ATR_STOP_MULTIPLIER
        t1_dist = atr * Config.ATR_TARGET_1
        t2_dist = atr * Config.ATR_TARGET_2
        t3_dist = atr * Config.ATR_TARGET_3

        if signal_type == "BUY":
            return {
                "stop_loss": entry - stop_dist,
                "target_1": entry + t1_dist,
                "target_2": entry + t2_dist,
                "target_3": entry + t3_dist,
            }
        return {
            "stop_loss": entry + stop_dist,
            "target_1": entry - t1_dist,
            "target_2": entry - t2_dist,
            "target_3": entry - t3_dist,
        }

    def _neutral_signal(self, pair: str, timeframe: str, reason: str) -> Dict:
        return {
            "pair": pair,
            "signal_type": "HOLD",
            "entry_price": None,
            "stop_loss": None,
            "target_1": None,
            "target_2": None,
            "target_3": None,
            "confidence_score": 0.0,
            "timeframe": timeframe,
            "trend_strength": 0.0,
            "volatility": 0.0,
            "indicators_used": [],
            "reason": reason,
        }


_generator: Optional[SignalGenerator] = None


def get_generator() -> SignalGenerator:
    global _generator
    if _generator is None:
        _generator = SignalGenerator()
    return _generator

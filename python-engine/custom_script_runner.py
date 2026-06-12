"""
Execute user-submitted Python scripts in a restricted namespace.
Scripts receive: df (OHLCV DataFrame), indicators module, pandas, numpy.
Must assign: result = { signal_type, entry_price, stop_loss, target_1, confidence_score, ... }
"""

import logging
from typing import Any, Dict

import numpy as np
import pandas as pd

from market_data import fetch_ohlcv
import indicators as indicators_module

logger = logging.getLogger(__name__)

BLOCKED = ('import os', 'import sys', 'import subprocess', '__import__', 'open(', 'exec(', 'eval(')


def _validate_code(code: str) -> None:
    lowered = code.lower()
    for token in BLOCKED:
        if token in lowered:
            raise ValueError(f'Blocked operation: {token}')


def run_custom_script(code: str, symbol: str, timeframe: str, market_type: str = 'spot') -> Dict[str, Any]:
    _validate_code(code)

    df = fetch_ohlcv(symbol, timeframe, market_type)
    if df is None or df.empty:
        raise ValueError('No market data available for script')

    namespace = {
        'df': df,
        'pd': pd,
        'np': np,
        'pandas': pd,
        'numpy': np,
        'indicators': indicators_module,
        'symbol': symbol,
        'timeframe': timeframe,
        'result': None,
    }

    exec(code, {'__builtins__': __builtins__}, namespace)  # noqa: S102

    result = namespace.get('result')
    if not isinstance(result, dict):
        raise ValueError('Script must set result = {...} dict with signal fields')

    required = ('signal_type', 'entry_price', 'confidence_score')
    for key in required:
        if key not in result:
            raise ValueError(f'result must include "{key}"')

    result['pair'] = symbol
    result['timeframe'] = timeframe
    result['source'] = 'custom_script'
    return result

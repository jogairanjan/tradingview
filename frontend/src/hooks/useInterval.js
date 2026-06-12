import { useEffect, useRef } from 'react';

/**
 * Run callback on an interval. Pauses when delay is null/0.
 */
export function useInterval(callback, delay) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (delay == null || delay <= 0) return undefined;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

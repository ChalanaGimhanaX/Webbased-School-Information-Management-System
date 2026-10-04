import { useEffect, useState } from 'react';

/** Current time, refreshed periodically so "live period" badges and countdowns stay accurate. */
export function usePeriodClock(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}


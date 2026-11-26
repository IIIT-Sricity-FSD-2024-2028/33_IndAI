import { useEffect, useMemo, useState } from "react";
import { useResource } from "./api.js";
import { useSelector } from "react-redux";
import { makeSelectQuotes } from "../redux/selectors/index.js";

export function useCatalog() {
  return useResource("/trading/catalog", {
    staleTime: 3600000,
    refetchOnWindowFocus: false,
  });
}
// Fetch only selected/watchlisted instruments. The catalogue itself contains no quotes.
export function useMarket(symbols = []) {
  const keys = [...new Set(symbols)].sort();
  const path = keys.length
    ? "/trading/quotes?symbols=" + encodeURIComponent(keys.join(","))
    : null;
  const query = useResource(path, { refetchInterval: 2000, staleTime: 1000 });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!path) return;
    const timer = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(timer);
  }, [path]);
  const selectQuotes = useMemo(makeSelectQuotes, []);
  const data = useSelector((state) => selectQuotes(state, path, now));
  return { ...query, data };
}

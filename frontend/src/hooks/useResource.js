import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
export function useResource(path, initial = [], poll = 0) {
  const [data, setData] = useState(initial),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const value = await api(path);
        if (active) {
          setData(value);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        pending = false;
        if (active) setLoading(false);
      }
    }
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();
    let refreshTimer;
    const refresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(load, 120); };
    const focus = () => { if (!document.hidden) refresh(); };
    window.addEventListener("indai:data-changed", refresh);
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    const timer = setInterval(() => { if (!document.hidden) load(); }, poll || 15000);
    return () => {
      active = false;
      clearTimeout(refreshTimer);
      window.removeEventListener("indai:data-changed", refresh);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
      if (timer) clearInterval(timer);
    };
  }, [path, version, poll]);
  return { data, error, loading, reload, setData };
}

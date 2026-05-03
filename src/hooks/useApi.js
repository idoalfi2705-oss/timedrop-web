// src/hooks/useApi.js
// Hooks לקריאות API עם loading + error + cache

import { useState, useEffect, useCallback } from 'react';

// ── Generic fetch hook ────────────────────────────────
export function useApi(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Mutation hook (POST / PATCH / DELETE) ─────────────
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(payload);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { features, resourceKey, writerFor } from "./routes.js";
import { prepareRequest, discardRequest } from "./utilities/requests.js";
import { selectOperation, selectResource } from "./selectors/index.js";

export function useResourceSubscription(path, options = {}) {
  const key = resourceKey(path);
  const client = useId();
  const store = useStore();
  const version = useSelector((state) => state.session.version);
  const interval = options.refetchInterval || 0;
  const staleTime = options.staleTime ?? 1500;
  const focus = options.refetchOnWindowFocus !== false;
  const always = options.refetchOnMount === "always";
  useEffect(() => {
    if (!key || options.enabled === false) return;
    return store.runtime.subscribe(key, client, {
      interval,
      staleTime,
      focus,
      always,
    });
  }, [
    store,
    key,
    client,
    interval,
    staleTime,
    focus,
    always,
    options.enabled,
    version,
  ]);
  const refetch = useCallback(
    () => (key ? store.runtime.load(key, true) : Promise.resolve()),
    [store, key],
  );
  return refetch;
}
export function resourceResult(entry, refetch) {
  return {
    data: entry.data,
    error: entry.error,
    isPending:
      entry.data === undefined && ["idle", "pending"].includes(entry.status),
    isFetching: entry.status === "pending",
    isError:
      entry.status === "rejected" ||
      Boolean(entry.data !== undefined && entry.lastFailed),
    dataUpdatedAt: entry.updatedAt || 0,
    refetch,
  };
}
export function useReduxResource(path, options = {}) {
  const refetch = useResourceSubscription(path, options);
  const entry = useSelector((state) => selectResource(state, path));
  return resourceResult(entry, refetch);
}

export function useReduxAction() {
  const operationKey = useId();
  const keys = useRef(new Set());
  const [currentKey, setCurrentKey] = useState(operationKey);
  const dispatch = useDispatch();
  const store = useStore();
  const operation = useSelector((state) => selectOperation(state, currentKey));
  const reset = useCallback(() => {
    for (const key of keys.current) {
      for (const [domain, module] of Object.entries(features))
        dispatch(module[domain + "Actions"].clearOperation(key));
    }
    keys.current.clear();
  }, [dispatch]);
  useEffect(() => reset, [reset]);
  const mutateAsync = useCallback(
    async (request) => {
      const thunk = request.thunk || writerFor(request.path, request.method);
      const key =
        operationKey + ":" + (request.method || "POST") + ":" + request.path;
      keys.current.add(key);
      setCurrentKey(key);
      const prepared = prepareRequest({
        ...request,
        thunk: undefined,
        operationKey: key,
      });
      try {
        const promise = dispatch(thunk(prepared));
        const result = await promise.unwrap();
        await store.runtime.refreshes.get(promise.requestId);
        return result.data;
      } finally {
        discardRequest(prepared.token);
      }
    },
    [dispatch, store, operationKey],
  );
  const mutate = (request, callbacks = {}) => {
    mutateAsync(request).then(
      (data) => callbacks.onSuccess?.(data),
      (error) => callbacks.onError?.(error),
    );
  };
  return {
    mutateAsync,
    mutate,
    reset,
    data: operation.data,
    error: operation.error,
    isPending: operation.status === "pending",
    isError: operation.status === "rejected",
  };
}

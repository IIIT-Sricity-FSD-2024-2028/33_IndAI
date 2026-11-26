import { domainFor, readerFor } from "../routes.js";

// Timers, promises and subscriptions are per-store runtime objects, outside Redux.
export function createRuntime() {
  const runtime = {
    epoch: 0,
    transitioning: false,
    subscriptions: new Map(),
    inFlight: new Map(),
    refreshes: new Map(),
  };
  let store;
  runtime.connect = (value) => {
    store = value;
  };
  runtime.load = (path, force = false) => {
    if (runtime.inFlight.has(path)) return runtime.inFlight.get(path);
    const promise = store.dispatch(readerFor(path)({ path, force }));
    runtime.inFlight.set(path, promise);
    promise.finally(() => {
      if (runtime.inFlight.get(path) === promise) runtime.inFlight.delete(path);
    });
    return promise;
  };
  function schedule(path) {
    const group = runtime.subscriptions.get(path);
    if (!group) return;
    clearTimeout(group.timer);
    const intervals = [...group.clients.values()]
      .map((client) => client.interval)
      .filter((value) => value > 0);
    if (!intervals.length) return;
    group.timer = setTimeout(
      async () => {
        try {
          await runtime.load(path, true);
        } finally {
          if (runtime.subscriptions.get(path) === group) schedule(path);
        }
      },
      Math.min(...intervals),
    );
  }
  runtime.subscribe = (path, client, options = {}) => {
    let group = runtime.subscriptions.get(path);
    if (!group) {
      group = { clients: new Map() };
      runtime.subscriptions.set(path, group);
    }
    group.clients.set(client, options);
    const entry = store.getState()[domainFor(path)].resources[path];
    const stale =
      !entry?.updatedAt ||
      entry.invalidated ||
      Date.now() - entry.updatedAt >= (options.staleTime ?? 1500);
    if (stale || options.always) runtime.load(path, true);
    schedule(path);
    return () => {
      group.clients.delete(client);
      clearTimeout(group.timer);
      if (!group.clients.size) {
        runtime.subscriptions.delete(path);
        // Let an already-started request finish for StrictMode's immediate remount.
        // The global timeout bounds it, and session reset aborts obsolete requests.
      } else schedule(path);
    };
  };
  runtime.refresh = async (domains) => {
    const epoch = runtime.epoch;
    const paths = [...runtime.subscriptions.keys()].filter((path) =>
      domains.includes(domainFor(path)),
    );
    await Promise.all(
      paths.map(async (path) => {
        const running = runtime.inFlight.get(path);
        if (running) await running;
        if (epoch === runtime.epoch && runtime.subscriptions.has(path))
          await runtime.load(path, true);
      }),
    );
  };
  runtime.focus = () => {
    for (const [path, group] of runtime.subscriptions) {
      if (
        [...group.clients.values()].some((options) => options.focus !== false)
      )
        runtime.load(path);
    }
  };
  runtime.reset = () => {
    runtime.epoch++;
    for (const promise of runtime.inFlight.values()) promise.abort();
    runtime.inFlight.clear();
  };
  runtime.dispose = () => {
    runtime.reset();
    for (const group of runtime.subscriptions.values())
      clearTimeout(group.timer);
    runtime.subscriptions.clear();
  };
  return runtime;
}

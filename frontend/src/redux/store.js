import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { affectedDomains, features } from "./routes.js";
import theme from "./slices/themeSlice.js";
import { sessionReset, sessionExpired } from "./utilities/session.js";
import { createRuntime } from "./utilities/runtime.js";

const combined = combineReducers({
  ...Object.fromEntries(
    Object.entries(features).map(([name, module]) => [name, module.default]),
  ),
  theme,
  session: (state = { version: 0 }) => state,
});
function rootReducer(state, action) {
  if (sessionReset.match(action) || sessionExpired.match(action)) {
    const previous = state;
    state = combined(undefined, { type: "@@initialize" });
    state.theme = previous?.theme || state.theme;
    state.session = { version: (previous?.session.version || 0) + 1 };
    // Public deployment configuration is safe to keep through account changes.
    const config = previous?.dashboard.resources["/config"];
    if (config)
      state.dashboard = {
        ...state.dashboard,
        resources: { "/config": config },
      };
    if (sessionExpired.match(action))
      state.auth = {
        ...state.auth,
        resources: {
          "/me": { status: "rejected", error: action.payload, updatedAt: 0 },
        },
      };
    if (action.payload?.user)
      state.auth = {
        ...state.auth,
        resources: {
          "/me": {
            status: "fulfilled",
            data: action.payload.user,
            error: null,
            updatedAt: action.payload.updatedAt,
          },
        },
      };
  }
  return combined(state, action);
}

export function createAppStore() {
  const runtime = createRuntime();
  const coordination = (store) => (next) => (action) => {
    const type = action.type || "";
    if (/^auth\/(loginUser|verifyEmail)\/pending$/.test(type)) {
      store.dispatch(sessionReset());
      runtime.transitioning = true;
    }
    if (sessionReset.match(action) || sessionExpired.match(action))
      runtime.reset();
    const previousUser = store.getState().auth.resources["/me"]?.data;
    if (
      type === "auth/fetchCurrentUser/fulfilled" &&
      previousUser &&
      previousUser.id !== action.payload.data.id
    ) {
      store.dispatch(
        sessionReset({
          user: action.payload.data,
          updatedAt: action.payload.updatedAt,
        }),
      );
    }
    const result = next(action);
    if (/^auth\/(loginUser|verifyEmail)\/rejected$/.test(type))
      runtime.transitioning = false;
    if (type === "auth/logoutUser/fulfilled") {
      store.dispatch(sessionReset());
      return result;
    }
    if (
      type === "auth/fetchCurrentUser/rejected" &&
      action.payload?.status === 401 &&
      previousUser
    ) {
      store.dispatch(sessionExpired(action.payload));
    }
    // Only successful writes trigger related resources. A failed write never alters domain data.
    if (
      type.endsWith("/fulfilled") &&
      action.meta?.arg?.token &&
      !type.startsWith("auth/")
    ) {
      const domains = affectedDomains(action.meta.arg.path);
      for (const domain of domains)
        store.dispatch(features[domain][domain + "Actions"].invalidate());
      const refresh = runtime.refresh(domains);
      runtime.refreshes.set(action.meta.requestId, refresh);
      refresh.finally(() => runtime.refreshes.delete(action.meta.requestId));
    }
    if (type === "auth/resubmitApplication/fulfilled") {
      store.dispatch(features.auth.authActions.invalidate());
      runtime.refresh(["auth"]);
    }
    return result;
  };
  // Toolkit's default middleware includes Thunk, serializability and mutation checks.
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: runtime } }).concat(
        coordination,
      ),
    devTools: import.meta.env?.DEV ?? false,
  });
  runtime.connect(store);
  return Object.assign(store, { runtime });
}
// One primary application store; the factory gives tests isolated instances.
export const store = createAppStore();

export const emptyEntry = Object.freeze({
  status: "idle",
  data: undefined,
  error: null,
  updatedAt: 0,
});
export const initialResourceState = () => ({ resources: {}, operations: {} });

// URL keys keep different pages, filters, symbols and IDs independent.
export function setResource(state, { payload: { path, data, updatedAt = 0 } }) {
  state.resources[path] = {
    status: "fulfilled",
    data,
    error: null,
    updatedAt,
    invalidated: false,
    version: 0,
  };
}
export function invalidateResources(state) {
  for (const entry of Object.values(state.resources)) {
    entry.invalidated = true;
    entry.version = (entry.version || 0) + 1;
  }
}
export function clearError(state, { payload: key }) {
  if (state.resources[key]) state.resources[key].error = null;
  if (state.operations[key]) state.operations[key].error = null;
}
export function clearOperation(state, { payload }) {
  delete state.operations[payload];
}
export function readPending(state, action) {
  const path = action.meta.arg.path;
  const previous = state.resources[path] || emptyEntry;
  state.resources[path] = {
    ...previous,
    status: "pending",
    error: previous.error,
    requestId: action.meta.requestId,
    startedVersion: previous.version || 0,
  };
}
export function readFulfilled(state, action) {
  const entry = state.resources[action.meta.arg.path];
  if (!entry || entry.requestId !== action.meta.requestId) return;
  if ((entry.version || 0) !== entry.startedVersion) {
    entry.status = "idle";
    return;
  }
  Object.assign(entry, action.payload, {
    status: "fulfilled",
    error: null,
    lastFailed: false,
    invalidated: false,
  });
}
export function readRejected(state, action) {
  const entry = state.resources[action.meta.arg.path];
  if (!entry || entry.requestId !== action.meta.requestId) return;
  entry.status = action.meta.aborted
    ? entry.data === undefined
      ? "idle"
      : "fulfilled"
    : "rejected";
  entry.error = action.meta.aborted
    ? null
    : action.payload || { message: action.error.message };
  if (!action.meta.aborted) entry.lastFailed = true;
}
export function writePending(state, action) {
  state.operations[action.meta.arg.operationKey || action.meta.requestId] = {
    status: "pending",
    error: null,
    requestId: action.meta.requestId,
  };
}
export function writeFulfilled(state, action) {
  const entry =
    state.operations[action.meta.arg.operationKey || action.meta.requestId];
  if (entry?.requestId === action.meta.requestId)
    Object.assign(entry, action.payload, { status: "fulfilled", error: null });
}
export function writeRejected(state, action) {
  const entry =
    state.operations[action.meta.arg.operationKey || action.meta.requestId];
  if (entry?.requestId === action.meta.requestId)
    Object.assign(entry, {
      status: "rejected",
      error: action.payload || { message: action.error.message },
    });
}

// CRUD operates on authoritative, already-loaded lists; thunks refresh paginated
// or filtered collections after writes because most backend writes return {ok/id}.
function collectionRows(data, collection) {
  return collection
    ? data?.[collection]
    : Array.isArray(data)
      ? data
      : data?.members || data?.items;
}
export function addRow(state, { payload: { path, item, collection } }) {
  const rows = collectionRows(state.resources[path]?.data, collection);
  if (Array.isArray(rows) && !rows.some((row) => row.id === item.id))
    rows.push(item);
}
export function updateRow(state, { payload: { path, item, collection } }) {
  const entry = state.resources[path];
  const rows = collectionRows(entry?.data, collection);
  const index = Array.isArray(rows)
    ? rows.findIndex((row) => row.id === item.id)
    : -1;
  if (index >= 0) rows[index] = { ...rows[index], ...item };
  else if (!collection && entry?.data?.id === item.id)
    Object.assign(entry.data, item);
  else if (!collection && entry?.data?.user?.id === item.id)
    Object.assign(entry.data.user, item);
}
export function removeRow(state, { payload: { path, id, collection } }) {
  const entry = state.resources[path];
  const rows = collectionRows(entry?.data, collection);
  if (!Array.isArray(rows)) return;
  const index = rows.findIndex((row) => row.id === id);
  if (index >= 0) rows.splice(index, 1);
}

import { api } from "../../hooks/request.js";

// Credentials and File objects live only in this short-lived transport mailbox.
// Redux actions carry an opaque ID, never a password, secret or upload body.
const bodies = new Map();
let sequence = 0;
export function prepareRequest({ body, file, ...request }) {
  const token = "request-" + ++sequence;
  bodies.set(token, { body, file });
  return { ...request, token };
}
export function discardRequest(token) {
  bodies.delete(token);
}
export const serializableError = (error) => ({
  message: error?.message || "The request failed.",
  ...(error?.status ? { status: error.status } : {}),
  ...(error?.code ? { code: error.code } : {}),
  ...(error?.fields ? { fields: error.fields } : {}),
});

export async function readRequest({ path }, context) {
  const { extra, signal, rejectWithValue } = context;
  const epoch = extra.epoch;
  try {
    const data = await api(path, { signal });
    if (epoch !== extra.epoch)
      return rejectWithValue({
        message: "Session changed.",
        code: "OBSOLETE_REQUEST",
      });
    return { data, updatedAt: Date.now() };
  } catch (error) {
    return rejectWithValue(serializableError(error));
  }
}
export function readCondition(domain) {
  return ({ path, force = false }, { getState, extra }) => {
    const entry = getState()[domain].resources[path];
    return (
      !extra.transitioning &&
      entry?.status !== "pending" &&
      (force ||
        !entry?.updatedAt ||
        entry.invalidated ||
        Date.now() - entry.updatedAt >= 1500)
    );
  };
}
export async function writeRequest(request, context) {
  const content = bodies.get(request.token);
  bodies.delete(request.token);
  const epoch = context.extra.epoch;
  try {
    const data = await api(request.path, {
      method: request.method || "POST",
      ...content,
      signal: context.signal,
    });
    if (epoch !== context.extra.epoch)
      return context.rejectWithValue({
        message: "Session changed.",
        code: "OBSOLETE_REQUEST",
      });
    return { data, updatedAt: Date.now() };
  } catch (error) {
    return context.rejectWithValue(serializableError(error));
  }
}

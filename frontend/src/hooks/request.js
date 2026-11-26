// One transport for JSON requests and raw media uploads. Only Redux thunks call it.
export async function api(path, options = {}) {
  const method = options.method || "GET";
  const timeout = AbortSignal.timeout(options.file ? 120000 : 12000);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout;
  const file = options.file;
  const response = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    signal,
    headers:
      method === "GET"
        ? {}
        : file
          ? {
              "Content-Type": file.type,
              "X-IndAI-Request": "1",
              "X-File-Name": encodeURIComponent(file.name),
            }
          : { "Content-Type": "application/json", "X-IndAI-Request": "1" },
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : file || JSON.stringify(options.body ?? {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw Object.assign(new Error("The server returned an invalid response."), {
      status: response.status,
    });
  }
  if (!response.ok)
    throw Object.assign(
      new Error(data.message || "The request failed."),
      data,
      { status: response.status },
    );
  return data;
}

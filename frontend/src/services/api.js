let accessToken = sessionStorage.getItem("indai_token") || "";
let refreshPromise;
export const setToken = (value) => {
  accessToken = value || "";
  accessToken
    ? sessionStorage.setItem("indai_token", accessToken)
    : sessionStorage.removeItem("indai_token");
};
export async function api(path, method = "GET", body, retry = true) {
  const multipart = body instanceof FormData;
  const response = await fetch("/api" + path, {
    method,
    credentials: "include",
    headers: {
      ...(body && !multipart ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}),
    },
    body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
  });
  const payload = await response
    .json()
    .catch(() => ({ message: "Invalid server response" }));
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    refreshPromise ??= api("/auth/refresh", "POST", {}, false)
      .then((x) => {
        setToken(x.accessToken);
        return x;
      })
      .finally(() => {
        refreshPromise = null;
      });
    await refreshPromise;
    return api(path, method, body, false);
  }
  if (!response.ok || payload.success === false)
    throw Error(
      Array.isArray(payload.message)
        ? payload.message.join(" · ")
        : payload.message || payload.error || "Request failed",
    );
  if (!["GET", "HEAD"].includes(method) && !path.startsWith("/auth/")) {
    window.dispatchEvent(new CustomEvent("indai:data-changed", { detail: path }));
  }
  return payload.data ?? payload;
}
export const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export function download(name, data, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
export const csv = (rows) =>
  rows
    .map((r) =>
      r.map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"').join(","),
    )
    .join("\r\n");

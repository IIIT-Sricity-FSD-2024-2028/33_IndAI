import { useRef, useState } from "react";

import { useResource, useAction } from "../hooks/api.js";
import { Action, Empty, ErrorText, Result } from "./Common.jsx";

export function Resources({ kind, target, editable = false }) {
  const query = useResource("/resources/" + kind + "/" + target);
  const action = useAction();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const input = useRef(null);
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const extension = file.name.split(".").at(-1).toLowerCase();
    const mime = {
      pdf: "application/pdf",
      mp4: "video/mp4",
      webm: "video/webm",
    }[extension];
    if (!mime || file.size > 100 * 1024 * 1024 || file.size === 0) {
      setError(Error("Choose a PDF, MP4, or WebM file up to 100 MB."));
      event.target.value = "";
      return;
    }
    setBusy(true);
    try {
      await action.mutateAsync({
        path: "/resources/" + kind + "/" + target + "/upload",
        file: new File([file], file.name, { type: mime }),
      });
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <section className="resources" aria-label="Videos and materials">
      <h3>Videos & materials</h3>
      <Result query={query}>
        {(items) => (
          <>
            {items.map((item) => (
              <article className="resource-item" key={item.id}>
                <div className="line-item">
                  <a
                    className="text-link"
                    href={"/api/resource-files/" + item.id}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.name}
                  </a>
                  <small>{(item.size / 1024 / 1024).toFixed(1)} MB</small>
                </div>
                {item.mime.startsWith("video/") && (
                  <video
                    controls
                    preload="metadata"
                    src={"/api/resource-files/" + item.id}
                    aria-label={item.name}
                  />
                )}
                {editable && (
                  <Action
                    title="Remove resource"
                    path={"/resource-files/" + item.id}
                    method="DELETE"
                    confirm="Remove this resource from this item?"
                  />
                )}
              </article>
            ))}
            {!items.length && <p className="muted">No resources attached.</p>}
          </>
        )}
      </Result>
      {editable && (
        <label className="upload-label">
          Optional video or PDF
          <input
            ref={input}
            type="file"
            accept=".pdf,.mp4,.webm"
            disabled={busy}
            onChange={upload}
          />
          <small>
            {busy
              ? "Uploading…"
              : "PDF, MP4, or WebM · maximum 100 MB per file"}
          </small>
        </label>
      )}
      <ErrorText error={error} />
    </section>
  );
}

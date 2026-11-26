import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAction } from "../hooks/api.js";
import { Icon } from "./Icon.jsx";

export function Heading({ title, detail, children }) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        {detail && <p>{detail}</p>}
      </div>
      {children}
    </header>
  );
}
export const Status = ({ children }) => (
  <span className={"status status-" + String(children).toLowerCase()}>
    {String(children) === "basic"
      ? "Free"
      : String(children).replaceAll("-", " ")}
  </span>
);
export const Empty = ({ children }) => <div className="empty">{children}</div>;
export const ErrorText = ({ error }) =>
  error && (
    <div className="error" role="alert">
      {error.message}
      {error.fields && (
        <ul>
          {Object.entries(error.fields).map(([field, message]) => (
            <li key={field}>
              {field === "form" ? "" : field + " · "}
              {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
export function Result({ query, children }) {
  if (query.isPending)
    return (
      <p role="status" className="muted">
        Loading…
      </p>
    );
  if (query.isError && query.data === undefined)
    return (
      <>
        <ErrorText error={query.error} />
        <button onClick={() => query.refetch()} className="button secondary">
          Retry
        </button>
      </>
    );
  return (
    <>
      {query.isError && <ErrorText error={query.error} />}
      {children(query.data)}
    </>
  );
}
export function Pager({ page, setPage, more }) {
  return (
    <div className="pager">
      <button
        className="button secondary"
        disabled={!page}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <span>Page {page + 1}</span>
      <button
        className="button secondary"
        disabled={!more}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
export const PrimaryLink = ({ to, children }) => (
  <Link className="button" to={to}>
    {children}
    <Icon name="arrow" size={16} />
  </Link>
);
export function Form({
  fields,
  submit = "Save",
  onSubmit,
  initial,
  reset = false,
  secondary,
  children,
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset: clear,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: initial });
  const [error, setError] = useState(null);
  const send = handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit(values);
      if (reset) clear();
    } catch (failure) {
      setError(failure);
    }
  });
  return (
    <form className="form" onSubmit={send}>
      {(typeof fields === "function" ? fields(watch) : fields).map(
        ({
          name,
          label,
          type = "text",
          options,
          required = true,
          max,
          min,
          pattern,
          placeholder,
          step,
          autoComplete,
          shouldUnregister,
        }) => {
          const rules = {
            shouldUnregister,
            required: required ? "This field is required." : false,
            maxLength:
              type !== "number" && max
                ? {
                    value: max,
                    message: "Use " + max + " characters or fewer.",
                  }
                : undefined,
            minLength:
              min && type !== "number"
                ? {
                    value: min,
                    message: "Use at least " + min + " characters.",
                  }
                : undefined,
            min: type === "number" ? min : undefined,
            max: type === "number" ? max : undefined,
            pattern,
          };
          const props = {
            id: undefined,
            "aria-invalid": Boolean(errors[name] || error?.fields?.[name]),
            placeholder,
            autoComplete,
            maxLength: type === "number" ? undefined : max,
            min: type === "number" ? min : undefined,
            max: type === "number" ? max : undefined,
            step,
            required,
            ...register(name, rules),
          };
          return (
            <label key={name}>
              {label}
              {options ? (
                <select {...props}>
                  {options.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea rows="3" {...props} />
              ) : (
                <input type={type} {...props} />
              )}
              {(errors[name]?.message || error?.fields?.[name]) && (
                <small className="field-error">
                  {errors[name]?.message || error.fields[name]}
                </small>
              )}
            </label>
          );
        },
      )}
      {children}
      <ErrorText error={error} />
      <div className="actions">
        <button className="button" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submit}
        </button>
        {secondary}
      </div>
    </form>
  );
}
export function Action({
  path,
  body,
  method,
  title,
  confirm,
  onDone,
  className = "secondary",
}) {
  const mutation = useAction();
  return (
    <span className="inline-action">
      <button
        className={"button " + className}
        disabled={mutation.isPending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          mutation.mutate({ path, body, method }, { onSuccess: onDone });
        }}
      >
        {mutation.isPending ? "Working…" : title}
      </button>
      {mutation.isError && <ErrorText error={mutation.error} />}
    </span>
  );
}
export const select = (values) =>
  values.map((value) => ({
    value,
    label:
      value === "basic"
        ? "Free"
        : value.charAt(0).toUpperCase() + value.slice(1),
  }));

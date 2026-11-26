import { useEffect, useRef, useState } from "react";
import { useAction } from "../hooks/api.js";
import { Form, Status } from "./Common.jsx";
import { Icon } from "./Icon.jsx";

export const roleLabels = {
  student: "Learner",
  instructor: "Instructor",
  provider: "Course provider",
  admin: "Admin",
  superadmin: "Super Admin",
};
export const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export function ProfileDialog({ user, onClose }) {
  const dialog = useRef(null);
  const action = useAction();
  const [changed, setChanged] = useState(false);
  const canChange = ["student", "instructor", "provider"].includes(user.role);
  useEffect(() => {
    const panel = dialog.current;
    const trigger = document.activeElement;
    panel.showModal();
    return () => {
      panel.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="trade-dialog profile-dialog"
      aria-labelledby="profile-heading"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="profile-content">
        <header className="profile-header">
          <span className="profile-avatar" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div>
            <small>My profile</small>
            <h2 id="profile-heading">{user.name}</h2>
            <Status>{roleLabels[user.role]}</Status>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close profile"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </header>
        <dl className="profile-details">
          <div>
            <dt>Email address</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd>
              <Status>{user.status}</Status>
            </dd>
          </div>
          {user.plan && (
            <div>
              <dt>Learning plan</dt>
              <dd>
                <Status>{user.plan}</Status>
              </dd>
            </div>
          )}
        </dl>
        {canChange && (
          <section className="profile-security">
            <details
              onToggle={(event) => {
                if (event.currentTarget.open) setChanged(false);
              }}
            >
              <summary>Change password</summary>
              <Form
                reset
                fields={[
                  {
                    name: "currentPassword",
                    label: "Current password",
                    type: "password",
                    autoComplete: "current-password",
                    max: 128,
                  },
                  {
                    name: "password",
                    label: "New password",
                    type: "password",
                    autoComplete: "new-password",
                    min: 12,
                    max: 128,
                  },
                  {
                    name: "confirmation",
                    label: "Confirm new password",
                    type: "password",
                    autoComplete: "new-password",
                    min: 12,
                    max: 128,
                  },
                ]}
                submit="Update password"
                onSubmit={async (body) => {
                  setChanged(false);
                  await action.mutateAsync({
                    path: "/auth/change-password",
                    body,
                  });
                  setChanged(true);
                }}
              />
            </details>
            {changed && (
              <p className="notice" role="status">
                Password updated. Other sessions were signed out.
              </p>
            )}
          </section>
        )}
      </div>
    </dialog>
  );
}

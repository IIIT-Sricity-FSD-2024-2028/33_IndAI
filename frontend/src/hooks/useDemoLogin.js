import { useRef, useState } from "react";
import { useAction } from "./api.js";
import { loginUser } from "../redux/slices/authSlice.js";

export function useDemoLogin(onSuccess) {
  const active = useRef(false);
  const action = useAction();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  async function signIn(account) {
    if (active.current) return;
    active.current = true;
    setPending(account.email);
    setError(null);
    try {
      await action.mutateAsync({
        path: "/auth/login",
        thunk: loginUser,
        method: "POST",
        body: { email: account.email, password: "IndAI-Demo-2026" },
      });
      await onSuccess();
    } catch (failure) {
      setError(failure);
    } finally {
      active.current = false;
      setPending(null);
    }
  }

  return { signIn, pending, error };
}

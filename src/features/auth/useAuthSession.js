import { useEffect, useState } from "react";
import {
  clearStoredUser,
  fetchCurrentUser,
} from "../../services/auth.js";

export function useAuthSession() {
  const [session, setSession] = useState({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    let active = true;
    clearStoredUser();

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setSession({ status: "authenticated", user });
      })
      .catch(() => {
        if (!active) return;
        clearStoredUser();
        setSession({ status: "unauthenticated", user: null });
      });

    return () => {
      active = false;
    };
  }, []);

  return session;
}

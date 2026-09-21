import { useEffect, useState } from "react";
import {
  clearStoredUser,
  fetchCurrentUser,
  getStoredUser,
  storeUser,
} from "../../services/auth.js";

export function useAuthSession() {
  const [session, setSession] = useState(() => ({
    status: "loading",
    user: getStoredUser(),
  }));

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        storeUser(user);
        setSession({ status: "authenticated", user });
      })
      .catch((error) => {
        if (!active) return;

        if (error?.status === 401 || error?.status === 403) {
          clearStoredUser();
          setSession({ status: "unauthenticated", user: null });
          return;
        }

        setSession((current) => ({
          status: "error",
          user: current.user,
        }));
      });

    return () => {
      active = false;
    };
  }, []);

  return session;
}

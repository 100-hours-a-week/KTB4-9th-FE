import { useEffect, useState } from "react";
import {
  clearStoredUser,
  fetchCurrentUser,
  storeUser,
} from "../../services/auth.js";

export function useAuthSession() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        storeUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        clearStoredUser();
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  return status;
}

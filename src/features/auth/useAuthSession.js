import { useCallback, useEffect, useState } from "react";
import {
  cancelAccountWithdrawal,
  clearStoredUser,
  fetchCurrentUser,
} from "../../services/auth.js";

export function useAuthSession() {
  const [session, setSession] = useState({
    status: "loading",
    user: null,
  });

  const loadSession = useCallback(async () => {
    const user = await fetchCurrentUser();
    setSession({
      status: user.withdrawalPending ? "withdrawal-pending" : "authenticated",
      user,
    });
    return user;
  }, []);

  const recoverWithdrawal = useCallback(async () => {
    await cancelAccountWithdrawal();
    return loadSession();
  }, [loadSession]);

  useEffect(() => {
    let active = true;
    clearStoredUser();

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setSession({
          status: user.withdrawalPending ? "withdrawal-pending" : "authenticated",
          user,
        });
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

  return {
    ...session,
    recoverWithdrawal,
  };
}

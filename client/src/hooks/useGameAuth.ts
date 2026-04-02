import { trpc } from "@/lib/trpc";
import { useMemo, useCallback } from "react";

export type GameProfile = {
  id: number;
  pseudo: string;
  email: string;
  createdAt: Date;
};

export function useGameAuth() {
  const meQuery = trpc.gameAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const registerMutation = trpc.gameAuth.register.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const loginMutation = trpc.gameAuth.login.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const logoutMutation = trpc.gameAuth.logout.useMutation({
    onSuccess: () => {
      meQuery.refetch();
    },
  });

  const profile = meQuery.data ?? null;
  const isAuthenticated = !!profile;
  const loading = meQuery.isLoading;

  const register = useCallback(
    async (pseudo: string, email: string, password: string) => {
      return registerMutation.mutateAsync({ pseudo, email, password });
    },
    [registerMutation]
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      return loginMutation.mutateAsync({ identifier, password });
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      profile,
      isAuthenticated,
      loading,
      register,
      login,
      logout,
      registerLoading: registerMutation.isPending,
      loginLoading: loginMutation.isPending,
      logoutLoading: logoutMutation.isPending,
    }),
    [profile, isAuthenticated, loading, register, login, logout, registerMutation.isPending, loginMutation.isPending, logoutMutation.isPending]
  );
}

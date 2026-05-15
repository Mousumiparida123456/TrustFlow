import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { useGetSession, getGetSessionQueryKey, useLogout } from "@workspace/api-client-react";
import type { SessionInfo } from "@workspace/api-client-react/src/generated/api.schemas";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  session: SessionInfo | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem("trustflow_session")
  );
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useGetSession({
    query: {
      enabled: !!sessionToken,
      queryKey: getGetSessionQueryKey(),
      retry: false,
    },
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  const logoutMutation = useLogout({
    request: {
      headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
    }
  });

  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem("trustflow_session", sessionToken);
    } else {
      localStorage.removeItem("trustflow_session");
    }
  }, [sessionToken]);

  const login = (token: string) => {
    setSessionToken(token);
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await logoutMutation.mutateAsync();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSessionToken(null);
      queryClient.setQueryData(getGetSessionQueryKey(), null);
      setLocation("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ session: session ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

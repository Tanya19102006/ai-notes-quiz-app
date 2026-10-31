// useContext: login state shared by every component
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem("email"));

  const login = useCallback((token, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    setUser(email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  }, []);

  // api.js fires this event when the server says the token is invalid
  useEffect(() => {
    window.addEventListener("auth-expired", logout);
    return () => window.removeEventListener("auth-expired", logout);
  }, [logout]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

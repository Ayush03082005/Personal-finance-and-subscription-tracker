import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("fintrack_token");
      try {
        if (token) {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } else {
          // If no token in local storage, check if cookie works or auto-login with demo for instant test
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
          }
        }
      } catch (err) {
        // Not logged in or invalid token
        localStorage.removeItem("fintrack_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("fintrack_token", res.data.token);
      }
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, currency = "$") => {
    const res = await authAPI.register({ name, email, password, currency });
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("fintrack_token", res.data.token);
      }
      setUser(res.data.user);
    }
    return res.data;
  };

  const demoLogin = async () => {
    const res = await authAPI.demoLogin();
    if (res.data.success) {
      if (res.data.token) {
        localStorage.setItem("fintrack_token", res.data.token);
      }
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("fintrack_token");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    if (res.data.success) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  };

  const currency = user?.currency || "$";

  const formatAmount = (val) => {
    const num = Number(val) || 0;
    return `${currency}${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        currency,
        formatAmount,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

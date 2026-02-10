// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef(null);
  const isRefreshing = useRef(false);

  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  // Setup axios interceptor for automatic token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        config.withCredentials = true;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log("🔄 Auto-refreshing token due to 401 error");
            const success = await refreshToken();
            if (success) {
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error("❌ Auto-refresh failed, logging out");
            await logout();
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401) {
          await logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const refreshToken = async () => {
    if (isRefreshing.current) {
      console.log("⏳ Refresh already in progress, waiting...");
      return new Promise((resolve) => {
        const checkRefreshing = setInterval(() => {
          if (!isRefreshing.current) {
            clearInterval(checkRefreshing);
            resolve(true);
          }
        }, 100);
      });
    }

    try {
      isRefreshing.current = true;
      console.log("🔄 Refreshing token via /refresh-token endpoint...");

      const response = await fetch(`${API_BASE}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Refresh token response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Token refreshed successfully");

        setAuth((prev) => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
        }));

        // Schedule next refresh after successful refresh
        scheduleTokenRefresh();
        return true;
      } else {
        const errorText = await response.text();
        console.error("❌ Token refresh failed:", response.status, errorText);
        throw new Error(`Refresh failed: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      return false;
    } finally {
      isRefreshing.current = false;
    }
  };

  const scheduleTokenRefresh = () => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule refresh after 40 minutes (not immediately)
    refreshTimeoutRef.current = setTimeout(() => {
      console.log("⏰ 40 minutes passed - Proactively refreshing token...");
      refreshToken().catch((error) => {
        console.error("Proactive refresh failed:", error);
      });
    }, 2400000); // 40 minutes = 2,400,000 ms

    console.log("📅 Next token refresh scheduled in 40 minutes");
  };

  const startPeriodicTokenCheck = () => {
    // This function can be used if you want periodic checks (every minute)
    // but separate from the main refresh logic
    console.log("🔍 Starting periodic token health check (every minute)");

    // This would be a separate interval for health checks, not for actual refreshes
    // For now, we'll keep only the 40-minute refresh
  };

  const stopTokenRefresh = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
      console.log("🛑 Token refresh scheduling stopped");
    }
  };

  // Check auth status on initial app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking auth status on app load...");
        const response = await fetch(`${API_BASE}/api/auth/check-me`, {
          credentials: "include",
        });

        if (response.status === 401) {
          console.log("🔄 Token might be expired, attempting refresh...");
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            throw new Error("Refresh failed");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        const data = await response.json();
        console.log("✅ Auth Check successful - User is authenticated");

        setAuth({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });

        // Schedule refresh only after successful auth check
        scheduleTokenRefresh();
      } catch (err) {
        console.error("Auth check error:", err);
        setAuth({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        const publicRoutes = ["/", "/privacy"];

        if (!publicRoutes.includes(window.location.pathname)) {
          navigate("/");
        }
      }
    };

    checkAuth();

    return () => {
      stopTokenRefresh();
    };
  }, [navigate]);

  // Login function
  const login = async (credentials) => {
    try {
      console.log("🔐 Attempting login...");
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Login successful");

        setAuth({
          user: data.user,
          isAuthenticated: true,
          loading: false,
        });

        // Schedule refresh after login (will refresh after 40 minutes)
        scheduleTokenRefresh();

        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "super-admin") {
          navigate("/superAdmin");
        } else {
          navigate("/dashboard");
        }
      } else {
        console.error("❌ Login failed:", data.message);
      }

      return { ok: res.ok, data };
    } catch (error) {
      console.error("🚨 Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    console.log("🚪 Logging out...");

    // Stop any scheduled refreshes
    stopTokenRefresh();

    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("✅ Server logout successful");
    } catch (error) {
      console.error("❌ Server logout error:", error);
    } finally {
      setAuth({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      navigate("/");
      console.log("✅ Client logout complete");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        login,
        logout,
        refreshToken,
        scheduleTokenRefresh,
        stopTokenRefresh,
      }}
    >
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };

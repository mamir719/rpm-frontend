// src/components/ProtectedRoute.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { auth, refreshToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      // If not authenticated and not loading, try to refresh token once
      if (!auth.isAuthenticated && !auth.loading) {
        const refreshSuccess = await refreshToken();

        // If refresh also fails, redirect to login
        if (!refreshSuccess && location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      }
    };

    checkAuthentication();
  }, [
    auth.isAuthenticated,
    auth.loading,
    refreshToken,
    navigate,
    location.pathname,
  ]);

  // Show loading spinner while checking auth
  if (auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return auth.isAuthenticated ? children : null;
};

export default ProtectedRoute;

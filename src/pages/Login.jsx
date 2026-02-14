// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

// Assets
import loginImage from "../assets/login-image.png";
import logo from "../assets/infuzamed_logo.png";
import ThemeToggle from "../components/ThemeToggle";

// Icons
import { Eye, EyeOff } from "lucide-react";

// const API_BASE =

const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { auth } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      console.log("User already authenticated, redirecting...");

      const userRole = auth.user?.role;
      if (userRole === "admin") {
        navigate("admin", { replace: true });
      } else if (userRole === "super-admin") {
        navigate("superAdmin", { replace: true });
      } else {
        navigate("dashboard", { replace: true });
      }
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  // Apply theme and prevent scrolling
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    // Prevent scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [theme]);

  // Countdown effect for OTP
  useEffect(() => {
    let timer;
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (step === "otp" && timeLeft === 0) {
      setStep("login");
      setOtp("");
      setError("OTP expired. Please login again.");
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const detectLoginMethod = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier) ? "email" : "username";
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    const method = detectLoginMethod(identifier);

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/login`,
        {
          identifier,
          password,
          method,
        },
        {
          withCredentials: true,
        }
      );

      if (method === "email") {
        setStep("otp");
      } else {
        handleDirectLogin(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = (data) => {
    if (data.user) {
      const userData = data.user;
      navigateBasedOnRole(userData.role);
    } else {
      setError("Authentication failed. Please try again.");
    }
  };

  const navigateBasedOnRole = (role) => {
    if (role === "admin") navigate("admin", { replace: true });
    else if (role === "clinician") navigate("dashboard", { replace: true });
    else if (role === "super-admin") navigate("superAdmin", { replace: true });
    else setError("Access Denied. Unauthorized role.");
  };

  const handleOtpVerify = async () => {
    try {
      setError("");
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE}/api/auth/verify-otp`,
        {
          email: identifier,
          otp,
          device_fingerprint: "unique-browser-hash",
        },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.user) {
        const userData = response.data.user;
        navigateBasedOnRole(userData.role);
      } else {
        setError(response.data.message || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading while checking authentication
  if (auth.loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0A0F12] dark:to-[#1a1f2e] transition-colors overflow-hidden items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if authenticated (will redirect in useEffect)
  if (auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0A0F12] dark:to-[#1a1f2e] transition-colors overflow-hidden items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0A0F12] dark:to-[#1a1f2e] transition-colors overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#95d6f0] via-[#7bc8e8] to-[#103c63] opacity-90"></div>
        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <img
            src={loginImage}
            alt="Medical monitoring"
            className="w-full max-w-xs object-contain"
          />
          <div className="mt-4 text-center text-white">
            <h3 className="text-xl font-bold mb-2">
              Remote Patient Monitoring
            </h3>
            <p className="text-sm opacity-90">
              Advanced healthcare monitoring system
            </p>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="bg-white/90 dark:bg-[#1A2226]/95 backdrop-blur-sm shadow-xl rounded-2xl p-8 w-full max-w-sm border border-white/20 dark:border-gray-700/50">
          {step === "login" ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-40 h-20 object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-[#103c63] dark:text-white">
                  Welcome 22 RPM
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                  Sign in to your account
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Enter username or email"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-12 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-xs text-center">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full bg-[#103c63] hover:bg-[#0e2e4f] text-white py-3 rounded-lg font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                  OTP Verification
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  Enter code sent to your email
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    Sent to:
                  </p>
                  <p className="font-medium text-blue-600 dark:text-blue-400 text-sm mt-1 break-all">
                    {identifier}
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center tracking-[0.3em] font-medium bg-white/50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                    placeholder="••••••"
                    onKeyPress={(e) => e.key === "Enter" && handleOtpVerify()}
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Time left:{" "}
                    <span
                      className={`font-mono font-bold ${
                        timeLeft < 60
                          ? "text-red-500"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                </div>

                {error && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-xs text-center">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleOtpVerify}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep("login");
                    setOtp("");
                    setError("");
                  }}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 transition text-sm"
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

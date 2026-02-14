// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

// Assets
import logo from "../assets/1.png";
import ThemeToggle from "../components/ThemeToggle";

// Icons
import { Eye, EyeOff } from "lucide-react";

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

  /* ----------------------- ALL LOGIC BELOW IS UNCHANGED ----------------------- */

  useEffect(() => {
    if (auth.isAuthenticated) {
      const userRole = auth.user?.role;
      if (userRole === "admin") navigate("admin", { replace: true });
      else if (userRole === "super-admin") navigate("superAdmin", { replace: true });
      else navigate("dashboard", { replace: true });
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);

    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [theme]);

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

  const detectLoginMethod = (identifier) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? "email" : "username";

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    const method = detectLoginMethod(identifier);

    try {
      const response = await axios.post(
        `${API_BASE}/api/auth/login`,
        { identifier, password, method },
        { withCredentials: true }
      );

      if (method === "email") setStep("otp");
      else handleDirectLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = (data) => {
    if (data.user) navigateBasedOnRole(data.user.role);
    else setError("Authentication failed. Please try again.");
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
        { email: identifier, otp, device_fingerprint: "unique-browser-hash" },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.user)
        navigateBasedOnRole(response.data.user.role);
      else setError("Invalid OTP");
    } catch (err) {
      setError("OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (auth.loading || auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-teal-600 rounded-full" />
      </div>
    );
  }

  /* ---------------------------- DESIGN STARTS HERE ---------------------------- */

  return (
    <div className="min-h-screen flex font-sans">

      {/* LEFT PANEL */}
      <div className="relative w-full lg:w-1/2 bg-white">
        <div className="absolute top-8 left-10">
          <img src={logo} alt="VITA RPM" className="h-30" />
        </div>

        <div className="min-h-screen flex items-center justify-center px-10">
          <div className="w-full max-w-md">

            {step === "login" ? (
              <>
                <h1 className="text-3xl font-semibold text-gray-900">
                  Welcome Back!
                </h1>
                <p className="text-gray-500 mt-2 mb-10 text-lg">
                  Sign in to access your RPM dashboard
                </p>

                <div className="space-y-6">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email"
                    className="w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-teal-700"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-5 py-4 border rounded-lg focus:ring-2 focus:ring-teal-700"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-4 text-gray-400"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  {/* Forgot Password - Moved above Sign In button */}
                  <p className="text-right text-sm text-[#023d3d] cursor-pointer">
                    Forgot Password?
                  </p>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-[#023d3d] text-white py-4 rounded-lg text-lg font-medium"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-semibold">OTP Verification</h1>
                <p className="text-gray-500 mt-2 mb-8">
                  Enter the code sent to your email
                </p>

                <input
                  type="text"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-5 py-4 text-center tracking-widest border rounded-lg"
                />

                <p className="mt-3 text-sm">
                  Time left: <b>{formatTime(timeLeft)}</b>
                </p>

                {error && <p className="text-red-600 mt-3">{error}</p>}

                <button
                  onClick={handleOtpVerify}
                  className="w-full bg-green-600 text-white py-4 rounded-lg mt-6"
                >
                  Verify OTP
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Footer Branding - Moved to middle of the bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          Developed by <span className="font-medium text-gray-600">Codexter Lab</span>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center px-20 text-white"
        style={{
          background:
            "linear-gradient(180deg, #023d3d 0%, #046b6b 50%, #023d3d 100%)",
        }}
      >
        <div className="max-w-xl">
          <h2 className="text-5xl font-semibold leading-tight">
            Revolutionize Remote Patient Monitoring
          </h2>

          <p className="mt-8 text-lg text-teal-100">
            Our RPM platform enables real-time monitoring of patient vitals,
            improving outcomes, reducing hospital visits, and empowering
            clinicians with actionable insights.
          </p>

          <div className="mt-12 border-t border-teal-400 pt-6 italic text-teal-200">
            “VITA RPM has transformed how we monitor patients remotely.
              Reliable, secure, and clinician-friendly.”
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
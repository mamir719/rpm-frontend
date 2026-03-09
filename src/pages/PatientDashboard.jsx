import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Droplets,
  Activity,
  RefreshCw,
  User,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader,
  BarChart3,
} from "lucide-react";
import VitalSignCard from "../components/VitalSignCard";

const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

// -----------------------------------------------------------------------
// Helper: colour classes for a given status string
// -----------------------------------------------------------------------
const statusBg = (status) => {
  switch (status) {
    case "critical":
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    case "warning":
    case "elevated":
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    case "normal":
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    default:
      return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
  }
};

const statusText = (status) => {
  switch (status) {
    case "critical":
      return "text-red-600 dark:text-red-400";
    case "warning":
    case "elevated":
      return "text-yellow-600 dark:text-yellow-400";
    case "normal":
      return "text-green-600 dark:text-green-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

// -----------------------------------------------------------------------
// BP percentage helper (for VitalSignCard progress bar)
// -----------------------------------------------------------------------
const bpPercentage = (systolic) => {
  if (!systolic || systolic === "--") return 0;
  return Math.min((parseInt(systolic) / 180) * 100, 100);
};

const hrPercentage = (hr) => {
  if (!hr || hr === "--") return 0;
  return Math.min((parseInt(hr) / 150) * 100, 100);
};

const spo2Percentage = (spo2) => {
  if (!spo2 || spo2 === "--") return 0;
  const v = parseFloat(spo2);
  return Math.min(((v - 85) / 15) * 100, 100);
};

// -----------------------------------------------------------------------
// PatientDashboard
// -----------------------------------------------------------------------
const PatientDashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [vitalData, setVitalData] = useState(null);   // from /vital-signs
  const [bpHistory, setBpHistory] = useState(null);   // from /device-data (bp)
  const [spo2Data, setSpo2Data] = useState(null);     // from /device-data (spo2)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const patientId = auth?.user?.id;

  // ------------------------------------------------------------------
  // Fetch vital-signs summary (BP + heart-rate cards)
  // ------------------------------------------------------------------
  const fetchVitalSigns = async () => {
    if (!patientId) return;
    const res = await fetch(
      `${API_BASE}/api/patient/patients/${patientId}/vital-signs`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error(`Vital signs fetch failed: ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to load vitals");
    return json.data; // { patient, vitalSigns, lastUpdated, overallStatus }
  };

  // ------------------------------------------------------------------
  // Fetch latest BP reading (for the modal-style reading card)
  // ------------------------------------------------------------------
  const fetchLatestBP = async () => {
    if (!patientId) return null;
    try {
      const res = await fetch(
        `${API_BASE}/api/patient/patients/${patientId}/device-data?deviceType=bp&days=30&page=1&limit=1`,
        { credentials: "include" }
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  };

  // ------------------------------------------------------------------
  // Fetch latest SpO2 reading
  // ------------------------------------------------------------------
  const fetchLatestSpO2 = async () => {
    if (!patientId) return null;
    try {
      const res = await fetch(
        `${API_BASE}/api/patient/patients/${patientId}/device-data?deviceType=spo2&days=30&page=1&limit=1`,
        { credentials: "include" }
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  };

  // ------------------------------------------------------------------
  // Load all data
  // ------------------------------------------------------------------
  const loadAll = async (isRefresh = false) => {
    if (!patientId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [vs, bp, spo2] = await Promise.all([
        fetchVitalSigns(),
        fetchLatestBP(),
        fetchLatestSpO2(),
      ]);
      setVitalData(vs || null);
      setBpHistory(bp || null);
      setSpo2Data(spo2 || null);
    } catch (err) {
      console.error("PatientDashboard load error:", err);
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  // ------------------------------------------------------------------
  // Guard: must be logged in
  // ------------------------------------------------------------------
  if (!patientId) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Loader className="h-10 w-10 text-teal-600 mb-4 animate-spin" />
          <p className="text-gray-500 font-medium tracking-wide">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------------
  const patient = vitalData?.patient || auth?.user || {};
  const vitalSigns = vitalData?.vitalSigns || {};

  // BP info from vital-signs response
  const bpValue = vitalSigns?.bloodPressure?.value || "--/--";
  const bpStatus = vitalSigns?.bloodPressure?.status || "no-data";
  const bpTimestamp = vitalSigns?.bloodPressure?.timestamp || null;
  const [bpSys] = bpValue.split("/");

  // Heart rate from vital-signs response
  const hrValue = vitalSigns?.heartRate?.value || "--";
  const hrStatus = vitalSigns?.heartRate?.status || "no-data";
  const hrTimestamp = vitalSigns?.heartRate?.timestamp || null;

  // SpO2 from device-data
  const latestSpo2Record = spo2Data?.data?.[0];
  const spo2Value = latestSpo2Record?.spo2 ?? "--";
  const spo2Pulse = latestSpo2Record?.pulse ?? null;
  const spo2Timestamp = latestSpo2Record?.created_at || null;
  const getSpo2Status = (v) => {
    if (!v || v === "--") return "no-data";
    const n = parseFloat(v);
    if (n < 90) return "critical";
    if (n < 95) return "warning";
    return "normal";
  };
  const spo2Status = getSpo2Status(spo2Value);

  // Latest BP reading (from device-data for the "reading card")
  const latestBPRecord = bpHistory?.data?.[0];
  const latestSystolic = latestBPRecord?.systolic ?? null;
  const latestDiastolic = latestBPRecord?.diastolic ?? null;
  const latestPulse = latestBPRecord?.pulse ?? null;
  const latestBPStatus = latestBPRecord?.bpStatus ?? bpStatus;
  const latestBPTime = latestBPRecord?.created_at ?? bpTimestamp;

  const formatDateTime = (ts) => {
    if (!ts) return "No data";
    const d = new Date(ts);
    if (isNaN(d)) return "—";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Patient display info
  const displayName =
    patient.name || patient.username || auth?.user?.username || "Patient";
  const displayEmail = patient.email || auth?.user?.email || "—";
  const displayPhone = patient.phoneNumber || auth?.user?.phoneNumber || "—";
  const initials = displayName.charAt(0).toUpperCase();

  // ------------------------------------------------------------------
  // Render: Loading
  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-[#103c63] dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your health data…
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render: Error
  // ------------------------------------------------------------------
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary dark:text-white">
            My Dashboard
          </h2>
        </div>
        <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 dark:text-red-300 font-medium">
              Failed to load health data
            </p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => loadAll()}
          className="px-4 py-2 bg-[#103c63] text-white rounded-lg text-sm hover:bg-[#0d3256] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render: Main dashboard
  // ------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">
            My Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your personal health overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Updated: {formatDateTime(vitalData?.lastUpdated)}
          </span>
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── Profile Card ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-[#103c63] flex items-center justify-center text-white text-2xl font-bold shadow">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </h3>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4 mr-1.5 flex-shrink-0" />
                {displayEmail}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4 mr-1.5 flex-shrink-0" />
                {displayPhone}
              </div>
            </div>
          </div>

          {/* Overall status badge */}
          <div
            className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium capitalize ${statusBg(
              vitalData?.overallStatus
            )} ${statusText(vitalData?.overallStatus)}`}
          >
            {vitalData?.overallStatus
              ? `Status: ${vitalData.overallStatus}`
              : "Status: No data"}
          </div>
        </div>
      </div>

      {/* ── Vital Sign Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Blood Pressure + Pulse (Merged Card) */}
        <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Droplets className="w-5 h-5 text-[#103c63] dark:text-blue-400" />
            </div>
            {bpTimestamp && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDateTime(bpTimestamp)}
              </span>
            )}
          </div>

          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Blood Pressure
          </h3>

          <div className="flex items-baseline gap-1 mb-4">
            <span className={`text-3xl font-bold ${statusText(bpStatus)}`}>
              {bpValue}
            </span>
            <span className="text-sm text-gray-400 font-medium">mmHg</span>
          </div>

          {/* Detailed Info (Pulse merged here) */}
          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Pulse Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {hrValue !== "--" ? `${hrValue} bpm` : "--"}
              </span>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  bpStatus === "critical"
                    ? "bg-red-500"
                    : bpStatus === "warning" || bpStatus === "elevated"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${bpPercentage(bpSys)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${statusText(
                  bpStatus
                )}`}
              >
                {bpStatus}
              </span>
              <span className="text-[11px] text-gray-400">Range: &lt; 120/80</span>
            </div>
          </div>
        </div>

        {/* SpO2 Card */}
        <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            {spo2Timestamp && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                {formatDateTime(spo2Timestamp)}
              </span>
            )}
          </div>

          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Oxygen Saturation
          </h3>

          <div className="flex items-baseline gap-1 mb-4">
            <span className={`text-3xl font-bold ${statusText(spo2Status)}`}>
              {spo2Value}{spo2Value !== "--" ? "%" : ""}
            </span>
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">SpO₂ Pulse</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {spo2Pulse ? `${Math.round(spo2Pulse)} bpm` : "--"}
              </span>
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  spo2Status === "critical"
                    ? "bg-red-500"
                    : spo2Status === "warning"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${spo2Percentage(spo2Value)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${statusText(
                  spo2Status
                )}`}
              >
                {spo2Status}
              </span>
              <span className="text-[11px] text-gray-400">Range: 95–100 %</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Latest Reading Detail Card (Merged View) ─────────────────── */}
      {(latestSystolic || latestSpo2Record) && (
        <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#103c63] dark:text-blue-400" />
            Latest Reading Detail
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {latestSystolic && (
              <div className={`p-4 rounded-lg border flex flex-col gap-2 ${statusBg(latestBPStatus)}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Blood Pressure</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusBg(latestBPStatus).replace("bg-", "text-").replace("-50", "-700")} bg-white/50`}>
                    {latestBPStatus}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black ${statusText(latestBPStatus)}`}>
                    {latestSystolic}/{latestDiastolic}
                  </span>
                  <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-3">
                    <span className="text-[10px] text-gray-500 uppercase">Pulse</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{latestPulse || "--"} bpm</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{formatDateTime(latestBPTime)}</span>
              </div>
            )}

            {latestSpo2Record && (
              <div className={`p-4 rounded-lg border flex flex-col gap-2 ${statusBg(spo2Status)}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-tight">SpO₂ Reading</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${statusBg(spo2Status).replace("bg-", "text-").replace("-50", "-700")} bg-white/50`}>
                    {spo2Status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black ${statusText(spo2Status)}`}>
                    {spo2Value}%
                  </span>
                  <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-3">
                    <span className="text-[10px] text-gray-500 uppercase">Pulse</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{spo2Pulse ? Math.round(spo2Pulse) : "--"} bpm</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{formatDateTime(spo2Timestamp)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick-Access Buttons ────────────────────────────────────── */}
      <div className="bg-white dark:bg-innerDarkColor rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#103c63] dark:text-blue-400" />
          Health History & Charts
        </h4>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Blood Pressure history */}
          <button
            onClick={() =>
              navigate(
                `/patient-dashboard/vital-signs/${patientId}`,
                { state: { deviceType: "bp", activeTab: "history" } }
              )
            }
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-[#103c63] dark:text-blue-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Blood Pressure History
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Detailed BP charts & trends
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#103c63] dark:group-hover:text-blue-400 transition-colors" />
          </button>

          {/* SpO2 history */}
          <button
            onClick={() =>
              navigate(
                `/patient-dashboard/vital-signs/${patientId}`,
                { state: { deviceType: "spo2", activeTab: "history" } }
              )
            }
            className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  SpO₂ History
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Detailed oxygen level trends
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#103c63] dark:group-hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

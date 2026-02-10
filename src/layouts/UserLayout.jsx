import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Heart,
  AlertTriangle,
  Settings,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Monitor,
  Bell,
  BarChart3,
  Droplets,
  Thermometer,
  Stethoscope,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import VitalSigns from "../pages/VitalSigns";
import ECGMonitoring from "../pages/ECGMonitoring";
import Alerts from "../pages/Alerts";
import PatientCommunication from "../pages/PatientCommunication";
import DeviceManagement from "../pages/DeviceManagement";
import SettingsPage from "../pages/Settings";
import AlertNotification from "../components/AlertNotification";
import { useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const UserLayout = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected, socket, newAlert, getConnectionStatus } = useSocket();
  const connectionStatus = getConnectionStatus();
  // In UserLayout.jsx, add this useEffect:
  useEffect(() => {
    if (socket && isConnected) {
      console.log("🎯 Testing socket connection...");

      // Test the connection
      socket.emit("check_connection");

      // Listen for connection status
      socket.on("connection_status", (data) => {
        console.log("🎯 Connection status from server:", data);
      });

      // Listen for broadcast alerts (for testing)
      socket.on("new_alert_broadcast", (data) => {
        console.log("🎯 BROADCAST ALERT RECEIVED:", data);
      });
    }
  }, [socket, isConnected]);
  // Log connection status changes
  useEffect(() => {
    console.log(`🔌 Socket Connection Status:`, connectionStatus);
    console.log(`📡 Socket connected: ${isConnected}`);
    if (socket) {
      console.log(`🆔 Socket ID: ${socket.id}`);

      // Debug: Listen for all socket events
      socket.onAny((eventName, ...args) => {
        console.log(`🎯 [USERLAYOUT] Socket event: ${eventName}`, args);
      });
    }
  }, [connectionStatus, isConnected, socket]);

  // Log when new alert is received
  useEffect(() => {
    if (newAlert) {
      console.log("🎯 New alert received in UserLayout:", newAlert);
    }
  }, [newAlert]);

  const renderPage = () => {
    try {
      const path = (location.pathname || "").replace(/\/+$/, "");
      if (/^\/(?:rpm\/)?patients\/vital-signs\//.test(path)) {
        return <VitalSigns />;
      }
    } catch (e) {}

    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "patients":
        return <Patients setCurrentPage={setCurrentPage} />;
      case "vital-signs":
        return <VitalSigns />;
      case "ecg-monitoring":
        return <ECGMonitoring />;
      case "alerts":
        return <Alerts />;
      case "communication":
        return <PatientCommunication />;
      case "device-management":
        return <DeviceManagement />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  const getConnectionColor = () => {
    if (isConnected) return "bg-green-500 text-white";
    if (connectionStatus?.reconnectAttempts > 0)
      return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const getConnectionText = () => {
    if (isConnected) return "🟢 Connected";
    if (connectionStatus?.reconnectAttempts > 0) return "🟡 Reconnecting...";
    return "🔴 Disconnected";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-darkModeBackGround font-sans transition-colors">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Socket Connection Status Indicator */}
      <div
        className={`fixed bottom-4 left-4 z-40 px-3 py-2 rounded-lg text-sm font-semibold shadow-lg ${getConnectionColor()}`}
      >
        {getConnectionText()}
      </div>

      {/* Alert Notification Component */}
      <AlertNotification />

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
          <div className="p-4 lg:p-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;

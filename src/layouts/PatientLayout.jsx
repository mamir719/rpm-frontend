import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Navbar from "../components/Navbar";
import PatientSidebar from "../components/PatientSidebar";

const PatientLayout = () => {
  const [currentPage, setCurrentPage] = useState("patient-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { auth } = useAuth();

  if (!auth?.isAuthenticated && !auth?.loading) return <Navigate to="/" replace />;
  if (auth?.user?.role && auth.user.role !== "patient") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex">
        <PatientSidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 ml-0 lg:ml-64 mt-16 transition-all duration-300">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;

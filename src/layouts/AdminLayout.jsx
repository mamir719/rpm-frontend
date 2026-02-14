

// export default AdminUsers;
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Lock,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  LayoutDashboard,
  Menu,
  X,
  AlertTriangle,
  Bell,
  User,
  Stethoscope,
  Clock,
} from "lucide-react";
import AddUserModal from "../components/AddUserModal";
import EditUserModal from "../components/EditUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import DeleteUserModal from "../components/DeleteUserModal";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthProvider";
import { LogOut } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const FINAL_API_BASE = API_BASE || "http://localhost:4000";

// Sidebar Component
const Sidebar = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const { logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users Management", icon: Users },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? "w-16" : "w-64"} 
        bg-white dark:bg-innerDarkColor border-r border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col h-screen
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary dark:text-white whitespace-nowrap">
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors
                  ${
                    activeView === item.id
                      ? "bg-primary text-white dark:bg-darkModeButton dark:text-black"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                  ${sidebarCollapsed ? "justify-center" : ""}
                `}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon size={20} className={sidebarCollapsed ? "" : "mr-3"} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className={`
              w-full flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 
              hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
              ${sidebarCollapsed ? "justify-center" : ""}
            `}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} className={sidebarCollapsed ? "" : "mr-3"} />
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
};

// Multiple Alerts Modal
const MultipleAlertsModal = ({
  doctor,
  alerts,
  isOpen,
  onClose,
  onClearAlert,
  onClearAllAlerts,
}) => {
  if (!isOpen || !doctor || !alerts.length) return null;

  const handleClearAll = () => {
    onClearAllAlerts(doctor.id);
    onClose();
  };

  const handleClearSingle = (alertId) => {
    onClearAlert(doctor.id, alertId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="mr-2" size={24} />
              Multiple Emergency Alerts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {alerts.length} active alerts for Dr. {doctor.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={alert.alert?.id || index}
                className="border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">
                      Alert #{index + 1}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleClearSingle(alert.alert?.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Clear this alert"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Patient Information */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <User className="mr-2" size={14} />
                      Patient
                    </h5>
                    <p className="text-sm">
                      <strong>Name:</strong> {alert.patient?.name || "Unknown"}
                    </p>
                    <p className="text-sm">
                      <strong>ID:</strong> {alert.patient?.id || "N/A"}
                    </p>
                    <p className="text-sm">
                      <strong>Contact:</strong> {alert.patient?.email || "N/A"}
                    </p>
                  </div>

                  {/* Alert Information */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <Bell className="mr-2" size={14} />
                      Alert Details
                    </h5>
                    <p className="text-sm">
                      <strong>Type:</strong> {alert.alert?.type || "Emergency"}
                    </p>
                    <p className="text-sm">
                      <strong>Description:</strong>{" "}
                      {alert.alert?.desc || "No description"}
                    </p>
                    <p className="text-sm flex items-center">
                      <Clock className="mr-1" size={12} />
                      <strong>Time:</strong>{" "}
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total: {alerts.length} alert{alerts.length > 1 ? "s" : ""}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Alerts
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Doctor Card Component with Enhanced Multiple Alerts Support
const DoctorCard = ({
  doctor,
  emergencyAlerts,
  isBlinking,
  onAlertClick,
  onClearAlert,
}) => {
  // Find all alerts for this specific doctor
  const doctorAlerts = emergencyAlerts.filter(
    (alert) => alert.assigned_doctor?.id === doctor.id
  );

  const hasEmergencyAlert = doctorAlerts.length > 0;
  const hasMultipleAlerts = doctorAlerts.length > 1;

  return (
    <div
      className={`
        bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border-2 transition-all duration-300 p-6 
        hover:shadow-md relative overflow-hidden
        ${
          hasEmergencyAlert
            ? "border-red-500 ring-2 ring-red-500 ring-opacity-50 shadow-lg"
            : "border-gray-200 dark:border-gray-700"
        }
        ${
          isBlinking
            ? "animate-pulse bg-red-100 dark:bg-red-900/30 border-red-500 ring-4 ring-red-500 ring-opacity-70"
            : ""
        }
      `}
    >
      {/* Emergency Alert Badge */}
      {hasEmergencyAlert && (
        <div className="absolute -top-2 -right-2 z-10">
          <div
            className={`bg-red-500 text-white rounded-full p-2 ${
              isBlinking ? "animate-pulse" : ""
            } shadow-lg relative`}
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold border border-red-500">
              {doctorAlerts.length}
            </span>
          </div>
        </div>
      )}

      {/* Emergency Background Overlay */}
      {hasEmergencyAlert && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 pointer-events-none"></div>
      )}

      <div className="flex items-start justify-between mb-4 relative z-5">
        <div className="flex items-center space-x-3">
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium relative
            ${
              hasEmergencyAlert
                ? "bg-red-500 shadow-lg"
                : "bg-primary dark:bg-darkModeButton"
            }
            ${isBlinking ? "animate-bounce" : ""}
          `}
          >
            {doctor.avatar}
            {hasEmergencyAlert && (
              <div className="absolute -top-1 -right-1">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center">
              {doctor.name}
              {hasEmergencyAlert && (
                <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {doctor.role}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full z-10 ${
            doctor.status === "Active"
              ? hasEmergencyAlert
                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          }`}
        >
          {hasEmergencyAlert
            ? `🚨 ${doctorAlerts.length} ALERTS`
            : doctor.status}
        </span>
      </div>

      <div className="space-y-3 relative z-5">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Mail size={16} className="mr-2 text-gray-400" />
          <span className="truncate">{doctor.email}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Phone size={16} className="mr-2 text-gray-400" />
          <span>{doctor.phone}</span>
        </div>

        {/* Emergency Alert Information */}
        {hasEmergencyAlert && (
          <div
            className={`bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-2 border-red-200 dark:border-red-800 ${
              isBlinking ? "animate-pulse" : ""
            }`}
          >
            <p className="text-xs text-red-700 dark:text-red-300 font-bold uppercase mb-1">
              🚨{" "}
              {hasMultipleAlerts ? "MULTIPLE EMERGENCIES" : "ACTIVE EMERGENCY"}
            </p>

            {/* Show multiple alerts summary */}
            {hasMultipleAlerts ? (
              <div className="space-y-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {doctorAlerts.length} active emergencies
                </p>
                <div className="space-y-1">
                  {doctorAlerts.slice(0, 2).map((alert, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-red-600 dark:text-red-400 truncate">
                        {alert.patient?.name || "Unknown"}
                      </span>
                      <span className="text-red-500 font-medium">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {doctorAlerts.length > 2 && (
                    <p className="text-xs text-red-500 font-medium">
                      +{doctorAlerts.length - 2} more alerts...
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Single alert display
              <>
                <p className="text-xs text-red-600 dark:text-red-400 truncate font-medium">
                  Patient: {doctorAlerts[0].patient?.name || "Unknown"}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 truncate">
                  Issue: {doctorAlerts[0].alert?.desc || "Critical alert"}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Time:{" "}
                  {new Date(doctorAlerts[0].timestamp).toLocaleTimeString()}
                </p>
              </>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last Login: <span className="font-medium">{doctor.lastLogin}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Joined: <span className="font-medium">{doctor.createdAt}</span>
          </p>
        </div>
      </div>

      {/* Emergency Alert Buttons */}
      {hasEmergencyAlert && (
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onAlertClick(doctor.id, doctorAlerts)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <AlertTriangle size={16} className="mr-2" />
            View {hasMultipleAlerts ? "All" : "Alert"} ({doctorAlerts.length})
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearAlert(doctor.id);
            }}
            className="px-4 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            title="Clear All Alerts"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Dashboard Component with Enhanced Multiple Alerts Support
const DashboardView = ({
  users,
  emergencyAlerts,
  setEmergencyAlerts,
  blinkingCards,
  onClearAlert,
  onClearSingleAlert,
}) => {
  const doctors = users.filter((user) => user.role === "clinician");
  const { socket, isConnected } = useSocket();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Handle alert click on doctor card
  const handleAlertClick = (doctorId, alerts) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor);
    setSelectedAlerts(alerts);
    setShowAlertsModal(true);
  };

  // Handle clear all alerts for a doctor
  const handleClearAllAlerts = (doctorId) => {
    onClearAlert(doctorId);
    setShowAlertsModal(false);
  };

  // Handle clear single alert
  const handleClearSingleAlert = (doctorId, alertId) => {
    onClearSingleAlert(doctorId, alertId);

    // Update selected alerts in modal
    setSelectedAlerts((prev) =>
      prev.filter((alert) => alert.alert?.id !== alertId)
    );

    // Close modal if no alerts left
    if (selectedAlerts.length <= 1) {
      setShowAlertsModal(false);
    }
  };

  // Get doctors with active alerts
  const doctorsWithAlerts = doctors.filter((doctor) =>
    emergencyAlerts.some((alert) => alert.assigned_doctor?.id === doctor.id)
  );

  // Calculate total alerts count
  const totalAlertsCount = doctorsWithAlerts.reduce((total, doctor) => {
    const doctorAlerts = emergencyAlerts.filter(
      (alert) => alert.assigned_doctor?.id === doctor.id
    );
    return total + doctorAlerts.length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div
        className={`p-3 rounded-lg text-sm font-medium ${
          isConnected
            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
        }`}
      >
        {isConnected
          ? "🟢 Connected to real-time alerts"
          : "🟡 Connecting to real-time alerts..."}
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white flex items-center">
            Doctors Dashboard
            {doctorsWithAlerts.length > 0 && (
              <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <AlertTriangle size={16} className="mr-1" />
                {doctorsWithAlerts.length} Doctor
                {doctorsWithAlerts.length > 1 ? "s" : ""} with{" "}
                {totalAlertsCount} Alert
                {totalAlertsCount > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <p className="text-gray-700 dark:text-gray-200 mt-2">
            Overview of doctors in your organization ({doctors.length} doctors)
            {doctorsWithAlerts.length > 0 && (
              <span className="text-red-500 font-semibold ml-2">
                • {doctorsWithAlerts.length} with {totalAlertsCount} active
                emergency alert
                {totalAlertsCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {doctors.map((doctor) => {
          const isBlinking = blinkingCards.has(doctor.id);

          return (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              emergencyAlerts={emergencyAlerts}
              isBlinking={isBlinking}
              onAlertClick={handleAlertClick}
              onClearAlert={onClearAlert}
            />
          );
        })}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <Users
            size={48}
            className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
          />
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
            No doctors found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            There are no doctors in your organization yet
          </p>
        </div>
      )}

      {/* Multiple Alerts Modal */}
      <MultipleAlertsModal
        doctor={selectedDoctor}
        alerts={selectedAlerts}
        isOpen={showAlertsModal}
        onClose={() => setShowAlertsModal(false)}
        onClearAlert={handleClearSingleAlert}
        onClearAllAlerts={handleClearAllAlerts}
      />
    </div>
  );
};

// Users Management Component
const UsersManagementView = ({
  users,
  filteredUsers,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  setShowAddModal,
  showAddModal,
  showEditModal,
  setShowEditModal,
  showPasswordModal,
  setShowPasswordModal,
  showDeleteModal,
  setShowDeleteModal,
  selectedUser,
  setSelectedUser,
  activeDropdown,
  setActiveDropdown,
  handleAddUser,
  handleEditUser,
  handleResetPassword,
  handleDeleteUser,
  toggleUserStatus,
  stats,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">
            User Management
          </h2>
          <p className="text-gray-700 dark:text-gray-200">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <ThemeToggle />
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors dark:text-black bg-primary dark:bg-darkModeButton"
          >
            <Plus size={20} className="mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading users...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Total Users
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-darkModeText">
                {stats.active}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-darkModeText">
                {stats.inactive}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Inactive
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary dark:text-darkModeText">
                {stats.doctors}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Doctors
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-innerDarkColor p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-darkModeText">
                {stats.patients}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Patients
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      {!loading && !error && (
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-300"
              />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg  focus:ring-blue-500 dark:focus:ring-white focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-darkModeText focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="All">All Roles</option>
                <option value="clinician">Doctors</option>
                <option value="admin">Admins</option>
                <option value="patient">Patients</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-darkModeText focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={`${user.id}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
                          {user.avatar}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm mb-1 text-gray-900 dark:text-gray-100">
                        <Mail size={14} className="mr-1" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Phone size={14} className="mr-1" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === user.id ? null : user.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeDropdown === user.id && (
                          <div
                            className={`absolute right-0 w-48 bg-white dark:bg-innerDarkColor rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${
                              index >= filteredUsers.length - 2
                                ? "bottom-full mb-2"
                                : "mt-2"
                            }`}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit User
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowPasswordModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                <Lock size={16} className="mr-2" />
                                Reset Password
                              </button>
                              <button
                                onClick={() => {
                                  toggleUserStatus(user.id);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-gray-900 dark:text-gray-100"
                              >
                                {user.status === "Active" ? (
                                  <>
                                    <UserX size={16} className="mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={16} className="mr-2" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full text-left"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users
                size={48}
                className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
              />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const { auth } = useAuth();
  const { socket, isConnected, alerts } = useSocket();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // WebSocket Alert States
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [blinkingCards, setBlinkingCards] = useState(new Set());

  // Handle alerts from SocketContext
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      console.log("📨 Alerts received in AdminUsers:", alerts.length);

      // Process each new alert
      alerts.forEach((alert) => {
        if (!alert || !alert.alert) return;

        console.log("👨‍💼 PROCESSING ALERT:", alert);

        // Check if this alert already exists using a unique identifier
        const alertId = alert.alert.id;
        const exists = emergencyAlerts.some(
          (existingAlert) => existingAlert.alert?.id === alertId
        );

        if (!exists) {
          console.log("✅ Adding new alert to emergencyAlerts:", alertId);
          setEmergencyAlerts((prev) => {
            const newAlerts = [alert, ...prev];
            // Remove duplicates just in case
            return newAlerts.filter(
              (a, index, self) =>
                index === self.findIndex((t) => t.alert?.id === a.alert?.id)
            );
          });
        } else {
          console.log("🔄 Alert already exists, skipping:", alertId);
          return;
        }

        // Add blinking effect for the assigned doctor - CONTINUOUSLY
        const doctorId = alert.assigned_doctor?.id;
        if (doctorId) {
          console.log(
            "💫 Adding CONTINUOUS blinking effect for doctor:",
            doctorId
          );

          // Add doctor to blinking set - NO TIMEOUT, will blink until manually cleared
          setBlinkingCards((prev) => new Set([...prev, doctorId]));

          // Show browser notification
          if (Notification.permission === "granted") {
            new Notification("🚨 EMERGENCY ALERT - Admin", {
              body: `Doctor: ${
                alert.assigned_doctor?.name || "Unknown"
              }\nPatient: ${alert.patient?.name || "Unknown"}\nIssue: ${
                alert.alert?.desc || "Critical alert"
              }`,
              icon: "/alert-icon.png",
              requireInteraction: true,
              tag: `emergency-${alertId}`,
            });
          }
        } else {
          console.log("❌ No assigned doctor found in alert");
        }
      });
    }
  }, [alerts]);

  // Function to clear all alerts for a specific doctor
  const handleClearAlert = (doctorId) => {
    console.log("🛑 Clearing ALL alerts for doctor:", doctorId);

    // Remove from blinking cards
    setBlinkingCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(doctorId);
      return newSet;
    });

    // Remove alerts for this doctor from emergencyAlerts
    setEmergencyAlerts((prev) =>
      prev.filter((alert) => alert.assigned_doctor?.id !== doctorId)
    );
  };

  // Function to clear a single alert
  const handleClearSingleAlert = (doctorId, alertId) => {
    console.log("🛑 Clearing single alert:", alertId, "for doctor:", doctorId);

    setEmergencyAlerts((prev) =>
      prev.filter((alert) => alert.alert?.id !== alertId)
    );

    // Check if doctor has any remaining alerts
    const remainingAlerts = emergencyAlerts.filter(
      (alert) =>
        alert.assigned_doctor?.id === doctorId && alert.alert?.id !== alertId
    );

    // If no remaining alerts, stop blinking
    if (remainingAlerts.length === 0) {
      setBlinkingCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doctorId);
        return newSet;
      });
    }
  };

  // ADD THE MISSING FUNCTIONS HERE:

  const handleAddUser = async (userData) => {
    try {
      setUsers([
        ...users,
        {
          id: users.length + 1,
          ...userData,
          createdAt: new Date().toISOString().split("T")[0],
          lastLogin: "Never",
          avatar: userData.name
            .split(" ")
            .map((n) => n[0])
            .join(""),
        },
      ]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user. Please try again.");
    }
  };

  const handleEditUser = (userData) => {
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...userData } : user
      )
    );
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleResetPassword = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${FINAL_API_BASE}/api/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Unexpected response: ${text.slice(0, 50)}...`);
      }

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to update user status");
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError(
        err.message || "Failed to update user status. Please try again."
      );
    }
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Handle click outside to close dropdown and scroll to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    const handleScroll = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeDropdown]);

  // Auto-scroll to top when modals open to ensure they're fully visible
  useEffect(() => {
    if (showAddModal || showEditModal || showPasswordModal) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showAddModal, showEditModal, showPasswordModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/api/admin/getAllusers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response received:", text);
          throw new Error(`Unexpected response: ${text.slice(0, 50)}...`);
        }

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to access this resource");
          } else if (response.status === 403) {
            throw new Error("Admin access required");
          } else {
            throw new Error(
              data.message || `HTTP error! Status: ${response.status}`
            );
          }
        }

        if (!data.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        const formattedUsers = data.users.map((user) => ({
          id: user.id,
          name: user.name || "Unknown",
          email: user.email || "N/A",
          phone: user.phoneNumber || "N/A",
          role: user.role_type || "Unknown",
          status: user.is_active ? "Active" : "Inactive",
          lastLogin: user.last_login || "Never",
          createdAt: user.created_at || new Date().toISOString().split("T")[0],
          avatar: user.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            : "NA",
        }));

        setUsers(formattedUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err.message ||
            "Failed to fetch users. Please check your network or try again later."
        );
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term, role, and status
  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === "All" || user.role === selectedRole;
      const matchesStatus =
        selectedStatus === "All" || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    doctors: users.filter((u) => u.role === "clinician").length,
    patients: users.filter((u) => u.role === "patient").length,
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-darkModeBackGround transition-colors">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-innerDarkColor border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="text-lg font-bold text-primary dark:text-white">
              {activeView === "dashboard" ? "Dashboard" : "User Management"}
            </h1>
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300">
          {activeView === "dashboard" ? (
            <DashboardView
              users={users}
              emergencyAlerts={emergencyAlerts}
              setEmergencyAlerts={setEmergencyAlerts}
              blinkingCards={blinkingCards}
              onClearAlert={handleClearAlert}
              onClearSingleAlert={handleClearSingleAlert}
            />
          ) : (
            <UsersManagementView
              users={users}
              filteredUsers={filteredUsers}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              setShowAddModal={setShowAddModal}
              showAddModal={showAddModal}
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              showPasswordModal={showPasswordModal}
              setShowPasswordModal={setShowPasswordModal}
              showDeleteModal={showDeleteModal}
              setShowDeleteModal={setShowDeleteModal}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              handleAddUser={handleAddUser}
              handleEditUser={handleEditUser}
              handleResetPassword={handleResetPassword}
              handleDeleteUser={handleDeleteUser}
              toggleUserStatus={toggleUserStatus}
              stats={stats}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
          organizationId={auth.user?.organizationId}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      )}

      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onConfirm={handleResetPassword}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onDelete={handleDeleteUser}
        />
      )}

      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;

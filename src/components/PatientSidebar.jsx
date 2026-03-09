import React, { useContext } from "react";
import { BarChart3, MessageSquare, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const PatientSidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useContext(AuthContext);

  const menuItems = [
    { id: "patient-dashboard", label: "My Dashboard", icon: BarChart3 },
    { id: "patient-chat", label: "Chat with Doctor", icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)]
          bg-white dark:bg-innerDarkColor border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Menu */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSidebarOpen(false);
                    setCurrentPage(item.id);
                    navigate(`/${item.id}`);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      location.pathname.includes(item.id)
                        ? "bg-primary dark:bg-darkModeButton text-white dark:text-black"
                        : "text-gray-700 dark:text-darkModeText hover:bg-primary dark:hover:bg-darkModeButton hover:text-white dark:hover:text-black"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {auth?.user?.name?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-darkModeText truncate">
                  {auth?.user?.name || "Patient"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {auth?.user?.email || "No Email"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default PatientSidebar;

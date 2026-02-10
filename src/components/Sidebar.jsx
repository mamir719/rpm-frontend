
// import React, { useContext, useEffect } from "react";
// import {
//   Users,
//   AlertTriangle,
//   Settings,
//   ChevronRight,
//   MessageSquare,
//   Monitor,
//   BarChart3,
// } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { AuthContext } from "../context/AuthProvider";

// const Sidebar = ({
//   currentPage,
//   setCurrentPage,
//   sidebarOpen,
//   setSidebarOpen,
// }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { auth, logout } = useContext(AuthContext);

//   const menuItems = [
//     { id: "dashboard", label: "Dashboard", icon: BarChart3 },
//     { id: "patients", label: "Patients", icon: Users },
//     { id: "alerts", label: "Alerts", icon: AlertTriangle },
//     {
//       id: "communication",
//       label: "Patient Communication",
//       icon: MessageSquare,
//     },
//     { id: "device-management", label: "Device Management", icon: Monitor },
//     { id: "settings", label: "Settings", icon: Settings },
//   ];

//   // map logical ids to routes (relative)
//   const pathMap = {
//     dashboard: "dashboard",
//     patients: "patients",
//     alerts: "alerts",
//     communication: "communication",
//     "device-management": "device-management",
//     settings: "settings",
//   };

//   const handleLogout = () => {
//     logout();
//   };

//   // Keep sidebar's currentPage in sync with the URL (so breadcrumbs/navigation won't get out of sync)
//   useEffect(() => {
//     try {
//       const parts = (location.pathname || "").split("/").filter(Boolean);
//       // if root or /dashboard
//       if (!parts.length || parts[0] === "dashboard" || (parts[0] === "rpm" && parts[1] === "dashboard")) {
//         setCurrentPage("dashboard");
//         return;
//       }

//       // Choose the logical menu id from the first path segment
//       const first = parts[0];
//       if (first === "patients") {
//         setCurrentPage("patients");
//         // keep selection as "patients" (we don't need a special sidebar selection for subviews)
//         return;
//       }

//       // map other sections directly
//       if (Object.values(pathMap).includes(first)) {
//         // find key by value
//         const key = Object.keys(pathMap).find((k) => pathMap[k] === first);
//         if (key) setCurrentPage(key);
//         return;
//       }
//     } catch (e) {
//       // ignore
//     }
//   }, [location.pathname, setCurrentPage]);

//   return (
//     <>
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <aside
//         className={`
//           fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)]
//           bg-white dark:bg-innerDarkColor border-r border-gray-200 dark:border-gray-700
//           transition-transform duration-300
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//           lg:translate-x-0
//         `}
//       >
//         <div className="flex flex-col h-full">
//           {/* Menu */}
//           <div className="flex-1 px-4 py-6 overflow-y-auto">
//             <nav className="space-y-1">
//               {menuItems.map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => {
//                     // close sidebar
//                     setSidebarOpen(false);
                  
//                     // route path (basic mapping)
//                     const path = pathMap[item.id] || item.id;
                  
//                     // special handling for patients: force clean /patients route (respect /rpm base)
//                     if (item.id === "patients") {
//                       const hasRpmBase = (location.pathname || "").startsWith("/rpm");
//                       const finalPath = `${hasRpmBase ? "/rpm" : ""}/patients`;
                  
//                       // minimal state only (do NOT pass patient object/id)
//                       const stateToPass = { from: "sidebar", preserveStoredPatient: true };
                  
//                       // set UI state and navigate (replace so no duplicate history)
//                       setCurrentPage("patients");
//                       navigate(finalPath, { replace: true, state: stateToPass });
                  
//                       // tell Patients to soft-reload (if it's already mounted)
//                       setTimeout(() => {
//                         try {
//                           window.dispatchEvent(
//                             new CustomEvent("softReloadPatients", { detail: { state: stateToPass } })
//                           );
//                         } catch (err) {
//                           console.warn("softReloadPatients dispatch failed", err);
//                         }
//                       }, 12);
                  
//                       return;
//                     }
                  
//                     // default handling for other menu items
//                     setCurrentPage(item.id);
//                     navigate(`/${path}`);
//                   }}
                  
//                   className={`
//                     w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
//                     ${
//                       currentPage === item.id
//                         ? "bg-primary dark:bg-darkModeButton text-white dark:text-black"
//                         : "text-gray-700 dark:text-darkModeText hover:bg-primary dark:hover:bg-darkModeButton hover:text-white dark:hover:text-black"
//                     }
//                   `}
//                 >
//                   <div className="flex items-center space-x-3">
//                     <item.icon size={18} />
//                     <span>{item.label}</span>
//                   </div>
//                   {item.hasSubmenu && (
//                     <ChevronRight
//                       size={16}
//                       className="text-gray-400 dark:text-gray-500"
//                     />
//                   )}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* User Info + Logout */}
//           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
//                 {auth?.user?.name?.charAt(0)?.toUpperCase() || "?"}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <div className="text-sm font-medium text-gray-900 dark:text-darkModeText truncate">
//                   {auth?.user?.email || "Guest"}
//                 </div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                   {auth?.user?.username || "Guest"}
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="w-full mt-3 px-3 py-2 text-sm text-gray-700 dark:text-darkModeText hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;


import React, { useContext, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  Settings,
  ChevronRight,
  MessageSquare,
  Monitor,
  BarChart3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const Sidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useContext(AuthContext);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "patients", label: "Patients", icon: Users },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
    { id: "communication", label: "Patient Communication", icon: MessageSquare },
    { id: "device-management", label: "Device Management", icon: Monitor },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // map logical ids to routes (relative)
  const pathMap = {
    dashboard: "dashboard",
    patients: "patients",
    alerts: "alerts",
    communication: "communication",
    "device-management": "device-management",
    settings: "settings",
  };

  const handleLogout = () => {
    logout();
  };

  // Keep sidebar's currentPage in sync with the URL (so breadcrumbs/navigation won't get out of sync)
  useEffect(() => {
    try {
      const parts = (location.pathname || "").split("/").filter(Boolean);
      // if root or /dashboard
      if (
        !parts.length ||
        parts[0] === "dashboard" ||
        (parts[0] === "rpm" && parts[1] === "dashboard")
      ) {
        setCurrentPage("dashboard");
        return;
      }

      // Choose the logical menu id from the first path segment
      const first = parts[0];
      if (first === "patients") {
        setCurrentPage("patients");
        // keep selection as "patients" (we don't need a special sidebar selection for subviews)
        return;
      }

      // map other sections directly
      if (Object.values(pathMap).includes(first)) {
        // find key by value
        const key = Object.keys(pathMap).find((k) => pathMap[k] === first);
        if (key) setCurrentPage(key);
        return;
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname, setCurrentPage]);

  // Force-open /patients, clear any local/session hints that cause auto-open, and update URL instantly.
  // In Sidebar.js - replace the existing forceOpenPatientsList function with this:

const forceOpenPatientsList = () => {
  try {
    // close sidebar UI immediately
    setSidebarOpen(false);

    // 1) Clear patient-related localStorage keys
    try {
      localStorage.removeItem("currentPatientData");
      localStorage.removeItem("selectedPatient");
    } catch (e) {
      /* ignore storage errors */
    }

    // 2) Clear patient-related sessionStorage keys (safe, per-key try/catch)
    try {
      sessionStorage.removeItem("infuzamed_last_opened_dashboard_slug");
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        try {
          const key = sessionStorage.key(i);
          if (!key) continue;
          if (
            key.startsWith("patientName_bySlug_") ||
            key.startsWith("patientId_bySlug_") ||
            key.startsWith("infuzamed_patient_")
          ) {
            sessionStorage.removeItem(key);
          }
        } catch (e) {
          // ignore per-key errors
        }
      }
    } catch (e) {
      console.warn("Sidebar: clearing sessionStorage hints failed", e);
    }

    // 3) Build finalPath (respect /rpm base)
    const hasRpmBase = (location.pathname || "").startsWith("/rpm");
    const basePath = `${hasRpmBase ? "/rpm" : ""}/patients`;

    // 4) Unique query param to force React Router treat as new location
    const forceToken = `__force=${Date.now()}`;
    const finalPath = `${basePath}?${forceToken}`;

    // 5) Create state indicating we want a clean list view
    const stateToPass = {
      from: "sidebar",
      preserveStoredPatient: false,
      __force: Date.now(),
      forcePatientsList: true,
    };

    // 6) Set UI selection and navigate (replace history so back-button behavior is clean)
    setCurrentPage("patients");
    navigate(finalPath, { replace: true, state: stateToPass });

    // 7) Extra: ensure address bar shows the finalPath (no full reload)
    try {
      window.history.replaceState(stateToPass, "", finalPath);
    } catch (e) {
      /* ignore if replaceState fails */
    }

    // 8) Dispatch an event to force Patients component to reset to list view
    // small timeout to let navigation settle
    setTimeout(() => {
      try {
        window.dispatchEvent(
          new CustomEvent("softReloadPatients", {
            detail: {
              state: stateToPass,
              forceList: true,
            },
          })
        );
      } catch (err) {
        console.warn("softReloadPatients dispatch failed", err);
      }
    }, 12);
  } catch (err) {
    console.error("forceOpenPatientsList failed:", err);
    // Fallback: basic SPA navigation
    setCurrentPage("patients");
    const hasRpmBase = (location.pathname || "").startsWith("/rpm");
    const finalPath = `${hasRpmBase ? "/rpm" : ""}/patients`;
    navigate(finalPath, { replace: true, state: { from: "sidebar", __force: Date.now() } });
  }
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
                    // special forced patients behavior
                    if (item.id === "patients") {
                      forceOpenPatientsList();
                      return;
                    }

                    // default handling for other menu items
                    setSidebarOpen(false);
                    const path = pathMap[item.id] || item.id;
                    setCurrentPage(item.id);
                    navigate(`/${path}`);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      currentPage === item.id
                        ? "bg-primary dark:bg-darkModeButton text-white dark:text-black"
                        : "text-gray-700 dark:text-darkModeText hover:bg-primary dark:hover:bg-darkModeButton hover:text-white dark:hover:text-black"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
                {auth?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-darkModeText truncate">
                  {auth?.user?.email || "Guest"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {auth?.user?.username || "Guest"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-3 py-2 text-sm text-gray-700 dark:text-darkModeText hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

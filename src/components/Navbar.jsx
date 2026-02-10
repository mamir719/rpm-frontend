// import React, { useContext, useState, useEffect, useRef } from "react";
// import { Menu, X, Bell, Mail, MailOpen } from "lucide-react";
// import { AuthContext } from "../context/AuthProvider";
// import { useSocket } from "../context/SocketContext";
// import ThemeToggle from "./ThemeToggle";
// import infuzamedLogo from "../assets/infuzamed_logo.png";
// import { useLocation, useNavigate } from "react-router-dom";

// // const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
// const API_BASE =
//   import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
//   const { auth } = useContext(AuthContext);
//   const { alerts, newAlert } = useSocket();
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [readAlerts, setReadAlerts] = useState(new Set());

//   const location = useLocation();
//   const navigate = useNavigate();

//   // track seen alert ids so we don't double-count the same alert when newAlert
//   // comes and socket also contains it in alerts array
//   const [seenAlertIds, setSeenAlertIds] = useState(new Set());
//   const seenAlertIdsRef = useRef(new Set());
//   const updateSeenIds = (idsSet) => {
//     seenAlertIdsRef.current = new Set(idsSet);
//     setSeenAlertIds(new Set(idsSet));
//   };

//   // ---------- small helpers for id detection + session storage ----------
//   const isId = (s) => !!(s && (/\d+/.test(s) || /^[0-9a-fA-F-]{8,}$/.test(s)));
//   const storageKeyFor = (id) => `infuzamed_patient_${id}`;

//   const storePatientNameForId = (id, name) => {
//     try {
//       if (!id || !name) return;
//       sessionStorage.setItem(storageKeyFor(id), name);
//     } catch (e) {
//       /* ignore storage errors */
//     }
//   };

//   const getStoredPatientName = (id) => {
//     try {
//       if (!id) return null;
//       return sessionStorage.getItem(storageKeyFor(id));
//     } catch (e) {
//       return null;
//     }
//   };
//   // --------------------------------------------------------------------

//   // helper to attempt to resolve a patient id for a given name/slug
//   const resolvePatientIdForName = (patientName, patientSlug) => {
//     try {
//       // 1) check location.state if it contains patientId
//       const st = location.state || {};
//       if (st.patientId) return st.patientId;

//       // 2) try to extract id from current pathname (vital-signs patterns)
//       const vitalsMatch = (location.pathname || "").match(/\/vital-signs\/([^\/]+)/);
//       if (vitalsMatch && vitalsMatch[1]) return vitalsMatch[1];

//       // 3) try to find a sessionStorage entry with matching stored patient name
//       for (let i = 0; i < sessionStorage.length; i++) {
//         const key = sessionStorage.key(i);
//         if (!key) continue;
//         if (key.startsWith("infuzamed_patient_")) {
//           const id = key.replace("infuzamed_patient_", "");
//           const val = sessionStorage.getItem(key);
//           if (val && patientName && val === patientName) {
//             return id;
//           }
//         }
//       }

//       // 4) try slug-based fallback if app stored something under slug keys
//       if (patientSlug) {
//         const maybe = sessionStorage.getItem(`patientId_bySlug_${patientSlug}`);
//         if (maybe) return maybe;
//       }

//       return null;
//     } catch (err) {
//       return null;
//     }
//   };

//   // ---------- Breadcrumb helpers ----------
//   const labelMap = {
//     dashboard: "Dashboard",
//     patients: "Patients",
//     alerts: "Alerts",
//     communication: "Patient Communication",
//     "device-management": "Device Management",
//     settings: "Settings",
//     summary: "Summary",
//     "summary-of-measurement": "Summary Of Measurement",
//     vitalsigns: "Vital Signs",
//     "vital-signs": "Vital Signs",
//   };

//   const prettify = (segment) =>
//     segment
//       .split("-")
//       .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
//       .join(" ");

//   const formatSegmentLabel = (segment, state) => {
//     if (!segment) return "";
//     // if segment looks like an id and state has patient name -> show that
//     if (
//       (/\d+/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment)) &&
//       (state?.patientName || state?.breadcrumbName)
//     ) {
//       return state.patientName || state.breadcrumbName;
//     }
//     // if segment looks like an id but state doesn't have name, try sessionStorage
//     if (isId(segment)) {
//       const stored = getStoredPatientName(segment);
//       if (stored) return stored;
//       // fallback to raw id label if nothing stored
//       return segment;
//     }
//     if (labelMap[segment]) return labelMap[segment];
//     return prettify(segment);
//   };

//   // slugify helper used to build a dashboard link for the patient name crumb
//   const slugify = (str) =>
//     String(str || "")
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9\-]/g, "");

//   /**
//    * Breadcrumb rules (special-case for origin: 'patient' visiting /vital-signs/:id)
//    */
//   // Replace your existing buildCrumbs() with this function
//   const buildCrumbs = () => {
//     const state = location.state || {};
//     const pathname = location.pathname || "";

//     // Normalize optional /rpm prefix
//     const path = pathname.replace(/^\/rpm\//, "/");

//     // 1) Patients flows
//     const patientsVitals = path.match(/^\/patients\/(?:vital-signs|vitalsigns)\/([^\/]+)/);
//     if (patientsVitals) {
//       const pid = patientsVitals[1];
//       const nameFromState = state.patientName || state.breadcrumbName;
//       const nameFromStore = getStoredPatientName(pid);
//       const label = nameFromState || nameFromStore || "Patient";
//       return [
//         { label: "Patients", path: "/patients", isLast: false },
//         { label, path: `/patients/vital-signs/${pid}` , isLast: true },
//       ];
//     }
//     if (/^\/patients\/?$/.test(path)) {
//       return [ { label: "Patients", path: "/patients", isLast: true } ];
//     }

//     // 2) Dashboard flows
//     const dashVitals = path.match(/^\/dashboard\/([^\/]+)\/vital-signs\/([^\/]+)/);
//     if (dashVitals) {
//       const slug = dashVitals[1];
//       const id = dashVitals[2];
//       const fromState = state.patientName || state.breadcrumbName;
//       const fromSlugStore = sessionStorage.getItem(`patientName_bySlug_${slug}`);
//       // Preserve exact casing if available from state or storage; otherwise derive from slug without changing case
//       let label = fromState || fromSlugStore || decodeURIComponent(slug).replace(/-/g, " ");
//       return [
//         { label: "Dashboard", path: "/dashboard", isLast: false },
//         { label, path: `/dashboard/${slug}`, isLast: true }, // do not show id
//       ];
//     }
//     const dashWithSlug = path.match(/^\/dashboard\/([^\/]+)\/?$/);
//     if (dashWithSlug) {
//       const slug = dashWithSlug[1];
//       const fromState = state.patientName || state.breadcrumbName;
//       const fromSlugStore = sessionStorage.getItem(`patientName_bySlug_${slug}`);
//       // Preserve exact casing if available; otherwise derive from slug without auto-capitalization
//       let label = fromState || fromSlugStore || decodeURIComponent(slug).replace(/-/g, " ");
//       return [
//         { label: "Dashboard", path: "/dashboard", isLast: false },
//         { label, path: `/dashboard/${slug}`, isLast: true },
//       ];
//     }
//     if (/^\/dashboard\/?$/.test(path)) {
//       return [ { label: "Dashboard", path: "/dashboard", isLast: true } ];
//     }

//     // 3) Fallback for other top-level pages
//     const parts = path.split("/").filter(Boolean);
//     if (!parts.length) {
//       return [ { label: "Dashboard", path: "/dashboard", isLast: true } ];
//     }
//     const first = parts[0];
//     const label = labelMap[first] || prettify(first);
//     return [ { label, path: `/${first}`, isLast: true } ];
//   };
//   // --- end buildCrumbs replacement ---

//   // Compute and then normalize crumbs to never mix roots (patients vs dashboard)
//   let crumbs = buildCrumbs();
//   try {
//     const root = (location.pathname || "").replace(/^\/(?:rpm\/)??/, "/").split("/").filter(Boolean)[0] || "dashboard";
//     if (root === "patients") {
//       crumbs = crumbs.filter((c, idx) => (idx === 0 && c.label === "Patients") || (idx > 0 && c.label !== "Dashboard"));
//     } else if (root === "dashboard") {
//       crumbs = crumbs.filter((c, idx) => (idx === 0 && c.label === "Dashboard") || (idx > 0 && c.label !== "Patients"));
//     }
//     // Remove consecutive duplicates by label
//     const tmp = [];
//     for (const c of crumbs) {
//       const prev = tmp[tmp.length - 1];
//       if (!prev || prev.label !== c.label) tmp.push(c); else tmp[tmp.length - 1] = c;
//     }
//     // Ensure only last is marked isLast
//     if (tmp.length > 1) {
//       tmp.forEach((c) => (c.isLast = false));
//       tmp[tmp.length - 1].isLast = true;
//     }
//     crumbs = tmp;
//   } catch {}
//   // ---------- end breadcrumb helpers ----------

//   // Persist patient name to sessionStorage whenever location.state contains it
//   useEffect(() => {
//     try {
//       const state = location.state || {};
//       const parts = (location.pathname || "").split("/").filter(Boolean);
//       // find first id segment in the path
//       const idSegment = parts.find((p) => isId(p));
//       const name = state.patientName || state.breadcrumbName;
//       if (idSegment && name) {
//         storePatientNameForId(idSegment, name);
//       }
//     } catch (e) {
//       // ignore
//     }
//   }, [location.pathname, location.state]);

//   // --------------------------
//   // NEW: Ensure Dashboard reacts to direct URLs like /dashboard/:slug
//   // without reloading the app. Dispatches openPatientFromBreadcrumb event so
//   // Dashboard can open the patient UI.
//   useEffect(() => {
//     try {
//       const path = location.pathname || "";
//       const match = path.match(/^\/(?:rpm\/)?dashboard\/([^\/]+)/);
//       if (!match) return;

//       const slug = match[1];

//       // prevent repeated dispatch for same slug unless forced by state.__force
//       const last = sessionStorage.getItem("infuzamed_last_opened_dashboard_slug");
//       if (last === slug && !location.state?.__force) {
//         return;
//       }
//       sessionStorage.setItem("infuzamed_last_opened_dashboard_slug", slug);

//       // Resolve patientName & patientId if possible
//       const patientName =
//         (location.state && (location.state.patientName || location.state.breadcrumbName)) ||
//         sessionStorage.getItem(`patientName_bySlug_${slug}`) ||
//         slug;

//       let patientId = null;
//       if (location.state && location.state.patientId) {
//         patientId = location.state.patientId;
//       } else {
//         // try slug-based mapping
//         const maybeId = sessionStorage.getItem(`patientId_bySlug_${slug}`);
//         if (maybeId) patientId = maybeId;
//       }

//       // build event detail (Dashboard expects patientId/patient)
//       const detail = {
//         patientId: patientId,
//         patientName: patientName,
//       };
//       if (patientId) detail.patient = { patient_id: patientId, name: patientName };

//       // dispatch event after microtask so Router updates location first
//       setTimeout(() => {
//         try {
//           window.dispatchEvent(
//             new CustomEvent("openPatientFromBreadcrumb", {
//               detail,
//             })
//           );
//         } catch (err) {
//           console.warn("dashboard auto-open dispatch failed", err);
//         }
//       }, 12);
//     } catch (err) {
//       console.warn("dashboard auto-open effect error", err);
//     }
//   }, [location.pathname, location.state]);

//   // --------------------------

//   // Load read status from database on component mount OR when auth.user changes (login)
//   useEffect(() => {
//     const loadReadStatus = async () => {
//       try {
//         const response = await fetch(`${API_BASE}/api/alerts/my-alerts`, {
//           credentials: "include",
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.ok && data.alerts) {
//             const readAlertIds = data.alerts
//               .filter((alert) => alert.read_status)
//               .map((alert) => alert.alert?.id || alert.id);
//             setReadAlerts(new Set(readAlertIds));

//             // Set notification count to unread alerts
//             const unreadCount = data.alerts.filter(
//               (alert) => !alert.read_status
//             ).length;
//             setNotificationCount(unreadCount);

//             // Mark all DB alert ids as seen to avoid double-counting when socket pushes same items
//             const allAlertIds = data.alerts.map((alert) => alert.alert?.id || alert.id).filter(Boolean);
//             updateSeenIds(new Set(allAlertIds));
//           }
//         }
//       } catch (error) {
//         console.error("Error loading read status:", error);
//       }
//     };

//     loadReadStatus();
//     // re-run when auth.user changes (so DB unread state is fetched after login)
//   }, [auth?.user?.id]); // <-- changed only to be persistent on login/logout

//   // Update notification count when new alerts arrive (avoid double counting)
//   useEffect(() => {
//     if (newAlert) {
//       try {
//         const id = newAlert.alert?.id || newAlert.id;
//         // if we already saw this id (from DB or previous socket), don't increment
//         if (id && seenAlertIdsRef.current.has(id)) return;

//         // otherwise record it and increment
//         const next = new Set(seenAlertIdsRef.current);
//         if (id) next.add(id);
//         updateSeenIds(next);

//         setNotificationCount((prev) => prev + 1);
//       } catch (err) {
//         console.warn("newAlert counting error", err);
//         // fallback: increment once
//         setNotificationCount((prev) => prev + 1);
//       }
//     }
//   }, [newAlert]);

//   // Get recent alerts for notification dropdown
//   // Get recent alerts for notification dropdown (deduped by id, preserve order, keep first 10)
// const recentAlerts = (() => {
//   if (!Array.isArray(alerts)) return [];
//   const seen = new Set();
//   const out = [];
//   for (const item of alerts) {
//     const id = item?.alert?.id || item?.id;
//     // use fallback string key for items without ids
//     const key = id ?? JSON.stringify(item);
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(item);
//     if (out.length >= 10) break;
//   }
//   return out;
// })();

// // Filter out read alerts for counter (based on deduped recentAlerts)
// const unreadAlerts = recentAlerts.filter((alertData) => {
//   const alert = alertData.alert || alertData;
//   return !readAlerts.has(alert.id);
// });

//   // Mark individual alert as read
//   const markAlertAsRead = async (alertId) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}/read`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const newReadAlerts = new Set([...readAlerts, alertId]);
//         setReadAlerts(newReadAlerts);
//         setNotificationCount((prev) => Math.max(0, prev - 1));
//       } else {
//         console.error("Failed to mark alert as read");
//       }
//     } catch (error) {
//       console.error("Error marking alert as read", error);
//     }
//   };

//   // Mark all alerts as read
//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/mark-all-read`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const allAlertIds = recentAlerts.map((alertData) => {
//           const alert = alertData.alert || alertData;
//           return alert.id;
//         });
//         const newReadAlerts = new Set([...readAlerts, ...allAlertIds]);
//         setReadAlerts(newReadAlerts);
//         setNotificationCount(0);
//       } else {
//         console.error("Failed to mark all alerts as read");
//       }
//     } catch (error) {
//       console.error("Error marking alert as read", error);
//     }
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         showNotifications &&
//         !event.target.closest(".notification-dropdown")
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   // ----------------------------------------------------------------
//   // Force immediate navigation (react-router) when the URL becomes /dashboard.
//   // Use sessionStorage to avoid infinite reload loops — navigate only once per visit.
//   useEffect(() => {
//     try {
//       const normalize = (p) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
//       const current = normalize(location.pathname || "/");
//       const DASH_KEY = "infuzamed_dashboard_reloaded_v1";

//       if (current === "/dashboard" || current === "/rpm/dashboard") {
//         const alreadyReloaded = sessionStorage.getItem(DASH_KEY);
//         if (!alreadyReloaded) {
//           sessionStorage.setItem(DASH_KEY, "1");
//           // Use react-router navigation to avoid full page reload while still
//           // re-processing route / state. This keeps the SPA alive and avoids tearing down JS.
//           navigate(current, { replace: true, state: location.state || {} });
//         }
//       } else {
//         sessionStorage.removeItem("infuzamed_dashboard_reloaded_v1");
//       }
//     } catch (e) {
//       console.error("dashboard force-nav effect error:", e);
//     }
//   }, [location.pathname, navigate, location.state]);
//   // ----------------------------------------------------------------

//   // Normalize dashboard path to match app base (/rpm vs no rpm)
//   const normalizeDashboardPathForApp = (targetPath) => {
//     // If targetPath already includes /rpm/dashboard or /dashboard, normalize it
//     // to match the current app base (if the current location starts with /rpm use /rpm)
//     const hasRpmBase = (location.pathname || "").startsWith("/rpm");
//     if (/^\/(?:rpm\/)?dashboard/.test(targetPath)) {
//       // replace any leading /rpm/dashboard or /dashboard with the app base
//       const base = hasRpmBase ? "/rpm" : "";
//       return targetPath.replace(/^\/(?:rpm\/)?dashboard/, `${base}/dashboard`);
//     }
//     return targetPath;
//   };

//   return (
//     <nav className="bg-white dark:bg-innerDarkColor shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-[200]">
//       <div className="px-4 lg:px-6">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             >
//               {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>

//             <img
//               src={infuzamedLogo}
//               alt="Infuzamed"
//               className="ml-2 lg:ml-0 h-8 md:h-12 lg:h-24 w-auto object-contain"
//             />

//             {/* Breadcrumbs (placed next to logo) */}
//             <div className="hidden md:flex items-center ml-16">
//               <nav aria-label="Breadcrumb">
//                 <ol className="flex items-center overflow-hidden rounded text-sm text-gray-700 dark:text-gray-200">
//                   {crumbs.map((crumb, idx) => {
//                     const isLast = crumb.isLast;
//                     const isFirst = idx === 0;

//                     return (
//                       <li
//                         key={crumb.path + "_" + idx}
//                         className="relative flex items-center"
//                       >
//                         <button
//                           onClick={() => {
//                             let target = crumb.path || "/";
//                             // If this is a dashboard patient crumb or a vitalsigns-derived dashboard path,
//                             // normalize to the app's base so routes match (handles /rpm vs root)
//                             // --- replace the dashboard-crumble branch with this ---
// // Dashboard/patient crumb click — replace the existing dashboard branch with this
// if (/^\/(?:rpm\/)?dashboard(?:\/.*)?$/.test(target)) {
//   // normalize path for /rpm or root
//   target = normalizeDashboardPathForApp(target);

//   // resolve slug and id
//   const patientSlugMatch = target.match(/^\/(?:rpm\/)?dashboard\/([^\/]+)/);
//   const patientSlug = patientSlugMatch ? patientSlugMatch[1] : null;
//   const resolvedId = resolvePatientIdForName(crumb.label, patientSlug);

//   // build a stable state (no Date.now volatile tokens)
//   const stateToPass = {
//     ...(location.state || {}),
//     showPatientModal: true,
//     patientName: crumb.label,
//     patientSlug,
//     patientId: resolvedId || undefined,
//     patient: resolvedId ? { patient_id: resolvedId, name: crumb.label } : undefined,
//     __processedForSlug: patientSlug, // marks we've prepared this slug
//     from: "/dashboard",
//   };

//   // ALWAYS replace so route/state is re-processed even if path is identical
//   navigate(target, { replace: true, state: stateToPass });

//   // dispatch event for listeners (PatientModal or other) after Router settles
//   setTimeout(() => {
//     try {
//       window.dispatchEvent(
//         new CustomEvent("openPatientFromBreadcrumb", { detail: stateToPass })
//       );
//     } catch (err) {
//       console.warn("breadcrumb dispatch failed", err);
//     }
//   }, 50);

//   return;
// }

//                             // --- patients breadcrumb: ALWAYS go to /patients (list) ---
//                             // --- patients breadcrumb: ALWAYS go to /patients (list) ---
// if (/^\/(?:rpm\/)?patients(?:\/.*)?$/.test(target)) {
//   const hasRpmBase = (location.pathname || "").startsWith("/rpm");
//   const base = hasRpmBase ? "/rpm" : "";
//   const finalPath = `${base}/patients`;

//   // COMPLETELY CLEAN STATE - no patient references at all
//   try {
//     localStorage.removeItem("currentPatientData");
//     localStorage.removeItem("selectedPatient");
//   } catch {}

//   // Clean sessionStorage of patient context
//   try {
//     for (let i = sessionStorage.length - 1; i >= 0; i--) {
//       const key = sessionStorage.key(i);
//       if (key && (
//         key.startsWith("patientName_bySlug_") ||
//         key.startsWith("patientId_bySlug_") ||
//         key.startsWith("infuzamed_patient_")
//       )) {
//         sessionStorage.removeItem(key);
//       }
//     }
//   } catch (e) {}

//   const stateToPass = {
//     from: "breadcrumb",
//     forcePatientsList: true,  // Explicitly force list view
//     __force: Date.now(),
//   };

//   // If we're already on /patients, replace with clean state
//   if ((location.pathname || "").replace(/\/+$/, "") === finalPath) {
//     navigate(finalPath, { replace: true, state: stateToPass });
//     return;
//   }

//   // Otherwise navigate to /patients with clean state
//   navigate(finalPath, { replace: true, state: stateToPass });
//   return;
// }
// // --- end patients breadcrumb ---
//                             // --- end patients breadcrumb ---

//                             // Otherwise, normalize path to preserve /rpm base if app uses it
//                             const normalized = normalizeDashboardPathForApp(target);

//                             if (location.pathname === normalized) {
//                               // If same path, replace to force state update
//                               navigate(normalized, { replace: true, state: location.state || {} });
//                               return;
//                             }

//                             navigate(normalized, { state: location.state || {} });
//                           }}
//                           className={`
//   relative h-10 leading-10 transition-colors shadow-md px-6
//   ${isFirst ? "pl-4 rounded-l" : "pl-8 -ml-4"}
//   ${isLast ? "pr-4 rounded-r" : "pr-8"}
//   ${
//     isLast
//       ? "bg-[#4591b4] text-white dark:bg-[#4591b4] dark:text-white font-semibold"
//       : "bg-[#123044] text-white hover:bg-[#0f2a35] dark:bg-[#123044] dark:text-white"
//   }
//   ${
//     !isFirst
//       ? "[clip-path:polygon(0_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,0_100%,12px_50%)]"
//       : "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,12px_50%)]"
//   }
//   ${
//     isFirst && isLast
//       ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
//       : ""
//   }
// `}
//                         >
//                           {crumb.label}
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ol>
//               </nav>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* Notification Bell */}
//             <div className="relative notification-dropdown">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
//               >
//                 <Bell className="h-5 w-5" />
//                 {notificationCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {notificationCount}
//                   </span>
//                 )}
//               </button>

//               {/* Notification Dropdown */}
//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-innerDarkColor rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
//                   <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                     <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
//                       Notifications
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {unreadAlerts.length} unread alerts
//                     </p>
//                   </div>

//                   <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                     {recentAlerts.length > 0 ? (
//                       recentAlerts.map((alertData, index) => {
//                         const alert = alertData.alert || alertData;
//                         const patient = alertData.patient || {};
//                         const isRead = readAlerts.has(alert.id);
//                         return (
//                           <div
//                             key={alert.id || index}
//                             className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
//                               isRead ? "bg-gray-50 dark:bg-gray-800/50" : ""
//                             }`}
//                           >
//                             <div className="flex items-start space-x-3">
//                               <div className="flex-shrink-0">
//                                 <div
//                                   className={`w-2 h-2 rounded-full ${
//                                     alert.type === "high"
//                                       ? "bg-red-500"
//                                       : alert.type === "medium"
//                                       ? "bg-orange-500"
//                                       : "bg-blue-500"
//                                   }`}
//                                 ></div>
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center justify-between">
//                                   <p
//                                     className={`text-sm font-medium ${
//                                       isRead
//                                         ? "text-gray-500 dark:text-gray-500"
//                                         : "text-primary dark:text-darkModeText"
//                                     }`}
//                                   >
//                                     {alert.type?.toUpperCase()} Alert -{" "}
//                                     {patient.name || "Unknown Patient"}
//                                   </p>
//                                   <div className="flex-shrink-0 ml-2">
//                                     {isRead ? (
//                                       <MailOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
//                                     ) : (
//                                       <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//                                     )}
//                                   </div>
//                                 </div>
//                                 <p
//                                   className={`text-sm ${
//                                     isRead
//                                       ? "text-gray-400 dark:text-gray-600"
//                                       : "text-gray-600 dark:text-gray-400"
//                                   }`}
//                                 >
//                                   {alert.desc}
//                                 </p>
//                                 <p
//                                   className={`text-xs ${
//                                     isRead
//                                       ? "text-gray-400 dark:text-gray-600"
//                                       : "text-gray-500 dark:text-gray-500"
//                                   }`}
//                                 >
//                                   {new Date(alert.created_at).toLocaleTimeString()}
//                                 </p>
//                               </div>
//                               {!isRead && (
//                                 <div className="flex-shrink-0">
//                                   <div className="flex items-center space-x-2">
//                                     <input
//                                       type="checkbox"
//                                       checked={isRead}
//                                       onChange={() => markAlertAsRead(alert.id)}
//                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//                                     />
//                                     <span className="text-xs text-gray-500 dark:text-gray-400">
//                                       Mark as read
//                                     </span>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="p-4 text-center text-gray-500 dark:text-gray-400">
//                         No notifications yet
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-3 border-t border-gray-200 dark:border-gray-700">
//                     <button
//                       onClick={markAllAsRead}
//                       className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
//                     >
//                       Mark all as read
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <ThemeToggle />
//             <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
//               {auth?.user?.name || "Guest"}
//             </div>
//             <div className="w-8 h-8 bg-innerDarkColor dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
//               {auth?.user?.name?.charAt(0) || "?"}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// // export default Navbar;
// import React, { useContext, useState, useEffect, useRef } from "react";
// import { Menu, X, Bell, Mail, MailOpen } from "lucide-react";
// import { AuthContext } from "../context/AuthProvider";
// import { useSocket } from "../context/SocketContext";
// import ThemeToggle from "./ThemeToggle";
// import infuzamedLogo from "../assets/infuzamed_logo.png";
// import { useLocation, useNavigate } from "react-router-dom";

// // const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
// const API_BASE =
//   import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
//   const { auth } = useContext(AuthContext);
//   const { alerts, newAlert } = useSocket();
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [readAlerts, setReadAlerts] = useState(new Set());

//   const location = useLocation();
//   const navigate = useNavigate();

//   // track seen alert ids so we don't double-count the same alert when newAlert
//   // comes and socket also contains it in alerts array
//   const [seenAlertIds, setSeenAlertIds] = useState(new Set());
//   const seenAlertIdsRef = useRef(new Set());
//   const updateSeenIds = (idsSet) => {
//     seenAlertIdsRef.current = new Set(idsSet);
//     setSeenAlertIds(new Set(idsSet));
//   };

//   // ---------- small helpers for id detection + session storage ----------
//   const isId = (s) => !!(s && (/\d+/.test(s) || /^[0-9a-fA-F-]{8,}$/.test(s)));
//   const storageKeyFor = (id) => `infuzamed_patient_${id}`;

//   const storePatientNameForId = (id, name) => {
//     try {
//       if (!id || !name) return;
//       sessionStorage.setItem(storageKeyFor(id), name);
//     } catch (e) {
//       /* ignore storage errors */
//     }
//   };

//   const getStoredPatientName = (id) => {
//     try {
//       if (!id) return null;
//       return sessionStorage.getItem(storageKeyFor(id));
//     } catch (e) {
//       return null;
//     }
//   };
//   // --------------------------------------------------------------------

//   // helper to attempt to resolve a patient id for a given name/slug
//   const resolvePatientIdForName = (patientName, patientSlug) => {
//     try {
//       // 1) check location.state if it contains patientId
//       const st = location.state || {};
//       if (st.patientId) return st.patientId;

//       // 2) try to extract id from current pathname (vital-signs patterns)
//       const vitalsMatch = (location.pathname || "").match(/\/vital-signs\/([^\/]+)/);
//       if (vitalsMatch && vitalsMatch[1]) return vitalsMatch[1];

//       // 3) try to find a sessionStorage entry with matching stored patient name
//       for (let i = 0; i < sessionStorage.length; i++) {
//         const key = sessionStorage.key(i);
//         if (!key) continue;
//         if (key.startsWith("infuzamed_patient_")) {
//           const id = key.replace("infuzamed_patient_", "");
//           const val = sessionStorage.getItem(key);
//           if (val && patientName && val === patientName) {
//             return id;
//           }
//         }
//       }

//       // 4) try slug-based fallback if app stored something under slug keys
//       if (patientSlug) {
//         const maybe = sessionStorage.getItem(`patientId_bySlug_${patientSlug}`);
//         if (maybe) return maybe;
//       }

//       return null;
//     } catch (err) {
//       return null;
//     }
//   };

//   // ---------- Breadcrumb helpers ----------
//   const labelMap = {
//     dashboard: "Dashboard",
//     patients: "Patients",
//     alerts: "Alerts",
//     communication: "Patient Communication",
//     "device-management": "Device Management",
//     settings: "Settings",
//     summary: "Summary",
//     "summary-of-measurement": "Summary Of Measurement",
//     vitalsigns: "Vital Signs",
//     "vital-signs": "Vital Signs",
//   };

//   const prettify = (segment) =>
//     segment
//       .split("-")
//       .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
//       .join(" ");

//   const formatSegmentLabel = (segment, state) => {
//     if (!segment) return "";
//     // if segment looks like an id and state has patient name -> show that
//     if (
//       (/\d+/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment)) &&
//       (state?.patientName || state?.breadcrumbName)
//     ) {
//       return state.patientName || state.breadcrumbName;
//     }
//     // if segment looks like an id but state doesn't have name, try sessionStorage
//     if (isId(segment)) {
//       const stored = getStoredPatientName(segment);
//       if (stored) return stored;
//       // fallback to raw id label if nothing stored
//       return segment;
//     }
//     if (labelMap[segment]) return labelMap[segment];
//     return prettify(segment);
//   };

//   // slugify helper used to build a dashboard link for the patient name crumb
//   const slugify = (str) =>
//     String(str || "")
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9\-]/g, "");

//   /**
//    * Breadcrumb rules (special-case for origin: 'patient' visiting /vital-signs/:id)
//    */
//   // Replace your existing buildCrumbs() with this function
//   const buildCrumbs = () => {
//     const state = location.state || {};
//     const pathname = location.pathname || "";

//     // Normalize optional /rpm prefix
//     const path = pathname.replace(/^\/rpm\//, "/");

//     // 1) Patients flows
//     const patientsVitals = path.match(/^\/patients\/(?:vital-signs|vitalsigns)\/([^\/]+)/);
//     if (patientsVitals) {
//       const pid = patientsVitals[1];
//       const nameFromState = state.patientName || state.breadcrumbName;
//       const nameFromStore = getStoredPatientName(pid);
//       const label = nameFromState || nameFromStore || "Patient";
//       return [
//         { label: "Patients", path: "/patients", isLast: false },
//         { label, path: `/patients/vital-signs/${pid}` , isLast: true },
//       ];
//     }
//     if (/^\/patients\/?$/.test(path)) {
//       return [ { label: "Patients", path: "/patients", isLast: true } ];
//     }

//     // 2) Dashboard flows
//     const dashVitals = path.match(/^\/dashboard\/([^\/]+)\/vital-signs\/([^\/]+)/);
//     if (dashVitals) {
//       const slug = dashVitals[1];
//       const id = dashVitals[2];
//       const fromState = state.patientName || state.breadcrumbName;
//       const fromSlugStore = sessionStorage.getItem(`patientName_bySlug_${slug}`);
//       // Preserve exact casing if available from state or storage; otherwise derive from slug without changing case
//       let label = fromState || fromSlugStore || decodeURIComponent(slug).replace(/-/g, " ");
//       return [
//         { label: "Dashboard", path: "/dashboard", isLast: false },
//         { label, path: `/dashboard/${slug}`, isLast: true }, // do not show id
//       ];
//     }
//     const dashWithSlug = path.match(/^\/dashboard\/([^\/]+)\/?$/);
//     if (dashWithSlug) {
//       const slug = dashWithSlug[1];
//       const fromState = state.patientName || state.breadcrumbName;
//       const fromSlugStore = sessionStorage.getItem(`patientName_bySlug_${slug}`);
//       // Preserve exact casing if available; otherwise derive from slug without auto-capitalization
//       let label = fromState || fromSlugStore || decodeURIComponent(slug).replace(/-/g, " ");
//       return [
//         { label: "Dashboard", path: "/dashboard", isLast: false },
//         { label, path: `/dashboard/${slug}`, isLast: true },
//       ];
//     }
//     if (/^\/dashboard\/?$/.test(path)) {
//       return [ { label: "Dashboard", path: "/dashboard", isLast: true } ];
//     }

//     // 3) Fallback for other top-level pages
//     const parts = path.split("/").filter(Boolean);
//     if (!parts.length) {
//       return [ { label: "Dashboard", path: "/dashboard", isLast: true } ];
//     }
//     const first = parts[0];
//     const label = labelMap[first] || prettify(first);
//     return [ { label, path: `/${first}`, isLast: true } ];
//   };
//   // --- end buildCrumbs replacement ---

//   // Compute and then normalize crumbs to never mix roots (patients vs dashboard)
//   let crumbs = buildCrumbs();
//   try {
//     const root = (location.pathname || "").replace(/^\/(?:rpm\/)??/, "/").split("/").filter(Boolean)[0] || "dashboard";
//     if (root === "patients") {
//       crumbs = crumbs.filter((c, idx) => (idx === 0 && c.label === "Patients") || (idx > 0 && c.label !== "Dashboard"));
//     } else if (root === "dashboard") {
//       crumbs = crumbs.filter((c, idx) => (idx === 0 && c.label === "Dashboard") || (idx > 0 && c.label !== "Patients"));
//     }
//     // Remove consecutive duplicates by label
//     const tmp = [];
//     for (const c of crumbs) {
//       const prev = tmp[tmp.length - 1];
//       if (!prev || prev.label !== c.label) tmp.push(c); else tmp[tmp.length - 1] = c;
//     }
//     // Ensure only last is marked isLast
//     if (tmp.length > 1) {
//       tmp.forEach((c) => (c.isLast = false));
//       tmp[tmp.length - 1].isLast = true;
//     }
//     crumbs = tmp;
//   } catch {}
//   // ---------- end breadcrumb helpers ----------

//   // Persist patient name to sessionStorage whenever location.state contains it
//   useEffect(() => {
//     try {
//       const state = location.state || {};
//       const parts = (location.pathname || "").split("/").filter(Boolean);
//       // find first id segment in the path
//       const idSegment = parts.find((p) => isId(p));
//       const name = state.patientName || state.breadcrumbName;
//       if (idSegment && name) {
//         storePatientNameForId(idSegment, name);
//       }
//     } catch (e) {
//       // ignore
//     }
//   }, [location.pathname, location.state]);

//   // --------------------------
//   // NEW: Ensure Dashboard reacts to direct URLs like /dashboard/:slug
//   // without reloading the app. Dispatches openPatientFromBreadcrumb event so
//   // Dashboard can open the patient UI.
//   useEffect(() => {
//     try {
//       const path = location.pathname || "";
//       const match = path.match(/^\/(?:rpm\/)?dashboard\/([^\/]+)/);
//       if (!match) return;

//       const slug = match[1];

//       // prevent repeated dispatch for same slug unless forced by state.__force
//       const last = sessionStorage.getItem("infuzamed_last_opened_dashboard_slug");
//       if (last === slug && !location.state?.__force) {
//         return;
//       }
//       sessionStorage.setItem("infuzamed_last_opened_dashboard_slug", slug);

//       // Resolve patientName & patientId if possible
//       const patientName =
//         (location.state && (location.state.patientName || location.state.breadcrumbName)) ||
//         sessionStorage.getItem(`patientName_bySlug_${slug}`) ||
//         slug;

//       let patientId = null;
//       if (location.state && location.state.patientId) {
//         patientId = location.state.patientId;
//       } else {
//         // try slug-based mapping
//         const maybeId = sessionStorage.getItem(`patientId_bySlug_${slug}`);
//         if (maybeId) patientId = maybeId;
//       }

//       // build event detail (Dashboard expects patientId/patient)
//       const detail = {
//         patientId: patientId,
//         patientName: patientName,
//       };
//       if (patientId) detail.patient = { patient_id: patientId, name: patientName };

//       // dispatch event after microtask so Router updates location first
//       setTimeout(() => {
//         try {
//           window.dispatchEvent(
//             new CustomEvent("openPatientFromBreadcrumb", {
//               detail,
//             })
//           );
//         } catch (err) {
//           console.warn("dashboard auto-open dispatch failed", err);
//         }
//       }, 12);
//     } catch (err) {
//       console.warn("dashboard auto-open effect error", err);
//     }
//   }, [location.pathname, location.state]);

//   // --------------------------

//   // Load read status from database on component mount OR when auth.user changes (login)
//   useEffect(() => {
//     const loadReadStatus = async () => {
//       try {
//         const response = await fetch(`${API_BASE}/api/alerts/my-alerts`, {
//           credentials: "include",
//         });

//         if (response.ok) {
//           const data = await response.json();
//           if (data.ok && data.alerts) {
//             const readAlertIds = data.alerts
//               .filter((alert) => alert.read_status)
//               .map((alert) => alert.alert?.id || alert.id);
//             setReadAlerts(new Set(readAlertIds));

//             // Set notification count to unread alerts
//             const unreadCount = data.alerts.filter(
//               (alert) => !alert.read_status
//             ).length;
//             setNotificationCount(unreadCount);

//             // Mark all DB alert ids as seen to avoid double-counting when socket pushes same items
//             const allAlertIds = data.alerts.map((alert) => alert.alert?.id || alert.id).filter(Boolean);
//             updateSeenIds(new Set(allAlertIds));
//           }
//         }
//       } catch (error) {
//         console.error("Error loading read status:", error);
//       }
//     };

//     loadReadStatus();
//     // re-run when auth.user changes (so DB unread state is fetched after login)
//   }, [auth?.user?.id]); // <-- changed only to be persistent on login/logout

//   // Update notification count when new alerts arrive (avoid double counting)
//   useEffect(() => {
//     if (newAlert) {
//       try {
//         const id = newAlert.alert?.id || newAlert.id;
//         // if we already saw this id (from DB or previous socket), don't increment
//         if (id && seenAlertIdsRef.current.has(id)) return;

//         // otherwise record it and increment
//         const next = new Set(seenAlertIdsRef.current);
//         if (id) next.add(id);
//         updateSeenIds(next);

//         setNotificationCount((prev) => prev + 1);
//       } catch (err) {
//         console.warn("newAlert counting error", err);
//         // fallback: increment once
//         setNotificationCount((prev) => prev + 1);
//       }
//     }
//   }, [newAlert]);

//   // Get recent alerts for notification dropdown
//   // Get recent alerts for notification dropdown (deduped by id, preserve order, keep first 10)
// const recentAlerts = (() => {
//   if (!Array.isArray(alerts)) return [];
//   const seen = new Set();
//   const out = [];
//   for (const item of alerts) {
//     const id = item?.alert?.id || item?.id;
//     // use fallback string key for items without ids
//     const key = id ?? JSON.stringify(item);
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(item);
//     if (out.length >= 10) break;
//   }
//   return out;
// })();

// // Filter out read alerts for counter (based on deduped recentAlerts)
// const unreadAlerts = recentAlerts.filter((alertData) => {
//   const alert = alertData.alert || alertData;
//   return !readAlerts.has(alert.id);
// });

//   // Mark individual alert as read
//   const markAlertAsRead = async (alertId) => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/${alertId}/read`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const newReadAlerts = new Set([...readAlerts, alertId]);
//         setReadAlerts(newReadAlerts);
//         setNotificationCount((prev) => Math.max(0, prev - 1));
//       } else {
//         console.error("Failed to mark alert as read");
//       }
//     } catch (error) {
//       console.error("Error marking alert as read", error);
//     }
//   };

//   // Listen for external requests to mark alert read (e.g. Alerts component)
//   useEffect(() => {
//     const handler = (e) => {
//       try {
//         const id = e?.detail?.alertId;
//         if (id) {
//           markAlertAsRead(id);
//         }
//       } catch (err) {
//         console.warn("markAlertRead event handler failed", err);
//       }
//     };
//     window.addEventListener("markAlertRead", handler);
//     return () => window.removeEventListener("markAlertRead", handler);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [readAlerts, notificationCount]); // capture latest states (markAlertAsRead closes over them)

//   // Mark all alerts as read
//   const markAllAsRead = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/alerts/mark-all-read`, {
//         method: "PATCH",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const allAlertIds = recentAlerts.map((alertData) => {
//           const alert = alertData.alert || alertData;
//           return alert.id;
//         });
//         const newReadAlerts = new Set([...readAlerts, ...allAlertIds]);
//         setReadAlerts(newReadAlerts);
//         setNotificationCount(0);
//       } else {
//         console.error("Failed to mark all alerts as read");
//       }
//     } catch (error) {
//       console.error("Error marking alert as read", error);
//     }
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         showNotifications &&
//         !event.target.closest(".notification-dropdown")
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showNotifications]);

//   // ----------------------------------------------------------------
//   // Force immediate navigation (react-router) when the URL becomes /dashboard.
//   // Use sessionStorage to avoid infinite reload loops — navigate only once per visit.
//   useEffect(() => {
//     try {
//       const normalize = (p) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
//       const current = normalize(location.pathname || "/");
//       const DASH_KEY = "infuzamed_dashboard_reloaded_v1";

//       if (current === "/dashboard" || current === "/rpm/dashboard") {
//         const alreadyReloaded = sessionStorage.getItem(DASH_KEY);
//         if (!alreadyReloaded) {
//           sessionStorage.setItem(DASH_KEY, "1");
//           // Use react-router navigation to avoid full page reload while still
//           // re-processing route / state. This keeps the SPA alive and avoids tearing down JS.
//           navigate(current, { replace: true, state: location.state || {} });
//         }
//       } else {
//         sessionStorage.removeItem("infuzamed_dashboard_reloaded_v1");
//       }
//     } catch (e) {
//       console.error("dashboard force-nav effect error:", e);
//     }
//   }, [location.pathname, navigate, location.state]);
//   // ----------------------------------------------------------------

//   // Normalize dashboard path to match app base (/rpm vs no rpm)
//   const normalizeDashboardPathForApp = (targetPath) => {
//     // If targetPath already includes /rpm/dashboard or /dashboard, normalize it
//     // to match the current app base (if the current location starts with /rpm use /rpm)
//     const hasRpmBase = (location.pathname || "").startsWith("/rpm");
//     if (/^\/(?:rpm\/)?dashboard/.test(targetPath)) {
//       // replace any leading /rpm/dashboard or /dashboard with the app base
//       const base = hasRpmBase ? "/rpm" : "";
//       return targetPath.replace(/^\/(?:rpm\/)?dashboard/, `${base}/dashboard`);
//     }
//     return targetPath;
//   };

//   return (
//     <nav className="bg-white dark:bg-innerDarkColor shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-[200]">
//       <div className="px-4 lg:px-6">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             >
//               {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>

//             <img
//               src={infuzamedLogo}
//               alt="Infuzamed"
//               className="ml-2 lg:ml-0 h-8 md:h-12 lg:h-24 w-auto object-contain"
//             />

//             {/* Breadcrumbs (placed next to logo) */}
//             <div className="hidden md:flex items-center ml-16">
//               <nav aria-label="Breadcrumb">
//                 <ol className="flex items-center overflow-hidden rounded text-sm text-gray-700 dark:text-gray-200">
//                   {crumbs.map((crumb, idx) => {
//                     const isLast = crumb.isLast;
//                     const isFirst = idx === 0;

//                     return (
//                       <li
//                         key={crumb.path + "_" + idx}
//                         className="relative flex items-center"
//                       >
//                         <button
//                           onClick={() => {
//                             let target = crumb.path || "/";
//                             // If this is a dashboard patient crumb or a vitalsigns-derived dashboard path,
//                             // normalize to the app's base so routes match (handles /rpm vs root)
//                             // --- replace the dashboard-crumble branch with this ---
// // Dashboard/patient crumb click — replace the existing dashboard branch with this
// if (/^\/(?:rpm\/)?dashboard(?:\/.*)?$/.test(target)) {
//   // normalize path for /rpm or root
//   target = normalizeDashboardPathForApp(target);

//   // resolve slug and id
//   const patientSlugMatch = target.match(/^\/(?:rpm\/)?dashboard\/([^\/]+)/);
//   const patientSlug = patientSlugMatch ? patientSlugMatch[1] : null;
//   const resolvedId = resolvePatientIdForName(crumb.label, patientSlug);

//   // build a stable state (no Date.now volatile tokens)
//   const stateToPass = {
//     ...(location.state || {}),
//     showPatientModal: true,
//     patientName: crumb.label,
//     patientSlug,
//     patientId: resolvedId || undefined,
//     patient: resolvedId ? { patient_id: resolvedId, name: crumb.label } : undefined,
//     __processedForSlug: patientSlug, // marks we've prepared this slug
//     from: "/dashboard",
//   };

//   // ALWAYS replace so route/state is re-processed even if path is identical
//   navigate(target, { replace: true, state: stateToPass });

//   // dispatch event for listeners (PatientModal or other) after Router settles
//   setTimeout(() => {
//     try {
//       window.dispatchEvent(
//         new CustomEvent("openPatientFromBreadcrumb", { detail: stateToPass })
//       );
//     } catch (err) {
//       console.warn("breadcrumb dispatch failed", err);
//     }
//   }, 50);

//   return;
// }

//                             // --- patients breadcrumb: ALWAYS go to /patients (list) ---
// if (/^\/(?:rpm\/)?patients(?:\/.*)?$/.test(target)) {
//   const hasRpmBase = (location.pathname || "").startsWith("/rpm");
//   const base = hasRpmBase ? "/rpm" : "";
//   const finalPath = `${base}/patients`;

//   // COMPLETELY CLEAN STATE - no patient references at all
//   try {
//     localStorage.removeItem("currentPatientData");
//     localStorage.removeItem("selectedPatient");
//   } catch {}

//   // Clean sessionStorage of patient context
//   try {
//     for (let i = sessionStorage.length - 1; i >= 0; i--) {
//       const key = sessionStorage.key(i);
//       if (key && (
//         key.startsWith("patientName_bySlug_") ||
//         key.startsWith("patientId_bySlug_") ||
//         key.startsWith("infuzamed_patient_")
//       )) {
//         sessionStorage.removeItem(key);
//       }
//     }
//   } catch (e) {}

//   const stateToPass = {
//     from: "breadcrumb",
//     forcePatientsList: true,  // Explicitly force list view
//     __force: Date.now(),
//   };

//   // If we're already on /patients, replace with clean state
//   if ((location.pathname || "").replace(/\/+$/, "") === finalPath) {
//     navigate(finalPath, { replace: true, state: stateToPass });
//     return;
//   }

//   // Otherwise navigate to /patients with clean state
//   navigate(finalPath, { replace: true, state: stateToPass });
//   return;
// }
// // --- end patients breadcrumb ---
//                             // --- end patients breadcrumb ---

//                             // Otherwise, normalize path to preserve /rpm base if app uses it
//                             const normalized = normalizeDashboardPathForApp(target);

//                             if (location.pathname === normalized) {
//                               // If same path, replace to force state update
//                               navigate(normalized, { replace: true, state: location.state || {} });
//                               return;
//                             }

//                             navigate(normalized, { state: location.state || {} });
//                           }}
//                           className={`
//   relative h-10 leading-10 transition-colors shadow-md px-6
//   ${isFirst ? "pl-4 rounded-l" : "pl-8 -ml-4"}
//   ${isLast ? "pr-4 rounded-r" : "pr-8"}
//   ${
//     isLast
//       ? "bg-[#4591b4] text-white dark:bg-[#4591b4] dark:text-white font-semibold"
//       : "bg-[#123044] text-white hover:bg-[#0f2a35] dark:bg-[#123044] dark:text-white"
//   }
//   ${
//     !isFirst
//       ? "[clip-path:polygon(0_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,0_100%,12px_50%)]"
//       : "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,12px_50%)]"
//   }
//   ${
//     isFirst && isLast
//       ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
//       : ""
//   }
// `}
//                         >
//                           {crumb.label}
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ol>
//               </nav>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* Notification Bell */}
//             <div className="relative notification-dropdown">
//               <button
//                 onClick={() => setShowNotifications(!showNotifications)}
//                 className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
//               >
//                 <Bell className="h-5 w-5" />
//                 {notificationCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {notificationCount}
//                   </span>
//                 )}
//               </button>

//               {/* Notification Dropdown */}
//               {showNotifications && (
//                 <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-innerDarkColor rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
//                   <div className="p-4 border-b border-gray-200 dark:border-gray-700">
//                     <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
//                       Notifications
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       {unreadAlerts.length} unread alerts
//                     </p>
//                   </div>

//                   <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
//                     {recentAlerts.length > 0 ? (
//                       recentAlerts.map((alertData, index) => {
//                         const alert = alertData.alert || alertData;
//                         const patient = alertData.patient || {};
//                         const isRead = readAlerts.has(alert.id);
//                         return (
//                           <div
//                             key={alert.id || index}
//                             className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
//                               isRead ? "bg-gray-50 dark:bg-gray-800/50" : ""
//                             }`}
//                           >
//                             <div className="flex items-start space-x-3">
//                               <div className="flex-shrink-0">
//                                 <div
//                                   className={`w-2 h-2 rounded-full ${
//                                     alert.type === "high"
//                                       ? "bg-red-500"
//                                       : alert.type === "medium"
//                                       ? "bg-orange-500"
//                                       : "bg-blue-500"
//                                   }`}
//                                 ></div>
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center justify-between">
//                                   <p
//                                     className={`text-sm font-medium ${
//                                       isRead
//                                         ? "text-gray-500 dark:text-gray-500"
//                                         : "text-primary dark:text-darkModeText"
//                                     }`}
//                                   >
//                                     {alert.type?.toUpperCase()} Alert -{" "}
//                                     {patient.name || "Unknown Patient"}
//                                   </p>
//                                   <div className="flex-shrink-0 ml-2">
//                                     {isRead ? (
//                                       <MailOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
//                                     ) : (
//                                       <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//                                     )}
//                                   </div>
//                                 </div>
//                                 <p
//                                   className={`text-sm ${
//                                     isRead
//                                       ? "text-gray-400 dark:text-gray-600"
//                                       : "text-gray-600 dark:text-gray-400"
//                                   }`}
//                                 >
//                                   {alert.desc}
//                                 </p>
//                                 <p
//                                   className={`text-xs ${
//                                     isRead
//                                       ? "text-gray-400 dark:text-gray-600"
//                                       : "text-gray-500 dark:text-gray-500"
//                                   }`}
//                                 >
//                                   {new Date(alert.created_at).toLocaleTimeString()}
//                                 </p>
//                               </div>
//                               {!isRead && (
//                                 <div className="flex-shrink-0">
//                                   <div className="flex items-center space-x-2">
//                                     <input
//                                       type="checkbox"
//                                       checked={isRead}
//                                       onChange={() => markAlertAsRead(alert.id)}
//                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//                                     />
//                                     <span className="text-xs text-gray-500 dark:text-gray-400">
//                                       Mark as read
//                                     </span>
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })
//                     ) : (
//                       <div className="p-4 text-center text-gray-500 dark:text-gray-400">
//                         No notifications yet
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-3 border-t border-gray-200 dark:border-gray-700">
//                     <button
//                       onClick={markAllAsRead}
//                       className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
//                     >
//                       Mark all as read
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <ThemeToggle />
//             <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
//               {auth?.user?.name || "Guest"}
//             </div>
//             <div className="w-8 h-8 bg-innerDarkColor dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
//               {auth?.user?.name?.charAt(0) || "?"}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useContext, useState, useEffect, useRef } from "react";
import { Menu, X, Bell, Mail, MailOpen } from "lucide-react";
import { AuthContext } from "../context/AuthProvider";
import { useSocket } from "../context/SocketContext";
import ThemeToggle from "./ThemeToggle";
import infuzamedLogo from "../assets/infuzamed_logo.png";
import { useLocation, useNavigate } from "react-router-dom";

// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// sessionStorage key for persisted alerts (navbar)
const NAV_ALERTS_KEY = "infuzamed_nav_alerts_v1";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { auth } = useContext(AuthContext);
  const { alerts, newAlert } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [readAlerts, setReadAlerts] = useState(new Set());

  const location = useLocation();
  const navigate = useNavigate();

  // track seen alert ids so we don't double-count the same alert when newAlert
  // comes and socket also contains it in alerts array
  const [seenAlertIds, setSeenAlertIds] = useState(new Set());
  const seenAlertIdsRef = useRef(new Set());
  const updateSeenIds = (idsSet) => {
    seenAlertIdsRef.current = new Set(idsSet);
    setSeenAlertIds(new Set(idsSet));
  };

  // Persisted alerts used when socket/DB not available (keeps bell visible across logout)
  const [persistedAlerts, setPersistedAlerts] = useState([]);

  // ---------- small helpers for id detection + session storage ----------
  const isId = (s) => !!(s && (/\d+/.test(s) || /^[0-9a-fA-F-]{8,}$/.test(s)));
  const storageKeyFor = (id) => `infuzamed_patient_${id}`;

  const storePatientNameForId = (id, name) => {
    try {
      if (!id || !name) return;
      sessionStorage.setItem(storageKeyFor(id), name);
    } catch (e) {
      /* ignore storage errors */
    }
  };

  const getStoredPatientName = (id) => {
    try {
      if (!id) return null;
      return sessionStorage.getItem(storageKeyFor(id));
    } catch (e) {
      return null;
    }
  };
  // --------------------------------------------------------------------

  // helper to attempt to resolve a patient id for a given name/slug
  const resolvePatientIdForName = (patientName, patientSlug) => {
    try {
      // 1) check location.state if it contains patientId
      const st = location.state || {};
      if (st.patientId) return st.patientId;

      // 2) try to extract id from current pathname (vital-signs patterns)
      const vitalsMatch = (location.pathname || "").match(
        /\/vital-signs\/([^\/]+)/
      );
      if (vitalsMatch && vitalsMatch[1]) return vitalsMatch[1];

      // 3) try to find a sessionStorage entry with matching stored patient name
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        if (key.startsWith("infuzamed_patient_")) {
          const id = key.replace("infuzamed_patient_", "");
          const val = sessionStorage.getItem(key);
          if (val && patientName && val === patientName) {
            return id;
          }
        }
      }

      // 4) try slug-based fallback if app stored something under slug keys
      if (patientSlug) {
        const maybe = sessionStorage.getItem(`patientId_bySlug_${patientSlug}`);
        if (maybe) return maybe;
      }

      return null;
    } catch (err) {
      return null;
    }
  };

  // ---------- Breadcrumb helpers ----------
  const labelMap = {
    dashboard: "Dashboard",
    patients: "Patients",
    alerts: "Alerts",
    communication: "Patient Communication",
    "device-management": "Device Management",
    settings: "Settings",
    summary: "Summary",
    "summary-of-measurement": "Summary Of Measurement",
    vitalsigns: "Vital Signs",
    "vital-signs": "Vital Signs",
  };

  const prettify = (segment) =>
    segment
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  const formatSegmentLabel = (segment, state) => {
    if (!segment) return "";
    // if segment looks like an id and state has patient name -> show that
    if (
      (/\d+/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment)) &&
      (state?.patientName || state?.breadcrumbName)
    ) {
      return state.patientName || state.breadcrumbName;
    }
    // if segment looks like an id but state doesn't have name, try sessionStorage
    if (isId(segment)) {
      const stored = getStoredPatientName(segment);
      if (stored) return stored;
      // fallback to raw id label if nothing stored
      return segment;
    }
    if (labelMap[segment]) return labelMap[segment];
    return prettify(segment);
  };

  // slugify helper used to build a dashboard link for the patient name crumb
  const slugify = (str) =>
    String(str || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  /**
   * Breadcrumb rules (special-case for origin: 'patient' visiting /vital-signs/:id)
   */
  // Replace your existing buildCrumbs() with this function
  const buildCrumbs = () => {
    const state = location.state || {};
    const pathname = location.pathname || "";

    // Normalize optional /rpm prefix
    const path = pathname.replace(/^\/rpm\//, "/");

    // 1) Patients flows
    const patientsVitals = path.match(
      /^\/patients\/(?:vital-signs|vitalsigns)\/([^\/]+)/
    );
    if (patientsVitals) {
      const pid = patientsVitals[1];
      const nameFromState = state.patientName || state.breadcrumbName;
      const nameFromStore = getStoredPatientName(pid);
      const label = nameFromState || nameFromStore || "Patient";
      return [
        { label: "Patients", path: "/patients", isLast: false },
        { label, path: `/patients/vital-signs/${pid}`, isLast: true },
      ];
    }
    if (/^\/patients\/?$/.test(path)) {
      return [{ label: "Patients", path: "/patients", isLast: true }];
    }

    // 2) Dashboard flows
    const dashVitals = path.match(
      /^\/dashboard\/([^\/]+)\/vital-signs\/([^\/]+)/
    );
    if (dashVitals) {
      const slug = dashVitals[1];
      const id = dashVitals[2];
      const fromState = state.patientName || state.breadcrumbName;
      const fromSlugStore = sessionStorage.getItem(
        `patientName_bySlug_${slug}`
      );
      // Preserve exact casing if available from state or storage; otherwise derive from slug without changing case
      let label =
        fromState ||
        fromSlugStore ||
        decodeURIComponent(slug).replace(/-/g, " ");
      return [
        { label: "Dashboard", path: "/dashboard", isLast: false },
        { label, path: `/dashboard/${slug}`, isLast: true }, // do not show id
      ];
    }
    const dashWithSlug = path.match(/^\/dashboard\/([^\/]+)\/?$/);
    if (dashWithSlug) {
      const slug = dashWithSlug[1];
      const fromState = state.patientName || state.breadcrumbName;
      const fromSlugStore = sessionStorage.getItem(
        `patientName_bySlug_${slug}`
      );
      // Preserve exact casing if available; otherwise derive from slug without auto-capitalization
      let label =
        fromState ||
        fromSlugStore ||
        decodeURIComponent(slug).replace(/-/g, " ");
      return [
        { label: "Dashboard", path: "/dashboard", isLast: false },
        { label, path: `/dashboard/${slug}`, isLast: true },
      ];
    }
    if (/^\/dashboard\/?$/.test(path)) {
      return [{ label: "Dashboard", path: "/dashboard", isLast: true }];
    }

    // 3) Fallback for other top-level pages
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) {
      return [{ label: "Dashboard", path: "/dashboard", isLast: true }];
    }
    const first = parts[0];
    const label = labelMap[first] || prettify(first);
    return [{ label, path: `/${first}`, isLast: true }];
  };
  // --- end buildCrumbs replacement ---

  // Compute and then normalize crumbs to never mix roots (patients vs dashboard)
  let crumbs = buildCrumbs();
  try {
    const root =
      (location.pathname || "")
        .replace(/^\/(?:rpm\/)??/, "/")
        .split("/")
        .filter(Boolean)[0] || "dashboard";
    if (root === "patients") {
      crumbs = crumbs.filter(
        (c, idx) =>
          (idx === 0 && c.label === "Patients") ||
          (idx > 0 && c.label !== "Dashboard")
      );
    } else if (root === "dashboard") {
      crumbs = crumbs.filter(
        (c, idx) =>
          (idx === 0 && c.label === "Dashboard") ||
          (idx > 0 && c.label !== "Patients")
      );
    }
    // Remove consecutive duplicates by label
    const tmp = [];
    for (const c of crumbs) {
      const prev = tmp[tmp.length - 1];
      if (!prev || prev.label !== c.label) tmp.push(c);
      else tmp[tmp.length - 1] = c;
    }
    // Ensure only last is marked isLast
    if (tmp.length > 1) {
      tmp.forEach((c) => (c.isLast = false));
      tmp[tmp.length - 1].isLast = true;
    }
    crumbs = tmp;
  } catch {}
  // ---------- end breadcrumb helpers ----------

  // Persist patient name to sessionStorage whenever location.state contains it
  useEffect(() => {
    try {
      const state = location.state || {};
      const parts = (location.pathname || "").split("/").filter(Boolean);
      // find first id segment in the path
      const idSegment = parts.find((p) => isId(p));
      const name = state.patientName || state.breadcrumbName;
      if (idSegment && name) {
        storePatientNameForId(idSegment, name);
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname, location.state]);

  // --------------------------
  // NEW: Ensure Dashboard reacts to direct URLs like /dashboard/:slug
  // without reloading the app. Dispatches openPatientFromBreadcrumb event so
  // Dashboard can open the patient UI.
  useEffect(() => {
    try {
      const path = location.pathname || "";
      const match = path.match(/^\/(?:rpm\/)?dashboard\/([^\/]+)/);
      if (!match) return;

      const slug = match[1];

      // prevent repeated dispatch for same slug unless forced by state.__force
      const last = sessionStorage.getItem(
        "infuzamed_last_opened_dashboard_slug"
      );
      if (last === slug && !location.state?.__force) {
        return;
      }
      sessionStorage.setItem("infuzamed_last_opened_dashboard_slug", slug);

      // Resolve patientName & patientId if possible
      const patientName =
        (location.state &&
          (location.state.patientName || location.state.breadcrumbName)) ||
        sessionStorage.getItem(`patientName_bySlug_${slug}`) ||
        slug;

      let patientId = null;
      if (location.state && location.state.patientId) {
        patientId = location.state.patientId;
      } else {
        // try slug-based mapping
        const maybeId = sessionStorage.getItem(`patientId_bySlug_${slug}`);
        if (maybeId) patientId = maybeId;
      }

      // build event detail (Dashboard expects patientId/patient)
      const detail = {
        patientId: patientId,
        patientName: patientName,
      };
      if (patientId)
        detail.patient = { patient_id: patientId, name: patientName };

      // dispatch event after microtask so Router updates location first
      setTimeout(() => {
        try {
          window.dispatchEvent(
            new CustomEvent("openPatientFromBreadcrumb", {
              detail,
            })
          );
        } catch (err) {
          console.warn("dashboard auto-open dispatch failed", err);
        }
      }, 12);
    } catch (err) {
      console.warn("dashboard auto-open effect error", err);
    }
  }, [location.pathname, location.state]);

  // --------------------------

  // Load persisted alerts from sessionStorage on mount (so bell keeps showing when logged out)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(NAV_ALERTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPersistedAlerts(parsed);
          // compute initial notification count from persisted alerts (filtered by readAlerts)
          const unread = parsed.filter((ad) => {
            const a = ad.alert || ad;
            return !(a && readAlerts.has(a.id));
          }).length;
          setNotificationCount((prev) => Math.max(prev, unread));
          const allIds = parsed
            .map((ad) => ad.alert?.id ?? ad.id)
            .filter(Boolean);
          if (allIds.length) updateSeenIds(new Set(allIds));
        }
      }
    } catch (err) {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load read status from database on component mount OR when auth.user changes (login)
  useEffect(() => {
    const loadReadStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/alerts/my-alerts`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.alerts) {
            // map DB rows into a safer alert object shape used by navbar
            const mapped = data.alerts.map((row) => {
              // If row already in nested shape, keep it; otherwise create nested shape
              if (row.alert || row.patient) return row;
              return {
                alert: {
                  id: row.id,
                  desc: row.desc,
                  type: row.type,
                  created_at: row.alert_created_at || row.created_at,
                },
                patient: {
                  id: row.patient_id || row.patient_id,
                  name: row.patient_name || "",
                },
                _raw: row,
              };
            });

            // Persist these for navigation sessions (so bell survives logout)
            try {
              sessionStorage.setItem(NAV_ALERTS_KEY, JSON.stringify(mapped));
            } catch (e) {
              // ignore storage errors
            }
            setPersistedAlerts(mapped);

            const readAlertIds = data.alerts
              .filter((alert) => alert.read_status)
              .map((alert) => alert.alert?.id || alert.id);
            setReadAlerts(new Set(readAlertIds));

            // Set notification count to unread alerts (DB truth)
            const unreadCount = data.alerts.filter(
              (alert) => !alert.read_status
            ).length;
            setNotificationCount(unreadCount);

            // Mark all DB alert ids as seen to avoid double-counting when socket pushes same items
            const allAlertIds = data.alerts
              .map((alert) => alert.alert?.id || alert.id)
              .filter(Boolean);
            updateSeenIds(new Set(allAlertIds));
          }
        }
      } catch (error) {
        console.error("Error loading read status:", error);
      }
    };

    loadReadStatus();
    // re-run when auth.user changes (so DB unread state is fetched after login)
  }, [auth?.user?.id]); // <-- changed only to be persistent on login/logout

  // When socket emits alerts or a newAlert arrives, persist them so navbar keeps them
  // When socket emits alerts or a newAlert arrives, persist them so navbar keeps them
  useEffect(() => {
    try {
      // Use socket's alerts array if present and non-empty, otherwise incorporate newAlert
      let incoming = [];
      if (Array.isArray(alerts) && alerts.length > 0) {
        incoming = alerts;
      } else if (newAlert) {
        incoming = [newAlert];
      }

      if (!incoming || incoming.length === 0) return;

      // Snapshot previously-seen ids so we can compute newly added ids
      const prevSeenIds = new Set(seenAlertIdsRef.current);

      // merge with persistedAlerts (dedupe by id or JSON key)
      const existing = Array.isArray(persistedAlerts)
        ? persistedAlerts.slice()
        : [];
      const seenKeys = new Set(
        existing.map((a) => a.alert?.id ?? a.id ?? JSON.stringify(a))
      );
      const merged = existing.slice();

      // track added items so we can compute which ids were newly introduced
      const addedItems = [];

      for (const inc of incoming) {
        const key = inc?.alert?.id ?? inc?.id ?? JSON.stringify(inc);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        // normalize incoming to nested shape if needed
        const normalized = inc.alert || inc;
        const patient = inc.patient || {};
        const item = { alert: normalized, patient, _raw: inc };
        // place incoming at front so newest appear first within their group
        merged.unshift(item);
        addedItems.push(item);
      }

      // Keep only recent N (say 50) to avoid huge storage
      const final = merged.slice(0, 50);
      setPersistedAlerts(final);
      try {
        sessionStorage.setItem(NAV_ALERTS_KEY, JSON.stringify(final));
      } catch (e) {
        // ignore storage write errors
      }

      // update seen ids so we don't double-count same alerts
      const allIds = final.map((ad) => ad.alert?.id ?? ad.id).filter(Boolean);
      if (allIds.length) {
        // compute newly added ids that weren't previously in seenAlertIdsRef
        const newlyAddedIds = addedItems
          .map((it) => it.alert?.id ?? it.id)
          .filter((id) => id && !prevSeenIds.has(id));

        // count only those newly added which aren't marked read
        const unreadNewCount = newlyAddedIds.reduce(
          (cnt, id) => (readAlerts.has(id) ? cnt : cnt + 1),
          0
        );
        if (unreadNewCount > 0) {
          setNotificationCount((prev) => prev + unreadNewCount);
        }

        updateSeenIds(new Set(allIds));
      }
    } catch (err) {
      console.warn("persist incoming alerts failed", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, newAlert]);

  // Update notification count when new alerts arrive (avoid double counting)
  useEffect(() => {
    if (newAlert) {
      try {
        const id = newAlert.alert?.id || newAlert.id;
        // if we already saw this id (from DB or previous socket), don't increment
        if (id && seenAlertIdsRef.current.has(id)) return;

        // otherwise record it and increment
        const next = new Set(seenAlertIdsRef.current);
        if (id) next.add(id);
        updateSeenIds(next);

        setNotificationCount((prev) => prev + 1);
      } catch (err) {
        console.warn("newAlert counting error", err);
        // fallback: increment once
        setNotificationCount((prev) => prev + 1);
      }
    }
  }, [newAlert]);

  // Get recent alerts for notification dropdown
  // MERGE socket alerts + persisted alerts (socket first), dedupe by id, preserve order
  const recentAlerts = (() => {
    const sock = Array.isArray(alerts) ? alerts : [];
    const persisted = Array.isArray(persistedAlerts) ? persistedAlerts : [];
    const combined = [...sock, ...persisted];
    if (!Array.isArray(combined)) return [];
    const seen = new Set();
    const out = [];
    for (const item of combined) {
      const idKey = item?.alert?.id ?? item?.id ?? JSON.stringify(item);
      if (seen.has(idKey)) continue;
      seen.add(idKey);
      out.push(item);
      if (out.length >= 10) break;
    }
    return out;
  })();

  // Filter out read alerts for counter (based on deduped recentAlerts)
  const unreadAlerts = recentAlerts.filter((alertData) => {
    const alert = alertData.alert || alertData;
    return !readAlerts.has(alert.id);
  });

  // Mark individual alert as read
  const markAlertAsRead = async (alertId) => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alertId}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const newReadAlerts = new Set([...readAlerts, alertId]);
        setReadAlerts(newReadAlerts);
        setNotificationCount((prev) => Math.max(0, prev - 1));

        // update persistedAlerts to reflect read (we don't mutate original shape heavily,
        // but we keep them in persisted set so UI still shows)
        try {
          const updated = (persistedAlerts || []).map((ad) => {
            const a = ad.alert || ad;
            if ((a?.id ?? a?.alert?.id) === alertId) {
              return { ...ad, _read: true };
            }
            return ad;
          });
          setPersistedAlerts(updated);
          sessionStorage.setItem(NAV_ALERTS_KEY, JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      } else {
        console.error("Failed to mark alert as read");
      }
    } catch (error) {
      console.error("Error marking alert as read", error);
    }
  };

  // Listen for external requests to mark alert read (e.g. Alerts component)
  useEffect(() => {
    const handler = (e) => {
      try {
        const id = e?.detail?.alertId;
        if (id) {
          markAlertAsRead(id);
        }
      } catch (err) {
        console.warn("markAlertRead event handler failed", err);
      }
    };
    window.addEventListener("markAlertRead", handler);
    return () => window.removeEventListener("markAlertRead", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readAlerts, notificationCount]); // capture latest states (markAlertAsRead closes over them)

  // Mark all alerts as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/alerts/mark-all-read`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const allAlertIds = recentAlerts
          .map((alertData) => {
            const alert = alertData.alert || alertData;
            return alert.id;
          })
          .filter(Boolean);
        const newReadAlerts = new Set([...readAlerts, ...allAlertIds]);
        setReadAlerts(newReadAlerts);
        setNotificationCount(0);

        // update persistedAlerts marking them read
        try {
          const updated = (persistedAlerts || []).map((ad) => ({
            ...ad,
            _read: true,
          }));
          setPersistedAlerts(updated);
          sessionStorage.setItem(NAV_ALERTS_KEY, JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      } else {
        console.error("Failed to mark all alerts as read");
      }
    } catch (error) {
      console.error("Error marking alert as read", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // ----------------------------------------------------------------
  // Force immediate navigation (react-router) when the URL becomes /dashboard.
  // Use sessionStorage to avoid infinite reload loops — navigate only once per visit.
  useEffect(() => {
    try {
      const normalize = (p) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
      const current = normalize(location.pathname || "/");
      const DASH_KEY = "infuzamed_dashboard_reloaded_v1";

      if (current === "/dashboard" || current === "/rpm/dashboard") {
        const alreadyReloaded = sessionStorage.getItem(DASH_KEY);
        if (!alreadyReloaded) {
          sessionStorage.setItem(DASH_KEY, "1");
          // Use react-router navigation to avoid full page reload while still
          // re-processing route / state. This keeps the SPA alive and avoids tearing down JS.
          navigate(current, { replace: true, state: location.state || {} });
        }
      } else {
        sessionStorage.removeItem("infuzamed_dashboard_reloaded_v1");
      }
    } catch (e) {
      console.error("dashboard force-nav effect error:", e);
    }
  }, [location.pathname, navigate, location.state]);
  // ----------------------------------------------------------------

  // Normalize dashboard path to match app base (/rpm vs no rpm)
  const normalizeDashboardPathForApp = (targetPath) => {
    // If targetPath already includes /rpm/dashboard or /dashboard, normalize it
    // to match the current app base (if the current location starts with /rpm use /rpm)
    const hasRpmBase = (location.pathname || "").startsWith("/rpm");
    if (/^\/(?:rpm\/)?dashboard/.test(targetPath)) {
      // replace any leading /rpm/dashboard or /dashboard with the app base
      const base = hasRpmBase ? "/rpm" : "";
      return targetPath.replace(/^\/(?:rpm\/)?dashboard/, `${base}/dashboard`);
    }
    return targetPath;
  };

  return (
    <nav className="bg-white dark:bg-innerDarkColor shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-[200]">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <img
              src={infuzamedLogo}
              alt="Infuzamed"
              className="ml-2 lg:ml-0 h-8 md:h-12 lg:h-24 w-auto object-contain"
            />

            {/* Breadcrumbs (placed next to logo) */}
            <div className="hidden md:flex items-center ml-16">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center overflow-hidden rounded text-sm text-gray-700 dark:text-gray-200">
                  {crumbs.map((crumb, idx) => {
                    const isLast = crumb.isLast;
                    const isFirst = idx === 0;

                    return (
                      <li
                        key={crumb.path + "_" + idx}
                        className="relative flex items-center"
                      >
                        <button
                          onClick={() => {
                            let target = crumb.path || "/";
                            // If this is a dashboard patient crumb or a vitalsigns-derived dashboard path,
                            // normalize to the app's base so routes match (handles /rpm vs root)
                            // --- replace the dashboard-crumble branch with this ---
                            // Dashboard/patient crumb click — replace the existing dashboard branch with this
                            if (
                              /^\/(?:rpm\/)?dashboard(?:\/.*)?$/.test(target)
                            ) {
                              // normalize path for /rpm or root
                              target = normalizeDashboardPathForApp(target);

                              // resolve slug and id
                              const patientSlugMatch = target.match(
                                /^\/(?:rpm\/)?dashboard\/([^\/]+)/
                              );
                              const patientSlug = patientSlugMatch
                                ? patientSlugMatch[1]
                                : null;
                              const resolvedId = resolvePatientIdForName(
                                crumb.label,
                                patientSlug
                              );

                              // build a stable state (no Date.now volatile tokens)
                              const stateToPass = {
                                ...(location.state || {}),
                                showPatientModal: true,
                                patientName: crumb.label,
                                patientSlug,
                                patientId: resolvedId || undefined,
                                patient: resolvedId
                                  ? {
                                      patient_id: resolvedId,
                                      name: crumb.label,
                                    }
                                  : undefined,
                                __processedForSlug: patientSlug, // marks we've prepared this slug
                                from: "/dashboard",
                              };

                              // ALWAYS replace so route/state is re-processed even if path is identical
                              navigate(target, {
                                replace: true,
                                state: stateToPass,
                              });

                              // dispatch event for listeners (PatientModal or other) after Router settles
                              setTimeout(() => {
                                try {
                                  window.dispatchEvent(
                                    new CustomEvent(
                                      "openPatientFromBreadcrumb",
                                      { detail: stateToPass }
                                    )
                                  );
                                } catch (err) {
                                  console.warn(
                                    "breadcrumb dispatch failed",
                                    err
                                  );
                                }
                              }, 50);

                              return;
                            }

                            // --- patients breadcrumb: ALWAYS go to /patients (list) ---
                            if (
                              /^\/(?:rpm\/)?patients(?:\/.*)?$/.test(target)
                            ) {
                              const hasRpmBase = (
                                location.pathname || ""
                              ).startsWith("/rpm");
                              const base = hasRpmBase ? "/rpm" : "";
                              const finalPath = `${base}/patients`;

                              // COMPLETELY CLEAN STATE - no patient references at all
                              try {
                                localStorage.removeItem("currentPatientData");
                                localStorage.removeItem("selectedPatient");
                              } catch {}

                              // Clean sessionStorage of patient context
                              try {
                                for (
                                  let i = sessionStorage.length - 1;
                                  i >= 0;
                                  i--
                                ) {
                                  const key = sessionStorage.key(i);
                                  if (
                                    key &&
                                    (key.startsWith("patientName_bySlug_") ||
                                      key.startsWith("patientId_bySlug_") ||
                                      key.startsWith("infuzamed_patient_"))
                                  ) {
                                    sessionStorage.removeItem(key);
                                  }
                                }
                              } catch (e) {}

                              const stateToPass = {
                                from: "breadcrumb",
                                forcePatientsList: true, // Explicitly force list view
                                __force: Date.now(),
                              };

                              // If we're already on /patients, replace with clean state
                              if (
                                (location.pathname || "").replace(
                                  /\/+$/,
                                  ""
                                ) === finalPath
                              ) {
                                navigate(finalPath, {
                                  replace: true,
                                  state: stateToPass,
                                });
                                return;
                              }

                              // Otherwise navigate to /patients with clean state
                              navigate(finalPath, {
                                replace: true,
                                state: stateToPass,
                              });
                              return;
                            }
                            // --- end patients breadcrumb ---
                            // --- end patients breadcrumb ---

                            // Otherwise, normalize path to preserve /rpm base if app uses it
                            const normalized =
                              normalizeDashboardPathForApp(target);

                            if (location.pathname === normalized) {
                              // If same path, replace to force state update
                              navigate(normalized, {
                                replace: true,
                                state: location.state || {},
                              });
                              return;
                            }

                            navigate(normalized, {
                              state: location.state || {},
                            });
                          }}
                          className={`
  relative h-10 leading-10 transition-colors shadow-md px-6
  ${isFirst ? "pl-4 rounded-l" : "pl-8 -ml-4"}
  ${isLast ? "pr-4 rounded-r" : "pr-8"}
  ${
    isLast
      ? "bg-[#4591b4] text-white dark:bg-[#4591b4] dark:text-white font-semibold"
      : "bg-[#123044] text-white hover:bg-[#0f2a35] dark:bg-[#123044] dark:text-white"
  }
  ${
    !isFirst
      ? "[clip-path:polygon(0_0,calc(100%-12px)_0,100%_50%,calc(100%-12px)_100%,0_100%,12px_50%)]"
      : "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%,12px_50%)]"
  }
  ${isFirst && isLast ? "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]" : ""}
`}
                        >
                          {crumb.label}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative notification-dropdown">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-innerDarkColor rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadAlerts.length} unread alerts
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {recentAlerts.length > 0 ? (
                      recentAlerts.map((alertData, index) => {
                        const alert = alertData.alert || alertData;
                        const patient = alertData.patient || {};
                        const isRead = readAlerts.has(alert.id);
                        return (
                          <div
                            key={alert.id || index}
                            className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              isRead ? "bg-gray-50 dark:bg-gray-800/50" : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    alert.type === "high"
                                      ? "bg-red-500"
                                      : alert.type === "medium"
                                      ? "bg-orange-500"
                                      : "bg-blue-500"
                                  }`}
                                ></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p
                                    className={`text-sm font-medium ${
                                      isRead
                                        ? "text-gray-500 dark:text-gray-500"
                                        : "text-primary dark:text-darkModeText"
                                    }`}
                                  >
                                    {alert.type?.toUpperCase()} Alert -{" "}
                                    {patient.name || "Unknown Patient"}
                                  </p>
                                  <div className="flex-shrink-0 ml-2">
                                    {isRead ? (
                                      <MailOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    )}
                                  </div>
                                </div>
                                <p
                                  className={`text-sm ${
                                    isRead
                                      ? "text-gray-400 dark:text-gray-600"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {alert.desc}
                                </p>
                                <p
                                  className={`text-xs ${
                                    isRead
                                      ? "text-gray-400 dark:text-gray-600"
                                      : "text-gray-500 dark:text-gray-500"
                                  }`}
                                >
                                  {new Date(
                                    alert.created_at
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              {!isRead && (
                                <div className="flex-shrink-0">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={isRead}
                                      onChange={() => markAlertAsRead(alert.id)}
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Mark as read
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No notifications yet
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={markAllAsRead}
                      className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />
            <div className="hidden md:block text-sm text-gray-600 dark:text-gray-300">
              {auth?.user?.name || "Guest"}
            </div>
            <div className="w-8 h-8 bg-innerDarkColor dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
              {auth?.user?.name?.charAt(0) || "?"}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

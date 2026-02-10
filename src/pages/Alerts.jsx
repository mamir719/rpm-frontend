// import React, { useState, useEffect, useMemo, useRef } from "react";
// // add after your useState declarations
// const latestTimestampRef = React.useRef(0); // stores ms epoch of newest alert we've persisted

// import { Loader } from "lucide-react";
// import AlertItem from "../components/AlertItem";
// import { useSocket } from "../context/SocketContext";

// const STORAGE_KEY = "infuzamed_alerts_v1";
// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

// const Alerts = () => {
//   const { alerts } = useSocket();
//   const [storedAlerts, setStoredAlerts] = useState([]); // persisted list (raw alertData objects)

//   // NEW: initial activity indicator when page opens
//   const [initialLoading, setInitialLoading] = useState(true);

//   // Filters
//   const [searchQuery, setSearchQuery] = useState("");
//   const [priorityFilter, setPriorityFilter] = useState("all"); // all | high | low
//   const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
//   const [toDate, setToDate] = useState(""); // yyyy-mm-dd

//   // Search API result (patient ids & names) to filter alerts by
//   const [searchPatientIds, setSearchPatientIds] = useState(new Set());
//   const [searchPatientNames, setSearchPatientNames] = useState(new Set()); // lowercased names returned by server
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchInitiated, setSearchInitiated] = useState(false); // <-- immediate UI indicator

//   // From disabled state when To == today
//   const [fromDisabled, setFromDisabled] = useState(false);

//   // Helper: stable id/key for dedupe
//   const stableKeyFor = (item) => {
//     const id = item?.alert?.id ?? item?.id;
//     if (id !== undefined && id !== null) return String(id);
//     try {
//       return JSON.stringify(item);
//     } catch {
//       return String(Math.random());
//     }
//   };

//   // Sorting helper - priority then timestamp (earlier first)
//   // Sorting helper - newest first (regardless of priority)
// const sortAlertsByPriority = (alertsList) => {
//   return [...alertsList].sort((a, b) => {
//     const aAlert = a.alert || a;
//     const bAlert = b.alert || b;

//     // prefer explicit timestamp fields, fallback to created_at/createdAt, then 0
//     const aTime = new Date(
//       aAlert.timestamp ?? aAlert.alert_created_at ?? aAlert.created_at ?? aAlert.createdAt ?? 0
//     ).getTime();
//     const bTime = new Date(
//       bAlert.timestamp ?? bAlert.alert_created_at ?? bAlert.created_at ?? bAlert.createdAt ?? 0
//     ).getTime();

//     // newest first
//     return bTime - aTime;
//   });
// };

//   // Format alert for display
//   const formatAlertForDisplay = (alertData) => {
//     const alert = alertData.alert || alertData;
//     const timestamp = alert.timestamp || alert.created_at || new Date().toISOString();
//     const timeAgo = getTimeAgo(timestamp);
//     const patientName =
//       alertData.patient?.name ||
//       alert?.patient?.name ||
//       alertData.patient_name ||
//       alert?.patient_name ||
//       `Patient ${alertData.patient_id || "Unknown"}`;

//     return {
//       id: alert.id || alertData.patient_id || stableKeyFor(alertData),
//       patient: {
//         name: patientName,
//       },
//       condition: `${alert.desc || alert.message || "Patient Alert"}${patientName ? ` - ${patientName}` : ""}`,
//       severity: alert.type ? capitalize(alert.type) : alert.severity || "Unknown",
//       time: timeAgo,
//       timestamp: timestamp,
//       originalData: alertData,
//     };
//   };

//   const capitalize = (s) => (typeof s === "string" && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s);

//   const getTimeAgo = (timestamp) => {
//     const now = new Date();
//     const alertTime = new Date(timestamp);
//     const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
//     if (isNaN(diffInMinutes)) return "Unknown time";
//     if (diffInMinutes < 1) return "Just now";
//     if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
//     if (diffInMinutes < 1440) {
//       const hours = Math.floor(diffInMinutes / 60);
//       return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//     }
//     const days = Math.floor(diffInMinutes / 1440);
//     return `${days} day${days > 1 ? "s" : ""} ago`;
//   };

//   // --- CHANGE: robust fetch from server with small retries + focus refetch ---
//   useEffect(() => {
//     let cancelled = false;
//     let retryTimerIds = [];

//     const mapRows = (rows) =>
//       rows.map((row) => ({
//         alert: {
//           id: row.id,
//           type: row.type,
//           timestamp: row.alert_created_at || row.created_at || row.timestamp,
//           created_at: row.alert_created_at || row.created_at,
//           desc: row.desc,
//           message: row.desc,
//           read_status: row.read_status,
//           assignment_id: row.assignment_id,
//         },
//         patient_id: row.patient_id,
//         patient: {
//           patient_id: row.patient_id,
//           name: row.patient_name || (row.patient && row.patient.name) || "",
//           email: row.patient_email,
//           phoneNumber: row.patient_phone,
//         },
//         created_at: row.alert_created_at || row.created_at,
//         updated_at: row.alert_updated_at || row.updated_at,
//         _raw: row,
//       }));

//     const fetchOnce = async (path, signal) => {
//       try {
//         const url = `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
//         const res = await fetch(url, {
//           method: "GET",
//           credentials: "include",
//           headers: { "Content-Type": "application/json" },
//           signal,
//         });
//         if (!res.ok) {
//           return { ok: false, status: res.status, statusText: res.statusText };
//         }
//         const json = await res.json().catch(() => null);
//         return { ok: true, status: res.status, statusText: res.statusText, json };
//       } catch (err) {
//         if (err.name === "AbortError") return { ok: false, aborted: true };
//         return { ok: false, error: err };
//       }
//     };

//     // candidate endpoints to try (in order) — won't modify API_BASE
//     const candidates = [
//       "/api/alerts/my-alerts",
//       "/api/alerts",
//       "/api/alerts?limit=200",
//       "/api/doctor/my-alerts",
//       "/api/doctor/alerts?limit=200",
//     ];

//     // try up to 3 attempts per candidate with small backoff; success stops further attempts
//     const fetchWithRetries = async () => {
//       try {
//         for (const path of candidates) {
//           if (cancelled) break;
//           // three attempts per path: immediate, + short backoffs
//           const attempts = [0, 400, 1200];
//           for (let i = 0; i < attempts.length && !cancelled; i++) {
//             if (i > 0) {
//               // wait delay
//               await new Promise((r) => {
//                 const id = setTimeout(r, attempts[i]);
//                 retryTimerIds.push(id);
//               });
//               if (cancelled) break;
//             }

//             const controller = new AbortController();
//             retryTimerIds.push(() => controller.abort && controller.abort());
//             const result = await fetchOnce(path, controller.signal);
//             if (cancelled) break;

//             if (result && result.ok && result.json) {
//               const payload = result.json;
//               let rows = null;

//               if (Array.isArray(payload.alerts)) rows = payload.alerts;
//               else if (Array.isArray(payload.data)) rows = payload.data;
//               else if (Array.isArray(payload)) rows = payload;
//               else if (payload?.alerts && Array.isArray(payload.alerts)) rows = payload.alerts;
//               else if (payload?.data && Array.isArray(payload.data)) rows = payload.data;
//               else if (payload?.alerts && Array.isArray(payload.alerts)) rows = payload.alerts;

//               if (Array.isArray(rows)) {
//                 const mapped = mapRows(rows);
//                 const sorted = sortAlertsByPriority(mapped);
//                 if (!cancelled) {
//   // compute newest timestamp in payload
//   const timeOf = (item) => {
//     try {
//       const a = item?.alert || item || {};
//       return new Date(a.timestamp ?? a.alert_created_at ?? a.created_at ?? a.createdAt ?? 0).getTime();
//     } catch {
//       return 0;
//     }
//   };
//   const payloadNewest = (Array.isArray(sorted) && sorted.length) ? timeOf(sorted[0]) : 0;
//   // only replace if payload contains an alert as new as what we already have,
//   // or if we have nothing yet (initial load)
//   if (payloadNewest >= latestTimestampRef.current || latestTimestampRef.current === 0) {
//     setStoredAlerts(sorted);
//     if (payloadNewest > latestTimestampRef.current) latestTimestampRef.current = payloadNewest;
//   } else {
//     // skip because our UI already has newer alerts from socket
//     // (keep current storedAlerts)
//     // console.debug("[Alerts] skipped older fetch result");
//   }
// }

//                 return;
//               } else {
//                 // payload didn't contain an array we expect: continue to next attempt/path
//                 // but don't clear storedAlerts
//                 // console.warn for diagnostics
//                 // eslint-disable-next-line no-console
//                 console.warn(`[Alerts] endpoint ${path} returned unexpected payload shape`, payload);
//               }
//             } else {
//               // eslint-disable-next-line no-console
//               console.warn(`[Alerts] fetch attempt for ${path} failed:`, result && (result.status || result.error || result.statusText));
//             }
//           }
//         }

//         // After trying all candidates and attempts: do not clear storedAlerts (keep whatever was there)
//         // eslint-disable-next-line no-console
//         console.warn("[Alerts] no valid endpoint returned alerts. kept existing storedAlerts (did not clear).");
//       } finally {
//         if (!cancelled) setInitialLoading(false);
//       }
//     };

//     // ensure initialLoading is true at mount
//     setInitialLoading(true);
//     // initial fetch
//     fetchWithRetries();

//     // refetch when window gains focus (helps when auth completes elsewhere)
//     const onFocus = () => {
//       const id = setTimeout(() => {
//         if (!cancelled) {
//           setInitialLoading(true);
//           fetchWithRetries();
//         }
//       }, 200);
//       retryTimerIds.push(id);
//     };
//     window.addEventListener("focus", onFocus);

//     return () => {
//       cancelled = true;
//       window.removeEventListener("focus", onFocus);
//       retryTimerIds.forEach((t) => {
//         try {
//           if (typeof t === "number") clearTimeout(t);
//           else if (typeof t === "function") t();
//         } catch {}
//       });
//       // ensure loader is turned off if unmounted
//       try { setInitialLoading(false); } catch {}
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Merge incoming socket alerts into storedAlerts (dedupe by stable key),
//   // BUT do not clear storedAlerts when socket sends empty array.
//   // Merge incoming socket alerts into storedAlerts (dedupe by stable key),
// // BUT do not clear storedAlerts when socket sends empty array.
// // Merge incoming socket alerts into storedAlerts (dedupe by stable key),
// // BUT do not clear storedAlerts when socket sends empty array.
// // Replace your existing "merge incoming socket alerts" useEffect with this block:
// useEffect(() => {
//   try {
//     if (!Array.isArray(alerts) || alerts.length === 0) {
//       return;
//     }

//     // dedupe incoming by stable key (preserve incoming order initially)
//     const seenIncoming = new Set();
//     const dedupedIncoming = [];
//     for (const incoming of alerts) {
//       const key = stableKeyFor(incoming);
//       if (seenIncoming.has(key)) continue;
//       seenIncoming.add(key);
//       dedupedIncoming.push(incoming);
//     }

//     const timeOf = (item) => {
//       try {
//         const a = item?.alert || item || {};
//         return new Date(
//           a.timestamp ?? a.alert_created_at ?? a.created_at ?? a.createdAt ?? 0
//         ).getTime();
//       } catch {
//         return 0;
//       }
//     };

//     // order incoming newest-first
//     dedupedIncoming.sort((a, b) => timeOf(b) - timeOf(a));

//     // functional update to avoid races
//     setStoredAlerts((prev = []) => {
//       // Build map so incoming items override existing ones (by key)
//       const map = new Map();

//       // Add incoming first (authoritative/new)
//       for (const inc of dedupedIncoming) {
//         map.set(stableKeyFor(inc), inc);
//       }

//       // Add previous items only if they are not superseded by incoming
//       for (const ex of prev) {
//         const k = stableKeyFor(ex);
//         if (!map.has(k)) map.set(k, ex);
//       }

//       // Create merged array and sort globally newest-first by timestamp
//       const merged = Array.from(map.values());
//       merged.sort((a, b) => timeOf(b) - timeOf(a));

//       // update latestTimestampRef to the timestamp of the newest item we now have
//       if (merged.length) {
//         const newest = timeOf(merged[0]);
//         if (newest && newest > latestTimestampRef.current) {
//           latestTimestampRef.current = newest;
//         }
//       }

//       return merged;
//     });
//   } catch (err) {
//     console.error("Error merging alerts:", err);
//   }
// // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [alerts]);

//   // date helpers: convert yyyy-mm-dd to start/end timestamp
//   const toStartOfDay = (yyyyMmDd) => {
//     if (!yyyyMmDd) return null;
//     const d = new Date(yyyyMmDd + "T00:00:00");
//     return d.getTime();
//   };
//   const toEndOfDay = (yyyyMmDd) => {
//     if (!yyyyMmDd) return null;
//     const d = new Date(yyyyMmDd + "T23:59:59.999");
//     return d.getTime();
//   };

//   // today string for max constraint (YYYY-MM-DD)
//   const todayStr = new Date().toISOString().slice(0, 10);

//   // Enforce From / To constraints and disabling logic
//   useEffect(() => {
//     // Ensure toDate not beyond today
//     if (toDate && new Date(toDate) > new Date(todayStr)) {
//       setToDate(todayStr);
//       return;
//     }

//     // If toDate is today -> from becomes today and From made readOnly (not disabled)
//     if (toDate === todayStr) {
//       if (fromDate !== todayStr) setFromDate(todayStr);
//       setFromDisabled(true);
//       return;
//     }

//     // Otherwise enable From and ensure it does not exceed To or today
//     setFromDisabled(false);

//     if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//       // clamp fromDate to toDate
//       setFromDate(toDate);
//       return;
//     }

//     if (fromDate && new Date(fromDate) > new Date(todayStr)) {
//       // clamp fromDate to today
//       setFromDate(todayStr);
//       return;
//     }
//     // no further action
//   }, [toDate]); // eslint-disable-line

//   // When fromDate changes and it's today -> set To to today and make From readOnly
//   useEffect(() => {
//     // clamp fromDate to today if needed
//     if (fromDate && new Date(fromDate) > new Date(todayStr)) {
//       setFromDate(todayStr);
//       return;
//     }

//     // If From chosen equals today -> set To to today and make From readOnly
//     if (fromDate === todayStr) {
//       if (toDate !== todayStr) setToDate(todayStr);
//       setFromDisabled(true);
//       return;
//     }

//     // otherwise ensure From is not after To; if it is, set To = From
//     setFromDisabled(false);
//     if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//       setToDate(fromDate);
//     }
//   }, [fromDate]); // eslint-disable-line

//   // Search API integration (debounced) — mirrors Dashboard search pattern
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const q = (searchQuery || "").trim();
//       if (!q) {
//         // clear search-patient filter
//         setSearchPatientIds(new Set());
//         setSearchPatientNames(new Set());
//         setSearchLoading(false);
//         return;
//       }

//       (async () => {
//         try {
//           setSearchLoading(true);
//           const params = new URLSearchParams({ search: q });
//           const res = await fetch(`${API_BASE}/api/doctor/search-patients?${params.toString()}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//           });
//           if (!res.ok) {
//             setSearchPatientIds(new Set());
//             setSearchPatientNames(new Set());
//             setSearchLoading(false);
//             return;
//           }
//           const json = await res.json();
//           if (json && json.success && Array.isArray(json.data)) {
//             // gather patient ids & names returned
//             const ids = new Set();
//             const names = new Set();
//             for (const p of json.data) {
//               const id = p.patient_id ?? p.id ?? p.userId ?? p.user_id;
//               if (id !== undefined && id !== null) ids.add(String(id));
//               const nm = (p.name ?? p.patient_name ?? p.username ?? "").toString().trim().toLowerCase();
//               if (nm) names.add(nm);
//             }
//             setSearchPatientIds(ids);
//             setSearchPatientNames(names);
//           } else {
//             // fallback: clear
//             setSearchPatientIds(new Set());
//             setSearchPatientNames(new Set());
//           }
//         } catch (err) {
//           console.warn("Alerts search API failed:", err);
//           setSearchPatientIds(new Set());
//           setSearchPatientNames(new Set());
//         } finally {
//           setSearchLoading(false);
//         }
//       })();
//     }, 600);

//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchQuery]);

//   // --- NEW: immediate search triggered by button (same endpoint + loading UX as Dashboard) ---
//   const searchPatientsImmediate = async () => {
//     const q = (searchQuery || "").trim();
//     if (!q) {
//       setSearchPatientIds(new Set());
//       setSearchPatientNames(new Set());
//       return;
//     }

//     // show page indicator instantly
//     setSearchInitiated(true);
//     setSearchLoading(true);

//     try {
//       const params = new URLSearchParams({ search: q });
//       const res = await fetch(`${API_BASE}/api/doctor/search-patients?${params.toString()}`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       });
//       if (!res.ok) {
//         setSearchPatientIds(new Set());
//         setSearchPatientNames(new Set());
//         return;
//       }
//       const json = await res.json();
//       if (json && json.success && Array.isArray(json.data)) {
//         const ids = new Set();
//         const names = new Set();
//         for (const p of json.data) {
//           const id = p.patient_id ?? p.id ?? p.userId ?? p.user_id;
//           if (id !== undefined && id !== null) ids.add(String(id));
//           const nm = (p.name ?? p.patient_name ?? p.username ?? "").toString().trim().toLowerCase();
//           if (nm) names.add(nm);
//         }
//         setSearchPatientIds(ids);
//         setSearchPatientNames(names);
//       } else {
//         setSearchPatientIds(new Set());
//         setSearchPatientNames(new Set());
//       }
//     } catch (err) {
//       console.warn("Alerts immediate search failed:", err);
//       setSearchPatientIds(new Set());
//       setSearchPatientNames(new Set());
//     } finally {
//       setSearchLoading(false);
//       setSearchInitiated(false);
//     }
//   };
//   // --- end immediate search ---

//   // Derived: apply search + priority + date filters and format for display
//   const displayedAlerts = useMemo(() => {
//     if (!storedAlerts || storedAlerts.length === 0) return [];

//     const q = String(searchQuery || "").trim().toLowerCase();
//     const pf = (priorityFilter || "all").toLowerCase();
//     const fromTs = toStartOfDay(fromDate);
//     const toTs = toEndOfDay(toDate);

//     // If there's a search query, don't show any local results while search is running.
//     // After search finishes, only show matches that exist in searchPatientIds OR searchPatientNames.
//     const isSearching = q.length > 0;

//     // If user typed a query and remote search is in-flight -> temporarily return empty and UI will show activity.
//     if (isSearching && (searchLoading || searchInitiated)) return [];

//     const filtered = storedAlerts.filter((alertData) => {
//       const alert = alertData.alert || alertData;
//       const patientName =
//         (alertData.patient?.name || alert?.patient?.name || alertData.patient_name || alert?.patient_name || "")
//           .toString()
//           .toLowerCase();

//       // SEARCH logic: when query exists, require server results (searchPatientIds OR searchPatientNames).
//       let matchesSearch = true;
//       if (isSearching) {
//         if ((searchPatientIds && searchPatientIds.size > 0) || (searchPatientNames && searchPatientNames.size > 0)) {
//           const pid =
//             alertData.patient?.patient_id ??
//             alertData.patient?.id ??
//             alert.patient_id ??
//             alert.id ??
//             alert.patient?.userId ??
//             alert.user_id;
//           const pidMatch = pid ? searchPatientIds.has(String(pid)) : false;
//           const nameMatch = patientName && searchPatientNames.has(patientName);
//           // accept if id matched OR name matched (both sets are from server)
//           matchesSearch = pidMatch || nameMatch;
//         } else {
//           // search finished but server returned nothing -> show no results
//           matchesSearch = false;
//         }
//       }

//       // priority/type (medium removed)
//       const type = (alert.type || "").toLowerCase() || (alert.severity || "").toLowerCase() || "low";
//       const matchesPriority = pf === "all" || type === pf;

//       // date filtering based on alert timestamp or created_at
//       const ts = new Date(alert.timestamp || alert.created_at || alert.createdAt || Date.now()).getTime();
//       const matchesFrom = fromTs === null || ts >= fromTs;
//       const matchesTo = toTs === null || ts <= toTs;

//       return matchesSearch && matchesPriority && matchesFrom && matchesTo;
//     });

//     // Keep the storedAlerts order (already sorted) — then map to display format
//     return filtered.map(formatAlertForDisplay);
//   }, [storedAlerts, searchQuery, priorityFilter, fromDate, toDate, searchPatientIds, searchPatientNames, searchLoading, searchInitiated]);

//   return (
//     <div className="space-y-6">
//       {/* Small CSS to make the date-picker icon visible/white in dark mode (WebKit) */}
//       <style>{`
//         /* make sure the calendar icon is visible and bright in dark mode for WebKit browsers */
//         .date-input::-webkit-calendar-picker-indicator {
//           cursor: pointer;
//           opacity: 0.95;
//         }
//         .dark .date-input::-webkit-calendar-picker-indicator {
//           filter: invert(1) brightness(2) contrast(1);
//         }
//         /* Edge/IE */
//         .date-input::-ms-expand {
//           filter: invert(1) brightness(2) contrast(1);
//         }

//         /* Ensure icon stays visible when input is readonly (prevents it vanishing) */
//         .date-input[readonly]::-webkit-calendar-picker-indicator {
//           cursor: pointer;
//           opacity: 0.95;
//           pointer-events: auto;
//         }
//         .dark .date-input[readonly]::-webkit-calendar-picker-indicator {
//           filter: invert(1) brightness(2) contrast(1);
//           pointer-events: auto;
//         }
//       `}</style>

//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <h2 className="text-2xl font-bold text-primary dark:text-white">Alerts</h2>

//         <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
//           {/* Search (stretches on small screens) */}
//           <div className="w-full sm:w-[260px]">
//             <div className="relative">
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search by patient name..."
//                 className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//               />
//             </div>
//           </div>

//           {/* Search button (top) */}
//           <div className="w-full sm:w-auto">
//             <button
//               onClick={searchPatientsImmediate}
//               disabled={searchLoading || searchInitiated}
//               className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
//             >
//               {searchLoading || searchInitiated ? (
//                 <div className="flex items-center space-x-2">
//                   <Loader className="w-4 h-4 animate-spin" />
//                   <span>Searching...</span>
//                 </div>
//               ) : (
//                 "Search"
//               )}
//             </button>
//           </div>

//           {/* Priority filter - MEDIUM REMOVED */}
//           <div className="w-full sm:w-auto">
//             <select
//               value={priorityFilter}
//               onChange={(e) => setPriorityFilter(e.target.value)}
//               className="w-full sm:w-auto px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm focus:outline-none text-gray-900 dark:text-white"
//             >
//               <option value="all">All priorities</option>
//               <option value="high">High</option>
//               <option value="low">Low</option>
//             </select>
//           </div>

//           {/* From / To date pickers */}
//           <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
//             <label className="text-xs text-gray-600 dark:text-gray-300">From</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
//               max={toDate ? toDate : todayStr} // cannot select dates after To (or after today)
//               readOnly={fromDisabled} // use readOnly so icon stays visible
//             />
//             <label className="text-xs text-gray-600 dark:text-gray-300">To</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
//               min={fromDate ? fromDate : undefined} // disable dates before From
//               max={todayStr} // next day after today disabled
//             />
//           </div>
//         </div>
//       </div>

//       <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex flex-col sm:flex-row sm:items_center justify-between gap-3">
//             <div>
//               <h3 className="text-lg font-medium text-primary dark:text-darkModeText">Active Alerts</h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">Use filters to refine visible alerts</p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
//               {/* Search (duplicate header control for card) */}
//               <div className="w-full sm:w-[220px]">
//                 <input
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search by patient name..."
//                   className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
//                 />
//               </div>

//               {/* Search button (card) */}
//               <div className="w-full sm:w-auto">
//                 <button
//                   onClick={searchPatientsImmediate}
//                   disabled={searchLoading || searchInitiated}
//                   className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
//                 >
//                   {searchLoading || searchInitiated ? (
//                     <div className="flex items-center space-x-2">
//                       <Loader className="w-4 h-4 animate-spin" />
//                       <span>Searching...</span>
//                     </div>
//                   ) : (
//                     "Search"
//                   )}
//                 </button>
//               </div>

//               {/* Priority select */}
//               <div className="w-full sm:w-auto">
//                 <select
//                   value={priorityFilter}
//                   onChange={(e) => setPriorityFilter(e.target.value)}
//                   className="w-full sm:w-auto px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white focus:outline-none"
//                 >
//                   <option value="all">All priorities</option>
//                   <option value="high">High</option>
//                   <option value="low">Low</option>
//                 </select>
//               </div>

//               {/* From / To */}
//               <div className="flex items-center gap-2">
//                 <label className="text-xs text-gray-600 dark:text-gray-300">From</label>
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
//                   max={toDate ? toDate : todayStr}
//                   readOnly={fromDisabled}
//                 />
//                 <label className="text-xs text-gray-600 dark:text-gray-300">To</label>
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
//                   min={fromDate ? fromDate : undefined}
//                   max={todayStr}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Body: show loading indicator while remote search is running OR while initial page load is fetching */}
//         {(initialLoading || searchLoading || searchInitiated) ? (
//           <div className="px-6 py-12 text-center">
//             <div className="flex flex-col items-center space-y-3">
//               <Loader className="w-8 h-8 animate-spin text-gray-500 dark:text-gray-300" />
//               <div className="text-sm text-gray-600 dark:text-gray-400">Searching patients...</div>
//             </div>
//           </div>
//         ) : displayedAlerts && displayedAlerts.length > 0 ? (
//           <div className="divide-y divide-gray-200 dark:divide-gray-700">
//             {displayedAlerts.map((a) => (
//               <AlertItem
//                 key={a.id}
//                 name={a.patient.name}
//                 condition={a.condition}
//                 severity={a.severity}
//                 time={a.time}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="px-6 py-8 text-center">
//             <div className="text-gray-500 dark:text-gray-400">
//               <div className="text-4xl mb-2">🔔</div>
//               <p className="text-lg font-medium">No alerts to show</p>
//               <p className="text-sm">Try widening your filters or wait for new alerts</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Alerts;
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Loader } from "lucide-react";
import AlertItem from "../components/AlertItem";
import { useSocket } from "../context/SocketContext";

const STORAGE_KEY = "infuzamed_alerts_v1";
const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const Alerts = () => {
  const { alerts } = useSocket();
  const [storedAlerts, setStoredAlerts] = useState([]); // persisted list (raw alertData objects)

  // track newest timestamp we've persisted so older fetches don't overwrite newer socket alerts
  const latestTimestampRef = useRef(0);

  // NEW: initial activity indicator when page opens
  const [initialLoading, setInitialLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all"); // all | high | low
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState(""); // yyyy-mm-dd

  // Search API result (patient ids & names) to filter alerts by
  const [searchPatientIds, setSearchPatientIds] = useState(new Set());
  const [searchPatientNames, setSearchPatientNames] = useState(new Set()); // lowercased names returned by server
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false); // <-- immediate UI indicator

  // From disabled state when To == today
  const [fromDisabled, setFromDisabled] = useState(false);

  // Helper: stable id/key for dedupe
  const stableKeyFor = (item) => {
    const id = item?.alert?.id ?? item?.id;
    if (id !== undefined && id !== null) return String(id);
    try {
      return JSON.stringify(item);
    } catch {
      return String(Math.random());
    }
  };

  // Sorting helper - newest first (time only)
  const sortAlertsByTime = (alertsList) => {
    const timeOf = (it) => {
      try {
        const a = it?.alert || it || {};
        return new Date(
          a.timestamp ?? a.alert_created_at ?? a.created_at ?? a.createdAt ?? 0
        ).getTime();
      } catch {
        return 0;
      }
    };
    return [...alertsList].sort((a, b) => timeOf(b) - timeOf(a));
  };

  // Format alert for display
  const formatAlertForDisplay = (alertData) => {
    const alert = alertData.alert || alertData;
    const timestamp =
      alert.timestamp || alert.created_at || new Date().toISOString();
    const timeAgo = getTimeAgo(timestamp);
    const patientName =
      alertData.patient?.name ||
      alert?.patient?.name ||
      alertData.patient_name ||
      alert?.patient_name ||
      `Patient ${alertData.patient_id || "Unknown"}`;

    return {
      id: alert.id || alertData.patient_id || stableKeyFor(alertData),
      patient: {
        name: patientName,
      },
      condition: `${alert.desc || alert.message || "Patient Alert"}${
        patientName ? ` - ${patientName}` : ""
      }`,
      severity: alert.type
        ? capitalize(alert.type)
        : alert.severity || "Unknown",
      time: timeAgo,
      timestamp: timestamp,
      originalData: alertData,
    };
  };

  const capitalize = (s) =>
    typeof s === "string" && s.length
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
    if (isNaN(diffInMinutes)) return "Unknown time";
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  // --- FETCH WITH RETRIES (guarded so older fetch responses don't overwrite newer socket alerts) ---
  useEffect(() => {
    let cancelled = false;
    let retryTimerIds = [];

    const mapRows = (rows) =>
      rows.map((row) => ({
        alert: {
          id: row.id,
          type: row.type,
          timestamp: row.alert_created_at || row.created_at || row.timestamp,
          created_at: row.alert_created_at || row.created_at,
          desc: row.desc,
          message: row.desc,
          read_status: row.read_status,
          assignment_id: row.assignment_id,
        },
        patient_id: row.patient_id,
        patient: {
          patient_id: row.patient_id,
          name: row.patient_name || (row.patient && row.patient.name) || "",
          email: row.patient_email,
          phoneNumber: row.patient_phone,
        },
        created_at: row.alert_created_at || row.created_at,
        updated_at: row.alert_updated_at || row.updated_at,
        _raw: row,
      }));

    const fetchOnce = async (path, signal) => {
      try {
        const url = `${API_BASE.replace(/\/$/, "")}${
          path.startsWith("/") ? path : "/" + path
        }`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal,
        });
        if (!res.ok) {
          return { ok: false, status: res.status, statusText: res.statusText };
        }
        const json = await res.json().catch(() => null);
        return {
          ok: true,
          status: res.status,
          statusText: res.statusText,
          json,
        };
      } catch (err) {
        if (err.name === "AbortError") return { ok: false, aborted: true };
        return { ok: false, error: err };
      }
    };

    const candidates = [
      "/api/alerts/my-alerts",
      "/api/alerts",
      "/api/alerts?limit=200",
      "/api/doctor/my-alerts",
      "/api/doctor/alerts?limit=200",
    ];

    const timeOfItem = (item) => {
      try {
        const a = item?.alert || item || {};
        return new Date(
          a.timestamp ?? a.alert_created_at ?? a.created_at ?? a.createdAt ?? 0
        ).getTime();
      } catch {
        return 0;
      }
    };

    const fetchWithRetries = async () => {
      try {
        for (const path of candidates) {
          if (cancelled) break;
          const attempts = [0, 400, 1200];
          for (let i = 0; i < attempts.length && !cancelled; i++) {
            if (i > 0) {
              await new Promise((r) => {
                const id = setTimeout(r, attempts[i]);
                retryTimerIds.push(id);
              });
              if (cancelled) break;
            }

            const controller = new AbortController();
            retryTimerIds.push(() => controller.abort && controller.abort());
            const result = await fetchOnce(path, controller.signal);
            if (cancelled) break;

            if (result && result.ok && result.json) {
              const payload = result.json;
              let rows = null;

              if (Array.isArray(payload.alerts)) rows = payload.alerts;
              else if (Array.isArray(payload.data)) rows = payload.data;
              else if (Array.isArray(payload)) rows = payload;
              else if (payload?.alerts && Array.isArray(payload.alerts))
                rows = payload.alerts;
              else if (payload?.data && Array.isArray(payload.data))
                rows = payload.data;

              if (Array.isArray(rows)) {
                const mapped = mapRows(rows);
                // sort by time only (newest first)
                const sorted = sortAlertsByTime(mapped);

                if (!cancelled) {
                  // protect against stale fetch overwriting newer socket alerts
                  const payloadNewest =
                    (sorted.length && timeOfItem(sorted[0])) || 0;
                  if (
                    payloadNewest >= latestTimestampRef.current ||
                    latestTimestampRef.current === 0
                  ) {
                    setStoredAlerts(sorted);
                    if (payloadNewest > latestTimestampRef.current)
                      latestTimestampRef.current = payloadNewest;
                  } else {
                    // skip older fetch result
                  }
                }

                return;
              } else {
                console.warn(
                  `[Alerts] endpoint ${path} returned unexpected payload shape`,
                  payload
                );
              }
            } else {
              console.warn(
                `[Alerts] fetch attempt for ${path} failed:`,
                result && (result.status || result.error || result.statusText)
              );
            }
          }
        }

        console.warn(
          "[Alerts] no valid endpoint returned alerts. kept existing storedAlerts (did not clear)."
        );
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    setInitialLoading(true);
    fetchWithRetries();

    const onFocus = () => {
      const id = setTimeout(() => {
        if (!cancelled) {
          setInitialLoading(true);
          fetchWithRetries();
        }
      }, 200);
      retryTimerIds.push(id);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      retryTimerIds.forEach((t) => {
        try {
          if (typeof t === "number") clearTimeout(t);
          else if (typeof t === "function") t();
        } catch {}
      });
      try {
        setInitialLoading(false);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge incoming socket alerts into storedAlerts (dedupe by stable key), newest-first by time
  useEffect(() => {
    try {
      if (!Array.isArray(alerts) || alerts.length === 0) {
        // keep existing storedAlerts
        return;
      }

      // dedupe incoming by stable key (preserve incoming order initially)
      const seenIncoming = new Set();
      const dedupedIncoming = [];
      for (const incoming of alerts) {
        const key = stableKeyFor(incoming);
        if (seenIncoming.has(key)) continue;
        seenIncoming.add(key);
        dedupedIncoming.push(incoming);
      }

      const timeOf = (item) => {
        try {
          const a = item?.alert || item || {};
          return new Date(
            a.timestamp ??
              a.alert_created_at ??
              a.created_at ??
              a.createdAt ??
              0
          ).getTime();
        } catch {
          return 0;
        }
      };

      // order incoming newest-first
      dedupedIncoming.sort((a, b) => timeOf(b) - timeOf(a));

      setStoredAlerts((prev = []) => {
        // Build map so incoming items override existing ones (by key)
        const map = new Map();

        // Add incoming first (authoritative/new)
        for (const inc of dedupedIncoming) {
          map.set(stableKeyFor(inc), inc);
        }

        // Add previous items only if they are not superseded by incoming
        for (const ex of prev) {
          const k = stableKeyFor(ex);
          if (!map.has(k)) map.set(k, ex);
        }

        // merged array sorted newest-first by time
        const merged = Array.from(map.values());
        merged.sort((a, b) => timeOf(b) - timeOf(a));

        // update latestTimestampRef
        if (merged.length) {
          const newest = timeOf(merged[0]);
          if (newest && newest > latestTimestampRef.current) {
            latestTimestampRef.current = newest;
          }
        }

        return merged;
      });
    } catch (err) {
      console.error("Error merging alerts:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  // date helpers: convert yyyy-mm-dd to start/end timestamp
  const toStartOfDay = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    const d = new Date(yyyyMmDd + "T00:00:00");
    return d.getTime();
  };
  const toEndOfDay = (yyyyMmDd) => {
    if (!yyyyMmDd) return null;
    const d = new Date(yyyyMmDd + "T23:59:59.999");
    return d.getTime();
  };

  // today string for max constraint (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Enforce From / To constraints and disabling logic
  useEffect(() => {
    if (toDate && new Date(toDate) > new Date(todayStr)) {
      setToDate(todayStr);
      return;
    }

    if (toDate === todayStr) {
      if (fromDate !== todayStr) setFromDate(todayStr);
      setFromDisabled(true);
      return;
    }

    setFromDisabled(false);

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setFromDate(toDate);
      return;
    }

    if (fromDate && new Date(fromDate) > new Date(todayStr)) {
      setFromDate(todayStr);
      return;
    }
  }, [toDate]); // eslint-disable-line

  useEffect(() => {
    if (fromDate && new Date(fromDate) > new Date(todayStr)) {
      setFromDate(todayStr);
      return;
    }

    if (fromDate === todayStr) {
      if (toDate !== todayStr) setToDate(todayStr);
      setFromDisabled(true);
      return;
    }

    setFromDisabled(false);
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setToDate(fromDate);
    }
  }, [fromDate]); // eslint-disable-line

  // Search API integration (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = (searchQuery || "").trim();
      if (!q) {
        setSearchPatientIds(new Set());
        setSearchPatientNames(new Set());
        setSearchLoading(false);
        return;
      }

      (async () => {
        try {
          setSearchLoading(true);
          const params = new URLSearchParams({ search: q });
          const res = await fetch(
            `${API_BASE}/api/doctor/search-patients?${params.toString()}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );
          if (!res.ok) {
            setSearchPatientIds(new Set());
            setSearchPatientNames(new Set());
            setSearchLoading(false);
            return;
          }
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data)) {
            const ids = new Set();
            const names = new Set();
            for (const p of json.data) {
              const id = p.patient_id ?? p.id ?? p.userId ?? p.user_id;
              if (id !== undefined && id !== null) ids.add(String(id));
              const nm = (p.name ?? p.patient_name ?? p.username ?? "")
                .toString()
                .trim()
                .toLowerCase();
              if (nm) names.add(nm);
            }
            setSearchPatientIds(ids);
            setSearchPatientNames(names);
          } else {
            setSearchPatientIds(new Set());
            setSearchPatientNames(new Set());
          }
        } catch (err) {
          console.warn("Alerts search API failed:", err);
          setSearchPatientIds(new Set());
          setSearchPatientNames(new Set());
        } finally {
          setSearchLoading(false);
        }
      })();
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // immediate search button
  const searchPatientsImmediate = async () => {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchPatientIds(new Set());
      setSearchPatientNames(new Set());
      return;
    }

    setSearchInitiated(true);
    setSearchLoading(true);

    try {
      const params = new URLSearchParams({ search: q });
      const res = await fetch(
        `${API_BASE}/api/doctor/search-patients?${params.toString()}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) {
        setSearchPatientIds(new Set());
        setSearchPatientNames(new Set());
        return;
      }
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        const ids = new Set();
        const names = new Set();
        for (const p of json.data) {
          const id = p.patient_id ?? p.id ?? p.userId ?? p.user_id;
          if (id !== undefined && id !== null) ids.add(String(id));
          const nm = (p.name ?? p.patient_name ?? p.username ?? "")
            .toString()
            .trim()
            .toLowerCase();
          if (nm) names.add(nm);
        }
        setSearchPatientIds(ids);
        setSearchPatientNames(names);
      } else {
        setSearchPatientIds(new Set());
        setSearchPatientNames(new Set());
      }
    } catch (err) {
      console.warn("Alerts immediate search failed:", err);
      setSearchPatientIds(new Set());
      setSearchPatientNames(new Set());
    } finally {
      setSearchLoading(false);
      setSearchInitiated(false);
    }
  };

  // Derived: apply search + priority + date filters and format for display
  const displayedAlerts = useMemo(() => {
    if (!storedAlerts || storedAlerts.length === 0) return [];

    const q = String(searchQuery || "")
      .trim()
      .toLowerCase();
    const pf = (priorityFilter || "all").toLowerCase();
    const fromTs = toStartOfDay(fromDate);
    const toTs = toEndOfDay(toDate);

    const isSearching = q.length > 0;

    if (isSearching && (searchLoading || searchInitiated)) return [];

    const filtered = storedAlerts.filter((alertData) => {
      const alert = alertData.alert || alertData;
      const patientName = (
        alertData.patient?.name ||
        alert?.patient?.name ||
        alertData.patient_name ||
        alert?.patient_name ||
        ""
      )
        .toString()
        .toLowerCase();

      let matchesSearch = true;
      if (isSearching) {
        if (
          (searchPatientIds && searchPatientIds.size > 0) ||
          (searchPatientNames && searchPatientNames.size > 0)
        ) {
          const pid =
            alertData.patient?.patient_id ??
            alertData.patient?.id ??
            alert.patient_id ??
            alert.id ??
            alert.patient?.userId ??
            alert.user_id;
          const pidMatch = pid ? searchPatientIds.has(String(pid)) : false;
          const nameMatch = patientName && searchPatientNames.has(patientName);
          matchesSearch = pidMatch || nameMatch;
        } else {
          matchesSearch = false;
        }
      }

      // priority filter still works as filter, but ordering is time-only
      const type =
        (alert.type || "").toLowerCase() ||
        (alert.severity || "").toLowerCase() ||
        "low";
      const matchesPriority = pf === "all" || type === pf;

      const ts = new Date(
        alert.timestamp || alert.created_at || alert.createdAt || Date.now()
      ).getTime();
      const matchesFrom = fromTs === null || ts >= fromTs;
      const matchesTo = toTs === null || ts <= toTs;

      return matchesSearch && matchesPriority && matchesFrom && matchesTo;
    });

    // storedAlerts is maintained as newest-first by our logic; preserve that order.
    return filtered.map(formatAlertForDisplay);
  }, [
    storedAlerts,
    searchQuery,
    priorityFilter,
    fromDate,
    toDate,
    searchPatientIds,
    searchPatientNames,
    searchLoading,
    searchInitiated,
  ]);

  return (
    <div className="space-y-6">
      {/* Small CSS to make the date-picker icon visible/white in dark mode (WebKit) */}
      <style>{`
        /* make sure the calendar icon is visible and bright in dark mode for WebKit browsers */
        .date-input::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.95;
        }
        .dark .date-input::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(2) contrast(1);
        }
        /* Edge/IE */
        .date-input::-ms-expand {
          filter: invert(1) brightness(2) contrast(1);
        }

        /* Ensure icon stays visible when input is readonly (prevents it vanishing) */
        .date-input[readonly]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.95;
          pointer-events: auto;
        }
        .dark .date-input[readonly]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(2) contrast(1);
          pointer-events: auto;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-primary dark:text-white">
          Alerts
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search (stretches on small screens) */}
          <div className="w-full sm:w-[260px]">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name..."
                className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Search button (top) */}
          <div className="w-full sm:w-auto">
            <button
              onClick={searchPatientsImmediate}
              disabled={searchLoading || searchInitiated}
              className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {searchLoading || searchInitiated ? (
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Priority filter - MEDIUM REMOVED */}
          <div className="w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm focus:outline-none text-gray-900 dark:text-white"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* From / To date pickers */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-300">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
              max={toDate ? toDate : todayStr}
              readOnly={fromDisabled}
            />
            <label className="text-xs text-gray-600 dark:text-gray-300">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
              min={fromDate ? fromDate : undefined}
              max={todayStr}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items_center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
                Active Alerts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use filters to refine visible alerts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
              {/* Search (duplicate header control for card) */}
              <div className="w-full sm:w-[220px]">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name..."
                  className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Search button (card) */}
              <div className="w-full sm:w-auto">
                <button
                  onClick={searchPatientsImmediate}
                  disabled={searchLoading || searchInitiated}
                  className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {searchLoading || searchInitiated ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Priority select */}
              <div className="w-full sm:w-auto">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All priorities</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* From / To */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
                  max={toDate ? toDate : todayStr}
                  readOnly={fromDisabled}
                />
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-input px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-innerDarkColor text-sm text-gray-900 dark:text-white"
                  min={fromDate ? fromDate : undefined}
                  max={todayStr}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        {initialLoading || searchLoading || searchInitiated ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center space-y-3">
              <Loader className="w-8 h-8 animate-spin text-gray-500 dark:text-gray-300" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Loading alerts...
              </div>
            </div>
          </div>
        ) : displayedAlerts && displayedAlerts.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayedAlerts.map((a) => (
              <AlertItem
                key={a.id}
                name={a.patient.name}
                condition={a.condition}
                severity={a.severity}
                time={a.time}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-lg font-medium">No alerts to show</p>
              <p className="text-sm">
                Try widening your filters or wait for new alerts
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;

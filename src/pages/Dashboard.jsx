
// import { useState, useEffect } from "react";
// import {
//   Users,
//   AlertTriangle,
//   Heart,
//   Activity,
//   Search,
//   Mail,
//   Phone,
//   Calendar,
//   Loader,
//   AlertCircle,
//   RefreshCw,
//   ChevronRight,
//   Home,
//   Droplet,
//   Zap,
// } from "lucide-react";
// import StatCard from "../components/StatCard";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import PatientModal from "./PatientModal"; // new file import

// const Dashboard = () => {
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'patient'
//   const [patientDetailLoading, setPatientDetailLoading] = useState(false);
//   const [patientDetailError, setPatientDetailError] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(null);

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalRecords: 0,
//     hasNext: false,
//     hasPrev: false,
//     limit: 5,
//   });

//   const API_BASE_URL =
//     import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

//   const navigate = useNavigate();
//   const location = useLocation();
//   const params = useParams(); // still available if you use route params elsewhere

//   // -------------------- fetch helpers (unchanged) --------------------
//   const fetchPatients = async (page = 1) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const queryParams = new URLSearchParams({
//         page: page.toString(),
//         limit: pagination.limit.toString(),
//       });

//       const response = await fetch(
//         `${API_BASE_URL}/api/doctor/assigned?${queryParams}`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );

//       if (!response.ok)
//         throw new Error(`Failed to fetch patients: ${response.status}`);

//       const result = await response.json();
//       if (result.success) {
//         setPatients(result.data || []);
//         setPagination((prev) => ({
//           ...prev,
//           currentPage: page,
//           totalRecords: result.totalRecords || result.data?.length || 0,
//           totalPages: result.totalPages || 1,
//           hasNext: result.hasNext || false,
//           hasPrev: result.hasPrev || false,
//         }));
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//       setPatients([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPatientRealTimeData = async (userId) => {
//     if (!userId) return;
//     try {
//       setPatientDetailLoading(true);
//       setPatientDetailError(null);

//       const response = await fetch(
//         `${API_BASE_URL}/api/doctor/getSpecificPatientData/${userId}`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Failed to fetch patient data: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.success) {
//         setRealTimeData(result.data);
//       } else {
//         throw new Error(result.message || "Failed to fetch patient data");
//       }
//     } catch (err) {
//       setPatientDetailError(err.message);
//       console.error("Error fetching patient real-time data:", err);
//     } finally {
//       setPatientDetailLoading(false);
//     }
//   };

//   const searchPatients = async () => {
//     if (!searchTerm.trim()) {
//       fetchPatients(1);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const queryParams = new URLSearchParams({ search: searchTerm.trim() });
//       const response = await fetch(
//         `${API_BASE_URL}/api/doctor/search-patients?${queryParams}`,
//         {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//         }
//       );

//       if (!response.ok) throw new Error(`Failed to search: ${response.status}`);

//       const result = await response.json();
//       if (result.success) {
//         setPatients(result.data || []);
//         setPagination((prev) => ({
//           ...prev,
//           totalRecords: result.data?.length || 0,
//           totalPages: 1,
//           hasNext: false,
//           hasPrev: false,
//         }));
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//       setPatients([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!searchTerm.trim()) fetchPatients(currentPage);
//   }, [currentPage]);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchTerm.trim()) {
//         searchPatients();
//       } else {
//         fetchPatients(1);
//       }
//     }, 600);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const handlePageChange = (newPage) => setCurrentPage(newPage);
//   const handleRefresh = () => fetchPatients(currentPage);
//   // -------------------------------------------------------------------

//   // --- openPatientModal unchanged except we ensure navigate includes full patient object in state ---
//   const openPatientModal = async (patient, { pushState = false } = {}) => {
//     console.log("Opening patient modal for:", patient);
//     setSelectedPatient(patient);
//     setCurrentView("patient");
//     setRealTimeData(null);

//     if (pushState) {
//       const rawSlug =
//         patient.name || patient.patient_id || patient.id || "patient";
//       const slug = encodeURIComponent(
//         String(rawSlug).trim().toLowerCase().replace(/\s+/g, "-")
//       );
//       const basePath = location.pathname.replace(/\/$/, "");
//       const newPath = `${basePath}/${slug}`;

//       try {
//         // Persist reverse lookup so Navbar can resolve id from slug later
//         const idForLookup = patient.patient_id ?? patient.id;
//         if (idForLookup) {
//           try {
//             sessionStorage.setItem(`patientId_bySlug_${slug}`, String(idForLookup));
//             if (patient.name) sessionStorage.setItem(`patientName_bySlug_${slug}`, String(patient.name));
//             // cache full profile for quick hydration in PatientModal
//             sessionStorage.setItem(`patientProfile_byId_${idForLookup}`, JSON.stringify(patient));
//           } catch {}
//         }

//         navigate(newPath, {
//           state: {
//             ...(location.state || {}),
//             showPatientModal: true,
//             patientName: patient.name || "Patient",
//             from: "/dashboard",
//             patientId: patient.patient_id ?? patient.id,
//             patient: patient, // preserve full patient object
//           },
//         });
//       } catch (e) {
//         console.warn("navigate state set failed", e);
//       }
//     }

//     const idForApi =
//       patient.patient_id ?? patient.userId ?? patient.user_id ?? patient.id;
//     if (idForApi) {
//       await fetchPatientRealTimeData(idForApi);
//     }
//   };
// // Call this when the user clicks "View Graph" or "View Data" from the Dashboard modal
// const openVitalsFromDashboard = (patient) => {
//   if (!patient) return;

//   const rawSlug =
//     patient.name || patient.username || patient.patient_id || patient.id || "patient";
//   const slug = encodeURIComponent(
//     String(rawSlug).trim().toLowerCase().replace(/\s+/g, "-")
//   );

//   const patientId =
//     patient.patient_id ?? patient.userId ?? patient.user_id ?? patient.id;

//   // persist name lookups so VitalSigns / Navbar can show friendly name
//   try {
//     if (patient.name) {
//       sessionStorage.setItem(`patientName_bySlug_${slug}`, patient.name);
//     }
//     if (patientId) {
//       sessionStorage.setItem(`patientName_byId_${patientId}`, patient.name || patient.username || slug);
//       // also persist reverse mapping so navbar can resolve id from slug later
//       sessionStorage.setItem(`patientId_bySlug_${slug}`, String(patientId));
//       // cache full profile
//       sessionStorage.setItem(`patientProfile_byId_${patientId}`, JSON.stringify(patient));
//     }
//   } catch (e) {
//     console.warn("sessionStorage set failed", e);
//   }

//   // navigate to the dashboard-shaped vitals URL
//   navigate(`/dashboard/${slug}/vital-signs/${patientId}`, {
//     state: {
//       origin: "dashboard",
//       patientSlug: slug,
//       patientId,
//       patientName: patient.name || patient.username || `Patient ${patientId}`,
//     },
//   });
// };

//   const handleViewPatient = async (patient) => {
//     console.log("Viewing patient in the Dashboard section", patient);
//     await openPatientModal(patient, { pushState: true });
//   };

//   // ---------------------- ROUTE / PATHNAME WATCHER ----------------------
//   // Helper to extract slug from pathname supporting both /dashboard/<slug> and /rpm/dashboard/<slug>
//  // Replace your current extractDashboardSlugFromPath with this
// const extractDashboardSlugFromPath = (pathname) => {
//   if (!pathname) return null;
//   // Trim trailing slashes
//   const p = pathname.replace(/\/+$/, "");
//   // Match either /dashboard/<slug> or /dashboard/<slug>/... (so it still extracts slug when followed by /vital-signs/...)
//   const m = p.match(/(?:\/rpm)?\/dashboard\/([^/]+)/);
//   return m ? decodeURIComponent(m[1]) : null;
// };


//   // Centralized handler for a given slug - tries location.state -> loaded patients -> fallback
//   const handleOpenFromSlug = async (decodedSlug) => {
//     if (!decodedSlug) return;

//     // 1) If location.state has patientId or patient, prefer it
//     if (location.state?.patientId || location.state?.patient) {
//       const id = location.state.patientId;
//       const patientFromState = location.state.patient;
//       const nameFromState = location.state.patientName || decodedSlug;

//       if (patientFromState) {
//         setSelectedPatient(patientFromState);
//       } else {
//         setSelectedPatient((prev) => {
//           const prevId =
//             prev?.patient_id ?? prev?.userId ?? prev?.user_id ?? prev?.id;
//           if (prevId && String(prevId) === String(id)) return prev;
//           return { name: nameFromState, patient_id: id };
//         });
//       }

//       setCurrentView("patient");
//       setRealTimeData(null);
//       if (id) await fetchPatientRealTimeData(id);
//       return;
//     }

//     // 2) Attempt to match from loaded patients
//     const match = patients.find((p) => {
//       if (!p) return false;
//       const slugify = (v) =>
//         String(v || "")
//           .trim()
//           .toLowerCase()
//           .replace(/\s+/g, "-");

//       if (p.username && slugify(p.username) === decodedSlug) return true;
//       if (p.name && slugify(p.name) === decodedSlug) return true;
//       if (
//         (p.patient_id && String(p.patient_id) === decodedSlug) ||
//         (p.id && String(p.id) === decodedSlug)
//       )
//         return true;
//       return false;
//     });

//     if (match) {
//       // open modal for matched patient (do not push state again)
//       await openPatientModal(match, { pushState: false });
//       return;
//     }

//     // 3) Fallback — show modal with name from slug (no API data)
//     setSelectedPatient({ name: decodedSlug, patient_id: null });
//     setCurrentView("patient");
//     setRealTimeData(null);
//   };

//   // Watch location.pathname — react whenever it contains a dashboard slug or returns to dashboard
//   useEffect(() => {
//     const slug = extractDashboardSlugFromPath(location.pathname);
//     if (!slug) {
//       // If URL doesn't contain a dashboard slug -> ensure we're on the dashboard view
//       if (currentView !== "dashboard") {
//         setCurrentView("dashboard");
//         setSelectedPatient(null);
//         setRealTimeData(null);
//       }
//       return;
//     }

//     // If we have a slug, open the modal/view for that slug
//     handleOpenFromSlug(slug).catch((e) => {
//       console.error("Error handling dashboard slug:", e);
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname, patients, location.state]); // runs when pathname changes, patient list changes, or navigation state changes
//   // ---------------------------------------------------------------------

//   // NOTE: Keep the params-based effect if you use params in Router configuration (safe fallback)
//   useEffect(() => {
//     const slugParam = params.patientSlug;
//     if (!slugParam) return; // handled by pathname watcher above
//     const decodedSlug = decodeURIComponent(slugParam);
//     handleOpenFromSlug(decodedSlug).catch((e) =>
//       console.error("params-based openFromSlug error:", e)
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [params.patientSlug]);

//   // Back to dashboard
//   const handleBackToDashboard = () => {
//     setCurrentView("dashboard");
//     setSelectedPatient(null);
//     setRealTimeData(null);

//     // navigate to /dashboard (uses react-router so no full reload)
//     navigate("/dashboard");
//   };

//   const handleRefreshPatientData = () => {
//     if (!selectedPatient) return;

//     const id =
//       selectedPatient.patient_id ??
//       selectedPatient.userId ??
//       selectedPatient.user_id ??
//       selectedPatient.id;

//     if (!id) {
//       console.warn("No patient id available for refresh", selectedPatient);
//       setPatientDetailError("No patient id available for refresh");
//       return;
//     }

//     fetchPatientRealTimeData(id);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Never logged in";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getBPStatus = (systolic, diastolic) => {
//     if (!systolic || !diastolic) return "no-data";
//     if (systolic >= 180 || diastolic >= 120) return "critical";
//     if (systolic >= 140 || diastolic >= 90) return "warning";
//     if (systolic >= 120 || diastolic >= 80) return "elevated";
//     return "normal";
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "critical":
//         return "text-red-600 dark:text-red-400";
//       case "warning":
//       case "elevated":
//         return "text-yellow-600 dark:text-yellow-400";
//       case "normal":
//         return "text-green-600 dark:text-green-400";
//       case "no-data":
//       default:
//         return "text-gray-500 dark:text-gray-400";
//     }
//   };

//   const getStatusBgColor = (status) => {
//     switch (status) {
//       case "critical":
//         return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
//       case "warning":
//       case "elevated":
//         return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
//       case "normal":
//         return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
//       case "no-data":
//       default:
//         return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
//     }
//   };

//   // Stats
//   const totalPatients = pagination.totalRecords || 0;
//   const activePatients = patients.filter((p) => p.status === "active").length;
//   const criticalPatients = patients.filter(
//     (p) =>
//       p.vitalSigns?.bloodPressure?.status === "critical" ||
//       p.vitalSigns?.heartRate?.status === "critical"
//   ).length;
//   const patientsWithRecentData = patients.filter(
//     (p) => p.vitalSigns?.lastUpdated
//   ).length;

//   if (loading && patients.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-4">
//           <Loader className="w-8 h-8 animate-spin text-blue-600" />
//           <p className="text-gray-600 dark:text-gray-400">
//             Loading patients data...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const renderDashboard = () => {
//     return (
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//           <h2 className="text-2xl font-bold text-primary dark:text-white">
//             Dashboard
//           </h2>
//           <div className="flex items-center space-x-4 mt-4 lg:mt-0">
//             <div className="text-sm text-gray-600 dark:text-gray-400">
//               Last updated: {new Date().toLocaleTimeString()}
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
//               >
//                 <RefreshCw
//                   className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
//                 />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//           <StatCard
//             title="Total Patients"
//             value={totalPatients.toString()}
//             change="Assigned to you"
//             changeType="positive"
//             icon={Users}
//             iconColor="text-[#103c63] dark:text-blue-400"
//           />
//           <StatCard
//             title="Active Patients"
//             value={activePatients.toString()}
//             change={`${
//               Math.round((activePatients / totalPatients) * 100) || 0
//             }% of total`}
//             changeType="positive"
//             icon={Activity}
//             iconColor="text-green-600 dark:text-green-400"
//           />
//           <StatCard
//             title="Critical Cases"
//             value={criticalPatients.toString()}
//             change="Requiring attention"
//             changeType={criticalPatients > 0 ? "negative" : "positive"}
//             icon={AlertTriangle}
//             iconColor="text-red-600 dark:text-red-400"
//           />
//           <StatCard
//             title="Health Readings"
//             value={patientsWithRecentData.toString()}
//             change="With recent data"
//             changeType="positive"
//             icon={Heart}
//             iconColor="text-orange-600 dark:text-orange-400"
//           />
//         </div>

//         {/* Table */}
//         <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//           {/* Search Bar */}
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div className="mb-4 sm:mb-0">
//                 <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
//                   Patients Overview
//                 </h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Manage and monitor patient information
//                 </p>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     placeholder="Search patients..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
//                bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 
//                focus:ring-blue-500 focus:border-transparent w-64 
//                placeholder-gray-500 dark:placeholder-gray-300 text-gray-900 dark:text-white"
//                   />
//                 </div>
//                 <button
//                   onClick={searchPatients}
//                   disabled={loading}
//                   className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
//                 >
//                   {loading ? (
//                     <div className="flex items-center space-x-2">
//                       <Loader className="w-4 h-4 animate-spin" />
//                       <span>Searching...</span>
//                     </div>
//                   ) : (
//                     "Search"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//               <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
//                 <AlertCircle className="w-4 h-4" />
//                 <span className="text-sm">{error}</span>
//                 <button
//                   onClick={() => setError(null)}
//                   className="ml-auto text-red-600 hover:text-red-800"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200 dark:border-gray-700">
//                   <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Patient
//                   </th>
//                   <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     RPM-Start Date
//                   </th>
//                   <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Last Login
//                   </th>
//                   <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {patients.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="py-8 text-center">
//                       <div className="flex flex-col items-center space-y-2">
//                         <Users className="w-8 h-8 text-gray-400" />
//                         <span className="text-gray-500">
//                           {searchTerm
//                             ? "No patients match your search"
//                             : "No patients assigned yet"}
//                         </span>
//                         {searchTerm && (
//                           <button
//                             onClick={() => setSearchTerm("")}
//                             className="text-blue-600 hover:text-blue-700 text-sm"
//                           >
//                             Clear search
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   patients.map((patient) => (
//                     <tr
//                       key={patient.id}
//                       className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
//                     >
//                       <td className="py-4 px-6">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10 bg-[#103c63] to-purple-600 rounded-full flex items-center justify-center">
//                             <span className="text-white font-medium text-sm">
//                               {patient.username?.charAt(0).toUpperCase() || "P"}
//                             </span>
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900 dark:text-white">
//                               {patient.name || patient.username}
//                             </div>
//                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                               @{patient.username}
//                             </div>
//                           </div>
//                         </div>
//                       </td>

//                       <td className="py-4 px-6">
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm text-gray-900 dark:text-white">
//                             <Mail className="w-4 h-4 mr-2 text-gray-400" />
//                             {patient.email}
//                           </div>
//                           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
//                             <Phone className="w-4 h-4 mr-2 text-gray-400" />
//                             {patient.phoneNumber || "No phone"}
//                           </div>
//                         </div>
//                       </td>

//                       <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
//                         {patient.created_at
//                           ? new Date(patient.created_at).toLocaleDateString(
//                               "en-US",
//                               {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                               }
//                             )
//                           : "N/A"}
//                       </td>

//                       <td className="py-4 px-6">
//                         <div className="flex items-center text-sm text-gray-900 dark:text-white">
//                           <Calendar className="w-4 h-4 mr-2 text-gray-400" />
//                           {formatDate(patient.last_login)}
//                         </div>
//                       </td>

//                       <td className="py-4 px-6">
//                         <button
//                           onClick={() => handleViewPatient(patient)}
//                           title="View Patient"
//                           className="p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition-colors duration-200"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             strokeWidth={1.5}
//                             stroke="#103c63"
//                             className="w-7 h-7"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
//                             />
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                             />
//                           </svg>
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {!searchTerm.trim() && pagination.totalPages > 1 && (
//             <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                 <div className="text-sm text-gray-500 dark:text-gray-400">
//                   Showing{" "}
//                   <span className="font-medium">
//                     {(currentPage - 1) * pagination.limit + 1}-
//                     {Math.min(
//                       currentPage * pagination.limit,
//                       pagination.totalRecords
//                     )}
//                   </span>{" "}
//                   of{" "}
//                   <span className="font-medium">{pagination.totalRecords}</span>{" "}
//                   patients
//                 </div>
//                 <div className="flex items-center space-x-2 mt-4 sm:mt-0">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!pagination.hasPrev || loading}
//                     className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
//                   >
//                     Previous
//                   </button>

//                   {Array.from(
//                     { length: Math.min(5, pagination.totalPages) },
//                     (_, i) => {
//                       const pageNum = i + 1;
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
//                             currentPage === pageNum
//                               ? "bg-blue-600 text-white"
//                               : "border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     }
//                   )}

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!pagination.hasNext || loading}
//                     className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       {currentView === "dashboard" ? (
//         renderDashboard()
//       ) : (
//         <PatientModal
//           selectedPatient={selectedPatient}
//           realTimeData={realTimeData}
//           patientDetailLoading={patientDetailLoading}
//           patientDetailError={patientDetailError}
//           handleBackToDashboard={handleBackToDashboard}
//           handleRefreshPatientData={handleRefreshPatientData}
//           formatDate={formatDate}
//           getStatusBgColor={getStatusBgColor}
//           getStatusColor={getStatusColor}
//           getBPStatus={getBPStatus}
//           navigate={navigate}
//           openVitalsFromDashboard={openVitalsFromDashboard} 
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import { useState, useEffect, useRef } from "react";
import {
  Users,
  AlertTriangle,
  Heart,
  Activity,
  Search,
  Mail,
  Phone,
  Calendar,
  Loader,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Home,
  Droplet,
  Zap,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PatientModal from "./PatientModal"; // new file import
import { useSocket } from "../context/SocketContext"; // <-- added to get socket alerts

const Dashboard = () => {
  const { alerts } = useSocket(); // socket-provided alerts array
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'patient'
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);
  const [patientDetailError, setPatientDetailError] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false,
    limit: 5,
  });

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // still available if you use route params elsewhere

  // new state: alerts counts
  const [alertsCount, setAlertsCount] = useState(0);
  const [todaysAlertsCount, setTodaysAlertsCount] = useState(0);

  // keep track of seen alert keys so incoming socket batches don't double count
  const seenAlertsRef = useRef(new Set());

  // helper to produce stable key for an alert object
  const stableKeyFor = (item) => {
    const id = item?.alert?.id ?? item?.id;
    if (id !== undefined && id !== null) return String(id);
    try {
      return JSON.stringify(item);
    } catch {
      return String(Math.random());
    }
  };

  // helper to extract timestamp (ms) from alert-like objects
  const timeOf = (item) => {
    try {
      const a = item?.alert || item || {};
      return new Date(
        a.timestamp ?? a.alert_created_at ?? a.created_at ?? a.createdAt ?? 0
      ).getTime();
    } catch {
      return 0;
    }
  };

  // -------------------- fetch helpers (unchanged) --------------------
  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/doctor/assigned?${queryParams}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch patients: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        setPatients(result.data || []);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalRecords: result.totalRecords || result.data?.length || 0,
          totalPages: result.totalPages || 1,
          hasNext: result.hasNext || false,
          hasPrev: result.hasPrev || false,
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientRealTimeData = async (userId) => {
    if (!userId) return;
    try {
      setPatientDetailLoading(true);
      setPatientDetailError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/doctor/getSpecificPatientData/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setRealTimeData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch patient data");
      }
    } catch (err) {
      setPatientDetailError(err.message);
      console.error("Error fetching patient real-time data:", err);
    } finally {
      setPatientDetailLoading(false);
    }
  };

  const searchPatients = async () => {
    if (!searchTerm.trim()) {
      fetchPatients(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({ search: searchTerm.trim() });
      const response = await fetch(
        `${API_BASE_URL}/api/doctor/search-patients?${queryParams}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error(`Failed to search: ${response.status}`);

      const result = await response.json();
      if (result.success) {
        setPatients(result.data || []);
        setPagination((prev) => ({
          ...prev,
          totalRecords: result.data?.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) fetchPatients(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchPatients();
      } else {
        fetchPatients(1);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleRefresh = () => fetchPatients(currentPage);
  // -------------------------------------------------------------------

  // fetch alerts counts (tries common alert endpoints and computes counts)
  useEffect(() => {
    let cancelled = false;

    const candidates = [
      "/api/alerts",
      "/api/alerts?limit=1000",
      "/api/alerts/my-alerts",
      "/api/doctor/alerts?limit=1000",
      "/api/doctor/my-alerts",
    ];

    const startOfToday = (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })();
    const endOfToday = (() => {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    })();

    const fetchCounts = async () => {
      for (const path of candidates) {
        if (cancelled) return;
        try {
          const url = `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : "/" + path}`;
          const res = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) continue;
          const payload = await res.json().catch(() => null);
          if (!payload) continue;

          // extract rows array from common shapes
          let rows = null;
          if (Array.isArray(payload.alerts)) rows = payload.alerts;
          else if (Array.isArray(payload.data)) rows = payload.data;
          else if (Array.isArray(payload)) rows = payload;
          else if (Array.isArray(payload.alert)) rows = payload.alert;
          else if (Array.isArray(payload.data?.alerts)) rows = payload.data.alerts;

          if (!Array.isArray(rows)) continue;

          // compute counts
          const total = rows.length;
          let todayCount = 0;
          for (const r of rows) {
            const t = timeOf(r);
            if (t >= startOfToday && t <= endOfToday) todayCount++;
          }

          // populate seen set with initial keys to prevent double counting later
          try {
            const s = seenAlertsRef.current;
            for (const r of rows) {
              s.add(stableKeyFor(r));
            }
          } catch (e) {
            // ignore
          }

          if (!cancelled) {
            setAlertsCount(total);
            setTodaysAlertsCount(todayCount);
          }
          return;
        } catch (err) {
          // try next candidate
          // eslint-disable-next-line no-console
          console.warn("alerts count fetch failed for", path, err);
        }
      }

      // fallback - if no endpoint returned array, set zero (don't overwrite if already set)
      if (!cancelled) {
        setAlertsCount((c) => c || 0);
        setTodaysAlertsCount((c) => c || 0);
      }
    };

    fetchCounts();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Merge incoming socket alerts into counts (increment only for new items)
  useEffect(() => {
    try {
      if (!Array.isArray(alerts) || alerts.length === 0) return;

      const startOfToday = (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })();
      const endOfToday = (() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d.getTime();
      })();

      let newTotal = 0;
      let newToday = 0;

      // dedupe incoming by stable key while preserving order
      const seenLocal = new Set();
      const dedupedIncoming = [];
      for (const incoming of alerts) {
        const k = stableKeyFor(incoming);
        if (seenLocal.has(k)) continue;
        seenLocal.add(k);
        dedupedIncoming.push(incoming);
      }

      for (const inc of dedupedIncoming) {
        const k = stableKeyFor(inc);
        if (seenAlertsRef.current.has(k)) {
          // already counted
          continue;
        }
        // new alert: count it and add key
        seenAlertsRef.current.add(k);
        newTotal++;
        const t = timeOf(inc);
        if (t >= startOfToday && t <= endOfToday) newToday++;
      }

      if (newTotal > 0) {
        setAlertsCount((prev) => prev + newTotal);
        setTodaysAlertsCount((prev) => prev + newToday);
      }
    } catch (err) {
      console.error("Error updating alerts from socket:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts]);

  // --- openPatientModal unchanged except we ensure navigate includes full patient object in state ---
  const openPatientModal = async (patient, { pushState = false } = {}) => {
    console.log("Opening patient modal for:", patient);
    setSelectedPatient(patient);
    setCurrentView("patient");
    setRealTimeData(null);

    if (pushState) {
      const rawSlug =
        patient.name || patient.patient_id || patient.id || "patient";
      const slug = encodeURIComponent(
        String(rawSlug).trim().toLowerCase().replace(/\s+/g, "-")
      );
      const basePath = location.pathname.replace(/\/$/, "");
      const newPath = `${basePath}/${slug}`;

      try {
        // Persist reverse lookup so Navbar can resolve id from slug later
        const idForLookup = patient.patient_id ?? patient.id;
        if (idForLookup) {
          try {
            sessionStorage.setItem(`patientId_bySlug_${slug}`, String(idForLookup));
            if (patient.name) sessionStorage.setItem(`patientName_bySlug_${slug}`, String(patient.name));
            // cache full profile for quick hydration in PatientModal
            sessionStorage.setItem(`patientProfile_byId_${idForLookup}`, JSON.stringify(patient));
          } catch {}
        }

        navigate(newPath, {
          state: {
            ...(location.state || {}),
            showPatientModal: true,
            patientName: patient.name || "Patient",
            from: "/dashboard",
            patientId: patient.patient_id ?? patient.id,
            patient: patient, // preserve full patient object
          },
        });
      } catch (e) {
        console.warn("navigate state set failed", e);
      }
    }

    const idForApi =
      patient.patient_id ?? patient.userId ?? patient.user_id ?? patient.id;
    if (idForApi) {
      await fetchPatientRealTimeData(idForApi);
    }
  };
// Call this when the user clicks "View Graph" or "View Data" from the Dashboard modal
const openVitalsFromDashboard = (patient) => {
  if (!patient) return;

  const rawSlug =
    patient.name || patient.username || patient.patient_id || patient.id || "patient";
  const slug = encodeURIComponent(
    String(rawSlug).trim().toLowerCase().replace(/\s+/g, "-")
  );

  const patientId =
    patient.patient_id ?? patient.userId ?? patient.user_id ?? patient.id;

  // persist name lookups so VitalSigns / Navbar can show friendly name
  try {
    if (patient.name) {
      sessionStorage.setItem(`patientName_bySlug_${slug}`, patient.name);
    }
    if (patientId) {
      sessionStorage.setItem(`patientName_byId_${patientId}`, patient.name || patient.username || slug);
      // also persist reverse mapping so navbar can resolve id from slug later
      sessionStorage.setItem(`patientId_bySlug_${slug}`, String(patientId));
      // cache full profile
      sessionStorage.setItem(`patientProfile_byId_${patientId}`, JSON.stringify(patient));
    }
  } catch (e) {
    console.warn("sessionStorage set failed", e);
  }

  // navigate to the dashboard-shaped vitals URL
  navigate(`/dashboard/${slug}/vital-signs/${patientId}`, {
    state: {
      origin: "dashboard",
      patientSlug: slug,
      patientId,
      patientName: patient.name || patient.username || `Patient ${patientId}`,
    },
  });
};

  const handleViewPatient = async (patient) => {
    console.log("Viewing patient in the Dashboard section", patient);
    await openPatientModal(patient, { pushState: true });
  };

  // ---------------------- ROUTE / PATHNAME WATCHER ----------------------
  // Helper to extract slug from pathname supporting both /dashboard/<slug> and /rpm/dashboard/<slug>
 // Replace your current extractDashboardSlugFromPath with this
const extractDashboardSlugFromPath = (pathname) => {
  if (!pathname) return null;
  // Trim trailing slashes
  const p = pathname.replace(/\/+$/, "");
  // Match either /dashboard/<slug> or /dashboard/<slug>/... (so it still extracts slug when followed by /vital-signs/...)
  const m = p.match(/(?:\/rpm)?\/dashboard\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};


  // Centralized handler for a given slug - tries location.state -> loaded patients -> fallback
  const handleOpenFromSlug = async (decodedSlug) => {
    if (!decodedSlug) return;

    // 1) If location.state has patientId or patient, prefer it
    if (location.state?.patientId || location.state?.patient) {
      const id = location.state.patientId;
      const patientFromState = location.state.patient;
      const nameFromState = location.state.patientName || decodedSlug;

      if (patientFromState) {
        setSelectedPatient(patientFromState);
      } else {
        setSelectedPatient((prev) => {
          const prevId =
            prev?.patient_id ?? prev?.userId ?? prev?.user_id ?? prev?.id;
          if (prevId && String(prevId) === String(id)) return prev;
          return { name: nameFromState, patient_id: id };
        });
      }

      setCurrentView("patient");
      setRealTimeData(null);
      if (id) await fetchPatientRealTimeData(id);
      return;
    }

    // 2) Attempt to match from loaded patients
    const match = patients.find((p) => {
      if (!p) return false;
      const slugify = (v) =>
        String(v || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");

      if (p.username && slugify(p.username) === decodedSlug) return true;
      if (p.name && slugify(p.name) === decodedSlug) return true;
      if (
        (p.patient_id && String(p.patient_id) === decodedSlug) ||
        (p.id && String(p.id) === decodedSlug)
      )
        return true;
      return false;
    });

    if (match) {
      // open modal for matched patient (do not push state again)
      await openPatientModal(match, { pushState: false });
      return;
    }

    // 3) Fallback — show modal with name from slug (no API data)
    setSelectedPatient({ name: decodedSlug, patient_id: null });
    setCurrentView("patient");
    setRealTimeData(null);
  };

  // Watch location.pathname — react whenever it contains a dashboard slug or returns to dashboard
  useEffect(() => {
    const slug = extractDashboardSlugFromPath(location.pathname);
    if (!slug) {
      // If URL doesn't contain a dashboard slug -> ensure we're on the dashboard view
      if (currentView !== "dashboard") {
        setCurrentView("dashboard");
        setSelectedPatient(null);
        setRealTimeData(null);
      }
      return;
    }

    // If we have a slug, open the modal/view for that slug
    handleOpenFromSlug(slug).catch((e) => {
      console.error("Error handling dashboard slug:", e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, patients, location.state]); // runs when pathname changes, patient list changes, or navigation state changes
  // ---------------------------------------------------------------------

  // NOTE: Keep the params-based effect if you use params in Router configuration (safe fallback)
  useEffect(() => {
    const slugParam = params.patientSlug;
    if (!slugParam) return; // handled by pathname watcher above
    const decodedSlug = decodeURIComponent(slugParam);
    handleOpenFromSlug(decodedSlug).catch((e) =>
      console.error("params-based openFromSlug error:", e)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.patientSlug]);

  // Back to dashboard
  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedPatient(null);
    setRealTimeData(null);

    // navigate to /dashboard (uses react-router so no full reload)
    navigate("/dashboard");
  };

  const handleRefreshPatientData = () => {
    if (!selectedPatient) return;

    const id =
      selectedPatient.patient_id ??
      selectedPatient.userId ??
      selectedPatient.user_id ??
      selectedPatient.id;

    if (!id) {
      console.warn("No patient id available for refresh", selectedPatient);
      setPatientDetailError("No patient id available for refresh");
      return;
    }

    fetchPatientRealTimeData(id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never logged in";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return "no-data";
    if (systolic >= 180 || diastolic >= 120) return "critical";
    if (systolic >= 140 || diastolic >= 90) return "warning";
    if (systolic >= 120 || diastolic >= 80) return "elevated";
    return "normal";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "text-red-600 dark:text-red-400";
      case "warning":
      case "elevated":
        return "text-yellow-600 dark:text-yellow-400";
      case "normal":
        return "text-green-600 dark:text-green-400";
      case "no-data":
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "critical":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
      case "elevated":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "normal":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "no-data":
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700";
    }
  };

  // Stats
  const totalPatients = pagination.totalRecords || 0;
  const activePatients = patients.filter((p) => p.status === "active").length;
  const criticalPatients = patients.filter(
    (p) =>
      p.vitalSigns?.bloodPressure?.status === "critical" ||
      p.vitalSigns?.heartRate?.status === "critical"
  ).length;
  const patientsWithRecentData = patients.filter(
    (p) => p.vitalSigns?.lastUpdated
  ).length;

  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading patients data...
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-2xl font-bold text-primary dark:text-white">
            Dashboard
          </h2>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={totalPatients.toString()}
            change="Assigned to you"
            changeType="positive"
            icon={Users}
            iconColor="text-[#103c63] dark:text-blue-400"
          />
          <StatCard
            title="Active Patients"
            value={activePatients.toString()}
            change={`${
              Math.round((activePatients / totalPatients) * 100) || 0
            }% of total`}
            changeType="positive"
            icon={Activity}
            iconColor="text-green-600 dark:text-green-400"
          />
          {/* REPLACED: Critical Cases -> Alerts (dynamic total alerts count) */}
          <StatCard
            title="Alerts"
            value={String(alertsCount)}
            change="Total alerts"
            changeType={alertsCount > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-red-600 dark:text-red-400"
          />
          {/* REPLACED: Health Readings -> Today's Alerts (dynamic today's alerts) */}
          <StatCard
            title="Today's Alerts"
            value={String(todaysAlertsCount)}
            change="Received today"
            changeType={todaysAlertsCount > 0 ? "negative" : "positive"}
            icon={Zap}
            iconColor="text-orange-600 dark:text-orange-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
                  Patients Overview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage and monitor patient information
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
               bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 
               focus:ring-blue-500 focus:border-transparent w-64 
               placeholder-gray-500 dark:placeholder-gray-300 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={searchPatients}
                  disabled={loading}
                  className="px-4 py-2 bg-primary dark:bg-[#FFFFFF] dark:text-black text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    RPM-Start Date
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-500">
                          {searchTerm
                            ? "No patients match your search"
                            : "No patients assigned yet"}
                        </span>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#103c63] to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {patient.username?.charAt(0).toUpperCase() || "P"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {patient.name || patient.username}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{patient.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {patient.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {patient.phoneNumber || "No phone"}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-900 dark:text-white">
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(patient.last_login)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          title="View Patient"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#103c63"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!searchTerm.trim() && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * pagination.limit + 1}-
                    {Math.min(
                      currentPage * pagination.limit,
                      pagination.totalRecords
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalRecords}</span>{" "}
                  patients
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentView === "dashboard" ? (
        renderDashboard()
      ) : (
        <PatientModal
          selectedPatient={selectedPatient}
          realTimeData={realTimeData}
          patientDetailLoading={patientDetailLoading}
          patientDetailError={patientDetailError}
          handleBackToDashboard={handleBackToDashboard}
          handleRefreshPatientData={handleRefreshPatientData}
          formatDate={formatDate}
          getStatusBgColor={getStatusBgColor}
          getStatusColor={getStatusColor}
          getBPStatus={getBPStatus}
          navigate={navigate}
          openVitalsFromDashboard={openVitalsFromDashboard} 
        />
      )}
    </div>
  );
};

export default Dashboard;

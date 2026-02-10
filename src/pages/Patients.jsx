// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// // const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
// const API_BASE =
//   import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// const Patients = ({ setCurrentPage }) => {
//   const navigate = useNavigate();
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   // ---------- Listen for softReloadPatients events and force the Patients page to reload/open UI ----------
// useEffect(() => {
//   const handler = async (e) => {
//     try {
//       const detail = e?.detail || {};
//       const pid = detail.patientId || (detail.state && detail.state.patientId);
//       const pname = detail.patientName || (detail.state && detail.state.patientName);

//       // 1) Re-run the patient list fetch to refresh UI (force page reload behavior)
//       await fetchPatients();

//       // 2) If we have a patient id (from breadcrumb or state), behave like "View Details" was clicked:
//       if (pid) {
//         // call server endpoint you already use in handleViewDetails to fetch vitals
//         try {
//           const response = await fetch(`${API_BASE}/api/doctor/patients/${pid}/vital-signs`, {
//             method: "GET",
//             credentials: "include",
//           });
//           const data = await response.json();

//           if (data && data.success) {
//             // persist same way handleViewDetails does
//             try {
//               localStorage.setItem("currentPatientData", JSON.stringify(data.data));
//             } catch (e) {
//               console.warn("Could not store currentPatientData", e);
//             }

//             try {
//               if (pid && pname) {
//                 sessionStorage.setItem(`infuzamed_patient_${pid}`, String(pname));
//               }
//             } catch (err) {
//               console.warn("Could not persist patient name", err);
//             }

//             // Set the same page/view as if user clicked "View Details"
//             setCurrentPage("vital-signs");

//             // (Optional) If you want the route to reflect the opened patient (uncomment):
//             // navigate(`/patients/vital-signs/${pid}`, { state: { origin: "patient", patientId: pid, patientName: pname } });
//           } else {
//             console.warn("softReload: failed to fetch patient vitals", data);
//           }
//         } catch (err) {
//           console.error("softReload: fetch patient vitals failed", err);
//         }
//       } else {
//         // If no pid: keep user on /patients list (we already refreshed the patient list).
//       }
//     } catch (err) {
//       console.error("softReloadPatients handler error:", err);
//     }
//   };

//   window.addEventListener("softReloadPatients", handler);
//   return () => window.removeEventListener("softReloadPatients", handler);
// }, []); // intentionally empty so this listener stays stable
// // ----------------------------------------------------------------------------------------------

//   const fetchPatients = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/messages/patients`, {
//         credentials: "include",
//       });
//       const data = await response.json();

//       if (data.success) {
//         setPatients(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch patients:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = (patient) => {
//     localStorage.setItem("selectedPatient", JSON.stringify(patient));
//     setCurrentPage("communication");
//   };

//   const handleViewDetails = async (patient) => {
//     try {
//       // fetch patient vitals (server endpoint you already used)
//       const response = await fetch(
//         `${API_BASE}/api/doctor/patients/${patient.id}/vital-signs`,
//         {
//           method: "GET",
//           credentials: "include",
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         // keep localStorage behavior if you rely on it
//         localStorage.setItem("currentPatientData", JSON.stringify(data.data));
//         setCurrentPage("vital-signs");

//         // persist patient name in sessionStorage so Navbar can read it when needed
//         try {
//           if (patient && patient.id && patient.name) {
//             sessionStorage.setItem(
//               `infuzamed_patient_${patient.id}`,
//               String(patient.name)
//             );
//           }
//         } catch (e) {
//           console.warn("Could not write patient name to sessionStorage", e);
//         }

//         // NAVIGATE: include origin: 'patient' so Navbar knows this came from patient modal
//         navigate(`patients/vital-signs/${patient.id}`, {
//           state: {
//             origin: "patient", // KEY: tells Navbar to use Patient > PatientName
//             activeTab: "overview",
//             patientData: data.data,
//             patientName: patient.name || data.data?.patient?.name || undefined,
//             breadcrumbName:
//               patient.name || data.data?.patient?.name || undefined,
//             patientId: patient.id,
//           },
//         });
//       } else {
//         console.error("Failed to fetch patient data:", data.message);
//         alert("Failed to load patient data");
//       }
//     } catch (error) {
//       console.error("Error fetching patient details:", error);
//       alert("Error loading patient data");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-lg text-gray-600 dark:text-gray-400">
//           Loading patients...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//         <h2 className="text-2xl font-bold text-primary dark:text-white">
//           Patients
//         </h2>
//         <button className="mt-4 lg:mt-0 px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors">
//           Add New Patient
//         </button>
//       </div>

//       <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//           <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
//             Active Patients
//           </h3>
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Currently monitored patients ({patients.length})
//           </p>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Patient
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Heart Rate
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Last Reading
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Initiate Chat
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {patients.map((patient) => (
//                 <tr
//                   key={patient.id}
//                   className="hover:bg-gray-50 dark:hover:bg-gray-700"
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
//                         {patient.name?.charAt(0) || "P"}
//                       </div>
//                       <div className="ml-3">
//                         <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
//                           {patient.name}
//                         </div>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                           {patient.email}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                         patient.status === "Normal"
//                           ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
//                           : patient.status === "Alert"
//                           ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
//                           : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
//                       }`}
//                     >
//                       {patient.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
//                     {patient.heartRate ?? "--"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     {patient.lastReading ?? "--"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     <button
//                       className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors"
//                       onClick={() => handleSendMessage(patient)}
//                     >
//                       Send Message
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     <button
//                       className="text-primary dark:text-darkModeText hover:text-accent dark:hover:text-darkModeText"
//                       onClick={() => handleViewDetails(patient)}
//                     >
//                       View Details
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// // export default Patients;
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// // const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
// const API_BASE =
//   import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// const Patients = ({ setCurrentPage }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
// const isHandlingRef = useRef(false);
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // guard to prevent double-click / duplicate navigation
//   const [isHandlingView, setIsHandlingView] = useState(false);

//   useEffect(() => {
//     fetchPatients();
//   }, []);

//   // ---------- Listen for softReloadPatients events and force the Patients page to reload/open UI ----------
//   useEffect(() => {
//     const handler = async (e) => {
//       try {
//         const detail = e?.detail || {};
//         const pid = detail.patientId || (detail.state && detail.state.patientId);
//         const pname = detail.patientName || (detail.state && detail.state.patientName);

//         // 1) Re-run the patient list fetch to refresh UI (force page reload behavior)
//         await fetchPatients();

//         // If the event requests opening a particular patient, only proceed if we're NOT already on that patient's vitals route.
//         if (pid) {
//           const currentPath = (window.location.pathname || "").replace(/\/+$/, "");
//           const targetPath = `/patients/vital-signs/${pid}`;

//           // prevent duplicate open if already on the same path
//           if (currentPath === targetPath) {
//             // update localStorage/sessionStorage just in case, but do not refetch/navigate
//             try {
//               // try to refresh stored patient data if provided
//               if (detail.state?.patientData) {
//                 localStorage.setItem("currentPatientData", JSON.stringify(detail.state.patientData));
//               }
//               if (pid && pname) {
//                 sessionStorage.setItem(`infuzamed_patient_${pid}`, String(pname));
//               }
//             } catch (err) {
//               console.warn("softReload: storage update failed", err);
//             }
//             return;
//           }

//           // otherwise behave like "View Details" (fetch vitals and set state) but do NOT duplicate navigation if already there.
//           try {
//             const response = await fetch(`${API_BASE}/api/doctor/patients/${pid}/vital-signs`, {
//               method: "GET",
//               credentials: "include",
//             });
//             const data = await response.json();

//             if (data && data.success) {
//               try {
//                 localStorage.setItem("currentPatientData", JSON.stringify(data.data));
//               } catch (e) {
//                 console.warn("Could not store currentPatientData", e);
//               }

//               try {
//                 if (pid && pname) {
//                   sessionStorage.setItem(`infuzamed_patient_${pid}`, String(pname));
//                 }
//               } catch (err) {
//                 console.warn("Could not persist patient name", err);
//               }

//               setCurrentPage("vital-signs");

//               // Optionally navigate so URL reflects it. We replace so history isn't stacked.
//               // We avoid navigation if some other piece already navigated.
//               navigate(`/patients/vital-signs/${pid}`, {
//                 replace: true,
//                 state: {
//                   origin: "patient",
//                   activeTab: "overview",
//                   patientData: data.data,
//                   patientName: pname,
//                   patientId: pid,
//                   __force: Date.now(),
//                 },
//               });
//             } else {
//               console.warn("softReload: failed to fetch patient vitals", data);
//             }
//           } catch (err) {
//             console.error("softReload: fetch patient vitals failed", err);
//           }
//         } else {
//           // no pid: keep user on /patients list (we already refreshed the patient list).
//         }
//       } catch (err) {
//         console.error("softReloadPatients handler error:", err);
//       }
//     };

//     window.addEventListener("softReloadPatients", handler);
//     return () => window.removeEventListener("softReloadPatients", handler);
//   }, [navigate, setCurrentPage]);
//   // ----------------------------------------------------------------------------------------------

//   const fetchPatients = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/api/messages/patients`, {
//         credentials: "include",
//       });
//       const data = await response.json();

//       if (data.success) {
//         setPatients(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch patients:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = (patient) => {
//     localStorage.setItem("selectedPatient", JSON.stringify(patient));
//     setCurrentPage("communication");
//   };

//   const handleViewDetails = async (patient) => {
//   // prevent double / rapid clicks
//   if (isHandlingRef.current) return;
//   isHandlingRef.current = true;

//   try {
//     const pid = patient.id;
//     if (!pid) {
//       alert("No patient id available");
//       return;
//     }

//     // absolute path (important!) so navigation is not relative and doesn't duplicate segments
//     const targetPath = `/patients/vital-signs/${pid}`;

//     // fetch the same vitals endpoint you already use
//     const response = await fetch(`${API_BASE}/api/doctor/patients/${pid}/vital-signs`, {
//       method: "GET",
//       credentials: "include",
//     });
//     const data = await response.json();

//     if (!data || !data.success) {
//       console.error("Failed to fetch patient data:", data?.message);
//       alert("Failed to load patient data");
//       return;
//     }

//     // persist like before
//     try {
//       localStorage.setItem("currentPatientData", JSON.stringify(data.data));
//     } catch (e) {
//       console.warn("Could not store currentPatientData", e);
//     }

//     try {
//       if (patient && patient.id && patient.name) {
//         sessionStorage.setItem(`infuzamed_patient_${patient.id}`, String(patient.name));
//       }
//     } catch (e) {
//       console.warn("Could not write patient name to sessionStorage", e);
//     }

//     // build the navigation state exactly like you were sending previously
//     const navState = {
//       origin: "patient",
//       activeTab: "overview",
//       patientData: data.data,
//       patientName: patient.name || data.data?.patient?.name || undefined,
//       breadcrumbName: patient.name || data.data?.patient?.name || undefined,
//       patientId: pid,
//       __force: Date.now(),
//     };

//     // If already on same path, replace to force location.state update; otherwise push
//     const alreadyThere = (location.pathname || "").replace(/\/+$/, "") === targetPath;
//     navigate(targetPath, { replace: alreadyThere, state: navState });

//     // small microtask delay to let Router update location before we flip UI state
//     setTimeout(() => {
//       setCurrentPage("vital-signs");
//     }, 6);
//   } catch (err) {
//     console.error("Error in handleViewDetails:", err);
//     alert("Error loading patient data");
//   } finally {
//     // short debounce so multiple clicks won't retrigger immediately
//     setTimeout(() => {
//       isHandlingRef.current = false;
//     }, 300);
//   }
// };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-lg text-gray-600 dark:text-gray-400">
//           Loading patients...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//         <h2 className="text-2xl font-bold text-primary dark:text-white">Patients</h2>
//         <button className="mt-4 lg:mt-0 px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors">
//           Add New Patient
//         </button>
//       </div>

//       <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
//         <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//           <h3 className="text-lg font-medium text-primary dark:text-darkModeText">Active Patients</h3>
//           <p className="text-sm text-gray-600 dark:text-gray-400">Currently monitored patients ({patients.length})</p>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Heart Rate</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Reading</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Initiate Chat</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {patients.map((patient) => (
//                 <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
//                         {patient.name?.charAt(0) || "P"}
//                       </div>
//                       <div className="ml-3">
//                         <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{patient.name}</div>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                         patient.status === "Normal"
//                           ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
//                           : patient.status === "Alert"
//                           ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
//                           : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
//                       }`}
//                     >
//                       {patient.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{patient.heartRate ?? "--"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{patient.lastReading ?? "--"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     <button
//                       className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors"
//                       onClick={() => handleSendMessage(patient)}
//                     >
//                       Send Message
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                     <button
//                       className="text-primary dark:text-darkModeText hover:text-accent dark:hover:text-darkModeText"
//                       onClick={() => handleViewDetails(patient)}
//                     >
//                       View Details
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Patients;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

const Patients = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHandlingRef = useRef(false);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  /**
   * NEW: React to router URL/state so when the URL becomes /patients/vital-signs/:id
   * (or location.state contains patientId/patientData) we force the SPA UI to show
   * the patient vitals view (no full browser reload).
   */
  /**
   * NEW: React to router URL/state.
   * This hook ONLY handles the "forceList" command from the sidebar
   * to prevent a race condition where old state causes a redirect.
   */
  useEffect(() => {
    const st = location.state || {};
    const params = new URLSearchParams(location.search || "");

    // If navigated from sidebar, clear storage and ensure list is shown.
    if (params.get("__force") || st.forcePatientsList) {
      try {
        localStorage.removeItem("currentPatientData");
        localStorage.removeItem("selectedPatient");
      } catch (e) {}

      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (!k) continue;
          if (
            k.startsWith("patientName_bySlug_") ||
            k.startsWith("patientId_bySlug_") ||
            k.startsWith("infuzamed_patient_") ||
            k === "infuzamed_last_opened_dashboard_slug"
          ) {
            sessionStorage.removeItem(k);
          }
        }
      } catch (e) {}

      // No need to call fetchPatients() here,
      // the event listener at line 217 will handle it.
      setCurrentPage("patients");
    }
  }, [location.pathname, location.state, setCurrentPage]); // Removed navigate from dependencies

  // ---------- Listen for softReloadPatients events and force the Patients page to reload/open UI ----------
  useEffect(() => {
    const handler = async (e) => {
      try {
        const detail = e?.detail || {};

        if (detail.forceList) {
          await fetchPatients();
          setCurrentPage("patients");
          return;
        }

        const pid =
          detail.patientId || (detail.state && detail.state.patientId);
        const pname =
          detail.patientName || (detail.state && detail.state.patientName);

        await fetchPatients();

        if (pid) {
          const currentPath = (window.location.pathname || "").replace(
            /\/+$/,
            ""
          );
          const targetPath = `/patients/vital-signs/${pid}`;

          if (currentPath === targetPath) {
            try {
              if (detail.state?.patientData) {
                localStorage.setItem(
                  "currentPatientData",
                  JSON.stringify(detail.state.patientData)
                );
              }
              if (pid && pname) {
                sessionStorage.setItem(
                  `infuzamed_patient_${pid}`,
                  String(pname)
                );
              }
            } catch (err) {
              console.warn("softReload: storage update failed", err);
            }
            return;
          }

          try {
            const response = await fetch(
              `${API_BASE}/api/doctor/patients/${pid}/vital-signs`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            const data = await response.json();

            if (data && data.success) {
              try {
                localStorage.setItem(
                  "currentPatientData",
                  JSON.stringify(data.data)
                );
              } catch (e) {
                console.warn("Could not store currentPatientData", e);
              }

              try {
                if (pid && pname) {
                  sessionStorage.setItem(
                    `infuzamed_patient_${pid}`,
                    String(pname)
                  );
                }
              } catch (err) {
                console.warn("Could not persist patient name", err);
              }

              setCurrentPage("patients");

              navigate(`/patients/vital-signs/${pid}`, {
                replace: true,
                state: {
                  origin: "patient",
                  activeTab: "overview",
                  patientData: data.data,
                  patientName: pname,
                  patientId: pid,
                  __force: Date.now(),
                },
              });
            } else {
              console.warn("softReload: failed to fetch patient vitals", data);
            }
          } catch (err) {
            console.error("softReload: fetch patient vitals failed", err);
          }
        } else {
          // no pid: keep user on /patients list (we already refreshed the patient list).
        }
      } catch (err) {
        console.error("softReloadPatients handler error:", err);
      }
    };

    window.addEventListener("softReloadPatients", handler);
    return () => window.removeEventListener("softReloadPatients", handler);
  }, [navigate, setCurrentPage]);
  // ----------------------------------------------------------------------------------------------

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/messages/patients`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setPatients(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (patient) => {
    localStorage.setItem("selectedPatient", JSON.stringify(patient));
    setCurrentPage("communication");
  };

  const handleViewDetails = async (patient) => {
    // prevent double / rapid clicks
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;

    try {
      const pid = patient.id;
      if (!pid) {
        alert("No patient id available");
        return;
      }

      const targetPath = `/patients/vital-signs/${pid}`;

      const response = await fetch(
        `${API_BASE}/api/doctor/patients/${pid}/vital-signs`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (!data || !data.success) {
        console.error("Failed to fetch patient data:", data?.message);
        alert("Failed to load patient data");
        return;
      }

      try {
        localStorage.setItem("currentPatientData", JSON.stringify(data.data));
      } catch (e) {
        console.warn("Could not store currentPatientData", e);
      }

      try {
        if (patient && patient.id && patient.name) {
          sessionStorage.setItem(
            `infuzamed_patient_${patient.id}`,
            String(patient.name)
          );
        }
      } catch (e) {
        console.warn("Could not write patient name to sessionStorage", e);
      }

      const navState = {
        origin: "patient",
        activeTab: "overview",
        patientData: data.data,
        patientName: patient.name || data.data?.patient?.name || undefined,
        breadcrumbName: patient.name || data.data?.patient?.name || undefined,
        patientId: pid,
        __force: Date.now(),
      };

      // *** Important change: setCurrentPage immediately so UI switches right away ***
      setCurrentPage("patients");

      const alreadyThere =
        (location.pathname || "").replace(/\/+$/, "") === targetPath;
      navigate(targetPath, { replace: alreadyThere, state: navState });

      // No timeout required now — UI was switched immediately above
    } catch (err) {
      console.error("Error in handleViewDetails:", err);
      alert("Error loading patient data");
    } finally {
      setTimeout(() => {
        isHandlingRef.current = false;
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading patients...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-2xl font-bold text-primary dark:text-white">
          Patients
        </h2>
        <button className="mt-4 lg:mt-0 px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors">
          Add New Patient
        </button>
      </div>

      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Active Patients
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Currently monitored patients ({patients.length})
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Heart Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Reading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Initiate Chat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white dark:text-gray-100 text-sm font-medium">
                        {patient.name?.charAt(0) || "P"}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === "Normal"
                          ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                          : patient.status === "Alert"
                          ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {patient.heartRate ?? "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {patient.lastReading ?? "--"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors"
                      onClick={() => handleSendMessage(patient)}
                    >
                      Send Message
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <button
                      className="text-primary dark:text-darkModeText hover:text-accent dark:hover:text-darkModeText"
                      onClick={() => handleViewDetails(patient)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Patients;

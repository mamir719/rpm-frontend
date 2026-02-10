// // src/App.jsx
// import "./index.css";
// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// // Layouts
// import UserLayout from "./layouts/UserLayout";
// import AdminLayout from "./layouts/AdminLayout";

// // Pages
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Patients from "./pages/Patients";
// import VitalSigns from "./pages/VitalSigns";
// import ECGMonitoring from "./pages/ECGMonitoring";
// import Alerts from "./pages/Alerts";
// import PatientCommunication from "./pages/PatientCommunication";
// import DeviceManagement from "./pages/DeviceManagement";
// import SettingsPage from "./pages/Settings";
// import AdminUsers from "./pages/AdminUsers";

// const App = () => {
//   const [currentPage, setCurrentPage] = useState("dashboard");
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <Router>
//       <Routes>
//         {/* Login */}
//         <Route path="/" element={<Login />} />

//         {/* User Dashboard Routes */}
//         <Route
//           path="/"
//           element={
//             <UserLayout
//               currentPage={currentPage}
//               setCurrentPage={setCurrentPage}
//               sidebarOpen={sidebarOpen}
//               setSidebarOpen={setSidebarOpen}
//             />
//           }
//         >
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="patients" element={<Patients />} />
//           <Route path="vital-signs" element={<VitalSigns />} />
//           <Route path="ecg-monitoring" element={<ECGMonitoring />} />
//           <Route path="alerts" element={<Alerts />} />
//           <Route path="communication" element={<PatientCommunication />} />
//           <Route path="device-management" element={<DeviceManagement />} />
//           <Route path="settings" element={<SettingsPage />} />
//         </Route>

//         {/* Admin Dashboard Routes */}
//         <Route path="/admin" element={<AdminLayout />}>
//           <Route path="users" element={<AdminUsers />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// };

// export default App;

// src/App.js
import "./index.css";
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import VitalSigns from "./pages/VitalSigns";
import ECGMonitoring from "./pages/ECGMonitoring";
import Alerts from "./pages/Alerts";
import PatientCommunication from "./pages/PatientCommunication";
import DeviceManagement from "./pages/DeviceManagement";
import SettingsPage from "./pages/Settings";
import AdminUsers from "./layouts/AdminLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout"; // Correct import
import PatientModal from "./pages/PatientModal";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const App = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Routes>
      {/* Login - Public Route */}
      <Route path="/" element={<Login />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      {/* User Dashboard Routes */}
      <Route
        path="/"
        element={
          <UserLayout
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/:patientSlug" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="vital-signs" element={<VitalSigns />} />
        <Route
          path="patients/vital-signs/:patientId"
          element={<VitalSigns />}
        />
        <Route
          path="patients/:patientSlug/vital-signs/:patientId"
          element={<VitalSigns />}
        />
        <Route path="ecg-monitoring" element={<ECGMonitoring />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="communication" element={<PatientCommunication />} />
        <Route path="device-management" element={<DeviceManagement />} />
        <Route path="settings" element={<SettingsPage />} />

        <Route
          path="dashboard/:patientSlug/vital-signs/:patientId"
          element={<VitalSigns />}
        />

        {/* <Route
          path="dashboard/:patientSlug/vital-signs/:patientId"
          element={<PatientModal />}
        /> */}
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<AdminUsers />}>
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="/superAdmin" element={<SuperAdminLayout />} />
    </Routes>
  );
};

export default App;

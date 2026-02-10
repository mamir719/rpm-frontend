// import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../context/AuthProvider";
// import axios from "axios";

// const API_BASE =
//   import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// const SettingsPage = () => {
//   const { auth, setAuth } = useContext(AuthContext);
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     phoneNumber: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // Doctor Alert Settings State
//   const [doctorAlertSettings, setDoctorAlertSettings] = useState({
//     systolicHigh: 120,
//     systolicLow: 90,
//     diastolicHigh: 80,
//     diastolicLow: 60,
//   });

//   const [originalDoctorSettings, setOriginalDoctorSettings] = useState({});
//   const [hasChanges, setHasChanges] = useState(false);

//   // Separate states for profile and alert sections
//   const [profileErrors, setProfileErrors] = useState({});
//   const [profileSuccess, setProfileSuccess] = useState("");
//   const [alertErrors, setAlertErrors] = useState({});
//   const [alertSuccess, setAlertSuccess] = useState("");

//   const [profileLoading, setProfileLoading] = useState(false);
//   const [alertLoading, setAlertLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordValidation, setPasswordValidation] = useState({
//     hasMinLength: false,
//     hasUpperCase: false,
//     hasLowerCase: false,
//     hasNumber: false,
//     hasSpecialChar: false,
//   });

//   // Check if user is a doctor
//   const isDoctor =
//     auth?.user?.role === "doctor" || auth?.user?.role === "clinician";

//   useEffect(() => {
//     console.log("useEffect triggered with auth:", auth);
//     if (auth?.user) {
//       const newFormData = {
//         name: auth.user.name || "",
//         username: auth.user.userName || auth.user.username || "",
//         email: auth.user.email || "",
//         phoneNumber: auth.user.phoneNumber || "",
//         password: "",
//         confirmPassword: "",
//       };
//       console.log("Setting formData with auth.user:", newFormData);
//       setFormData(newFormData);

//       // Load doctor alert settings if user is doctor
//       if (isDoctor) {
//         loadDoctorAlertSettings();
//       }
//     }
//   }, [auth]);

//   // Load doctor alert settings
//   const loadDoctorAlertSettings = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE}/api/alerts/alert-settings`,
//         {
//           withCredentials: true,
//         }
//       );

//       console.log("Doctor alert settings response:", response.data);

//       if (response.data.success) {
//         const settings = response.data.settings;
//         const loadedSettings = {
//           systolicHigh: settings.systolic_high || 120,
//           systolicLow: settings.systolic_low || 90,
//           diastolicHigh: settings.diastolic_high || 80,
//           diastolicLow: settings.diastolic_low || 60,
//         };

//         setDoctorAlertSettings(loadedSettings);
//         setOriginalDoctorSettings(loadedSettings);
//         setHasChanges(false);
//       } else {
//         // Use default settings if API fails
//         setDefaultDoctorSettings();
//       }
//     } catch (error) {
//       console.error("Error loading doctor alert settings:", error);
//       // Use default settings if API call fails
//       setDefaultDoctorSettings();
//     }
//   };

//   // Set default doctor settings (matching your calculateBPStatus logic)
//   const setDefaultDoctorSettings = () => {
//     const defaultSettings = {
//       systolicHigh: 120, // Matches your High threshold
//       systolicLow: 90, // Matches your Low threshold
//       diastolicHigh: 80, // Matches your High threshold
//       diastolicLow: 60, // Matches your Low threshold
//     };

//     setDoctorAlertSettings(defaultSettings);
//     setOriginalDoctorSettings(defaultSettings);
//     setHasChanges(false);
//   };

//   // Check if settings have changed
//   useEffect(() => {
//     if (isDoctor && originalDoctorSettings) {
//       const changed =
//         doctorAlertSettings.systolicHigh !==
//           originalDoctorSettings.systolicHigh ||
//         doctorAlertSettings.systolicLow !==
//           originalDoctorSettings.systolicLow ||
//         doctorAlertSettings.diastolicHigh !==
//           originalDoctorSettings.diastolicHigh ||
//         doctorAlertSettings.diastolicLow !==
//           originalDoctorSettings.diastolicLow;

//       setHasChanges(changed);
//     }
//   }, [doctorAlertSettings, originalDoctorSettings, isDoctor]);

//   // Real-time password validation
//   useEffect(() => {
//     if (formData.password) {
//       const newValidation = {
//         hasMinLength: formData.password.length >= 6,
//         hasUpperCase: /[A-Z]/.test(formData.password),
//         hasLowerCase: /[a-z]/.test(formData.password),
//         hasNumber: /[0-9]/.test(formData.password),
//         hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
//           formData.password
//         ),
//       };
//       setPasswordValidation(newValidation);
//     } else {
//       // Reset validation when password is empty
//       setPasswordValidation({
//         hasMinLength: false,
//         hasUpperCase: false,
//         hasLowerCase: false,
//         hasNumber: false,
//         hasSpecialChar: false,
//       });
//     }
//   }, [formData.password]);

//   const validateAlertSettings = () => {
//     const newErrors = {};

//     // Validate systolic ranges
//     if (doctorAlertSettings.systolicHigh <= doctorAlertSettings.systolicLow) {
//       newErrors.systolic = "Systolic high must be greater than systolic low";
//     }

//     if (
//       doctorAlertSettings.systolicHigh < 100 ||
//       doctorAlertSettings.systolicHigh > 200
//     ) {
//       newErrors.systolicHigh = "Systolic high should be between 100 and 200";
//     }

//     if (
//       doctorAlertSettings.systolicLow < 60 ||
//       doctorAlertSettings.systolicLow > 150
//     ) {
//       newErrors.systolicLow = "Systolic low should be between 60 and 150";
//     }

//     // Validate diastolic ranges
//     if (doctorAlertSettings.diastolicHigh <= doctorAlertSettings.diastolicLow) {
//       newErrors.diastolic = "Diastolic high must be greater than diastolic low";
//     }

//     if (
//       doctorAlertSettings.diastolicHigh < 60 ||
//       doctorAlertSettings.diastolicHigh > 130
//     ) {
//       newErrors.diastolicHigh = "Diastolic high should be between 60 and 130";
//     }

//     if (
//       doctorAlertSettings.diastolicLow < 40 ||
//       doctorAlertSettings.diastolicLow > 100
//     ) {
//       newErrors.diastolicLow = "Diastolic low should be between 40 and 100";
//     }

//     return newErrors;
//   };

//   const validatePassword = (password) => {
//     if (!password) return "";

//     const minLength = 6;
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumber = /[0-9]/.test(password);
//     const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
//       password
//     );

//     if (password.length < minLength) {
//       return `Password must be at least ${minLength} characters`;
//     }
//     if (!hasUpperCase) {
//       return "Password must contain at least one uppercase letter";
//     }
//     if (!hasLowerCase) {
//       return "Password must contain at least one lowercase letter";
//     }
//     if (!hasNumber) {
//       return "Password must contain at least one number";
//     }
//     if (!hasSpecialChar) {
//       return "Password must contain at least one special character";
//     }
//     return "";
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = "Name is required";
//     if (!formData.username.trim()) newErrors.username = "Username is required";

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }

//     // Password validation only when editing and password is provided
//     if (isEditing && formData.password) {
//       const passwordError = validatePassword(formData.password);
//       if (passwordError) {
//         newErrors.password = passwordError;
//       }

//       if (!formData.confirmPassword) {
//         newErrors.confirmPassword = "Please confirm your password";
//       } else if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = "Passwords do not match";
//       }
//     }

//     setProfileErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     // Clear specific errors when user starts typing
//     if (profileErrors[name]) {
//       setProfileErrors((prev) => ({ ...prev, [name]: "" }));
//     }

//     // Clear confirm password error when either password field changes
//     if (
//       (name === "password" || name === "confirmPassword") &&
//       profileErrors.confirmPassword
//     ) {
//       setProfileErrors((prev) => ({ ...prev, confirmPassword: "" }));
//     }

//     setProfileSuccess("");
//   };

//   const handleDoctorAlertChange = (e) => {
//     const { name, value } = e.target;

//     setDoctorAlertSettings((prev) => ({
//       ...prev,
//       [name]: parseInt(value) || 0,
//     }));

//     // Clear alert-related errors when user starts typing
//     if (alertErrors[name]) {
//       setAlertErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//     if (alertErrors.systolic) {
//       setAlertErrors((prev) => ({ ...prev, systolic: "" }));
//     }
//     if (alertErrors.diastolic) {
//       setAlertErrors((prev) => ({ ...prev, diastolic: "" }));
//     }

//     setAlertSuccess("");
//   };

//   // Save doctor alert settings
//   const saveDoctorAlertSettings = async () => {
//     try {
//       const doctorSettings = {
//         systolic_high: doctorAlertSettings.systolicHigh,
//         systolic_low: doctorAlertSettings.systolicLow,
//         diastolic_high: doctorAlertSettings.diastolicHigh,
//         diastolic_low: doctorAlertSettings.diastolicLow,
//       };

//       const response = await axios.patch(
//         `${API_BASE}/api/alerts/alert-settings`,
//         doctorSettings,
//         { withCredentials: true }
//       );

//       if (response.data.success) {
//         setOriginalDoctorSettings(doctorAlertSettings);
//         setHasChanges(false);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error saving doctor alert settings:", error);
//       throw error;
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!validateForm()) return;

//     setProfileLoading(true);
//     try {
//       const changes = {};
//       if (formData.name !== (auth.user?.name || ""))
//         changes.name = formData.name;
//       if (
//         formData.username !== (auth.user?.userName || auth.user?.username || "")
//       )
//         changes.username = formData.username;
//       if (formData.email !== (auth.user?.email || ""))
//         changes.email = formData.email;
//       if (formData.phoneNumber !== (auth.user?.phoneNumber || ""))
//         changes.phoneNumber = formData.phoneNumber;
//       if (formData.password && formData.password.trim())
//         changes.password = formData.password;

//       if (Object.keys(changes).length === 0) {
//         setProfileSuccess("No changes to save");
//         setProfileLoading(false);
//         return;
//       }

//       console.log("Sending changes to /api/settings:", changes);
//       const response = await axios.patch(`${API_BASE}/api/settings`, changes, {
//         withCredentials: true,
//       });

//       if (response.status === 200) {
//         console.log("Settings update response:", response.data);
//         const updatedUser = response.data.user;

//         const newFormData = {
//           name: updatedUser.name || "",
//           username: updatedUser.userName || updatedUser.username || "",
//           email: updatedUser.email || "",
//           phoneNumber: updatedUser.phoneNumber || "",
//           password: "",
//           confirmPassword: "",
//         };

//         setFormData(newFormData);

//         // Update auth state
//         const checkResponse = await fetch(`${API_BASE}/api/auth/check-me`, {
//           credentials: "include",
//         });

//         if (checkResponse.ok) {
//           const data = await checkResponse.json();
//           setAuth({
//             ...auth,
//             user: {
//               ...data.user,
//               userName: data.user.username || data.user.userName,
//             },
//             isAuthenticated: true,
//           });
//         }

//         setProfileSuccess("Profile updated successfully");
//         setProfileErrors({});
//         setIsEditing(false);
//         setShowPassword(false);
//         setShowConfirmPassword(false);
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       setProfileErrors({
//         api: error.response?.data?.error || "Failed to update profile",
//       });
//     } finally {
//       setProfileLoading(false);
//     }
//   };

//   const handleSaveDoctorAlerts = async () => {
//     const alertValidationErrors = validateAlertSettings();
//     if (Object.keys(alertValidationErrors).length > 0) {
//       setAlertErrors(alertValidationErrors);
//       return;
//     }

//     setAlertLoading(true);
//     try {
//       await saveDoctorAlertSettings();
//       setAlertSuccess("Alert settings updated successfully");
//       setAlertErrors({});
//     } catch (error) {
//       console.error("Save error:", error);
//       setAlertErrors({
//         api: error.response?.data?.error || "Failed to update alert settings",
//       });
//     } finally {
//       setAlertLoading(false);
//     }
//   };

//   const handleSetDefaultAlerts = () => {
//     setDefaultDoctorSettings();
//     setAlertSuccess("Default alert settings applied");
//     setAlertErrors({});
//   };

//   const handleCancel = () => {
//     if (auth?.user) {
//       setFormData({
//         name: auth.user.name || "",
//         username: auth.user.userName || auth.user.username || "",
//         email: auth.user.email || "",
//         phoneNumber: auth.user.phoneNumber || "",
//         password: "",
//         confirmPassword: "",
//       });
//     }

//     if (isDoctor) {
//       setDoctorAlertSettings(originalDoctorSettings);
//       setHasChanges(false);
//     }

//     setProfileErrors({});
//     setProfileSuccess("");
//     setAlertErrors({});
//     setAlertSuccess("");
//     setIsEditing(false);
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//     setPasswordValidation({
//       hasMinLength: false,
//       hasUpperCase: false,
//       hasLowerCase: false,
//       hasNumber: false,
//       hasSpecialChar: false,
//     });
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     setFormData({
//       ...formData,
//       password: "",
//       confirmPassword: "",
//     });
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const toggleConfirmPasswordVisibility = () => {
//     setShowConfirmPassword(!showConfirmPassword);
//   };

//   // Real-time validation for password fields
//   const getPasswordValidationMessage = () => {
//     if (!formData.password) return null;

//     const allValid = Object.values(passwordValidation).every(Boolean);

//     if (allValid) {
//       return (
//         <p className="mt-1 text-xs text-green-600 dark:text-green-400">
//           Password meets all requirements
//         </p>
//       );
//     }

//     return (
//       <div className="mt-2 text-xs">
//         <p className="text-gray-600 dark:text-gray-400 mb-1">
//           Password must contain:
//         </p>
//         <ul className="space-y-1">
//           <li
//             className={
//               passwordValidation.hasMinLength
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }
//           >
//             • At least 6 characters{" "}
//             {passwordValidation.hasMinLength ? "✓" : "✗"}
//           </li>
//           <li
//             className={
//               passwordValidation.hasUpperCase
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }
//           >
//             • One uppercase letter {passwordValidation.hasUpperCase ? "✓" : "✗"}
//           </li>
//           <li
//             className={
//               passwordValidation.hasLowerCase
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }
//           >
//             • One lowercase letter {passwordValidation.hasLowerCase ? "✓" : "✗"}
//           </li>
//           <li
//             className={
//               passwordValidation.hasNumber
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }
//           >
//             • One number {passwordValidation.hasNumber ? "✓" : "✗"}
//           </li>
//           <li
//             className={
//               passwordValidation.hasSpecialChar
//                 ? "text-green-600 dark:text-green-400"
//                 : "text-red-600 dark:text-red-400"
//             }
//           >
//             • One special character{" "}
//             {passwordValidation.hasSpecialChar ? "✓" : "✗"}
//           </li>
//         </ul>
//       </div>
//     );
//   };

//   const getConfirmPasswordMessage = () => {
//     if (!formData.confirmPassword) return null;

//     if (formData.password === formData.confirmPassword) {
//       return (
//         <p className="mt-1 text-xs text-green-600 dark:text-green-400">
//           Passwords match
//         </p>
//       );
//     } else {
//       return (
//         <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//           Passwords do not match
//         </p>
//       );
//     }
//   };

//   if (profileLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="text-lg">Loading profile settings...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-primary dark:text-white">
//         Settings
//       </h2>

//       {/* User Profile Section - ALWAYS SHOW THIS */}
//       <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//         <h3 className="text-lg font-medium text-primary dark:text-darkModeText mb-4">
//           User Profile
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//             >
//               Full Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
//                 !isEditing
//                   ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                   : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//               }`}
//               placeholder="Enter your name"
//             />
//             {profileErrors.name && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                 {profileErrors.name}
//               </p>
//             )}
//           </div>
//           <div>
//             <label
//               htmlFor="username"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//             >
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
//                 !isEditing
//                   ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                   : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//               }`}
//               placeholder="Enter your username"
//             />
//             {profileErrors.username && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                 {profileErrors.username}
//               </p>
//             )}
//           </div>
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
//                 !isEditing
//                   ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                   : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//               }`}
//               placeholder="Enter your email"
//             />
//             {profileErrors.email && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                 {profileErrors.email}
//               </p>
//             )}
//           </div>
//           <div>
//             <label
//               htmlFor="phoneNumber"
//               className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//             >
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               id="phoneNumber"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
//                 !isEditing
//                   ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
//                   : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//               }`}
//               placeholder="Enter your phone number"
//             />
//             {profileErrors.phoneNumber && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                 {profileErrors.phoneNumber}
//               </p>
//             )}
//           </div>

//           {isEditing && (
//             <>
//               <div className="md:col-span-2">
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Change Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                     placeholder="Enter new password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={togglePasswordVisibility}
//                   >
//                     {showPassword ? (
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                         />
//                       </svg>
//                     ) : (
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                         />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//                 {profileErrors.password && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {profileErrors.password}
//                   </p>
//                 )}
//                 {getPasswordValidationMessage()}
//               </div>

//               <div className="md:col-span-2">
//                 <label
//                   htmlFor="confirmPassword"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                     placeholder="Confirm new password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={toggleConfirmPasswordVisibility}
//                   >
//                     {showConfirmPassword ? (
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                         />
//                       </svg>
//                     ) : (
//                       <svg
//                         className="h-5 w-5 text-gray-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                         />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//                 {profileErrors.confirmPassword && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {profileErrors.confirmPassword}
//                   </p>
//                 )}
//                 {getConfirmPasswordMessage()}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Profile Section Messages */}
//         {profileErrors.api && (
//           <p className="mt-4 text-sm text-red-600 dark:text-red-400">
//             {profileErrors.api}
//           </p>
//         )}
//         {profileSuccess && (
//           <p className="mt-4 text-sm text-green-600 dark:text-green-400">
//             {profileSuccess}
//           </p>
//         )}

//         <div className="mt-6 flex space-x-4">
//           {!isEditing ? (
//             <button
//               onClick={handleEdit}
//               className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors"
//             >
//               Edit Profile
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleSaveProfile}
//                 disabled={profileLoading}
//                 className={`px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors ${
//                   profileLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {profileLoading ? "Saving..." : "Save Profile"}
//               </button>
//               <button
//                 onClick={handleCancel}
//                 className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
//               >
//                 Cancel
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Doctor Alert Settings Section - ONLY FOR DOCTORS */}
//       {isDoctor && (
//         <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//           <h3 className="text-lg font-medium text-primary dark:text-darkModeText mb-4">
//             Alert Settings
//           </h3>

//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             Set your preferred BP thresholds for receiving patient alerts
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Systolic BP Settings */}
//             <div className="space-y-4">
//               <h4 className="font-medium text-gray-700 dark:text-gray-300">
//                 Systolic BP (mmHg)
//               </h4>

//               <div>
//                 <label
//                   htmlFor="systolicHigh"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   High Alert Threshold
//                 </label>
//                 <input
//                   type="number"
//                   id="systolicHigh"
//                   name="systolicHigh"
//                   value={doctorAlertSettings.systolicHigh}
//                   onChange={handleDoctorAlertChange}
//                   min="100"
//                   max="200"
//                   className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                 />
//                 {alertErrors.systolicHigh && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {alertErrors.systolicHigh}
//                   </p>
//                 )}
//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Alert me when patient's systolic BP is above this value
//                 </p>
//               </div>

//               <div>
//                 <label
//                   htmlFor="systolicLow"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Low Alert Threshold
//                 </label>
//                 <input
//                   type="number"
//                   id="systolicLow"
//                   name="systolicLow"
//                   value={doctorAlertSettings.systolicLow}
//                   onChange={handleDoctorAlertChange}
//                   min="60"
//                   max="150"
//                   className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                 />
//                 {alertErrors.systolicLow && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {alertErrors.systolicLow}
//                   </p>
//                 )}
//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Alert me when patient's systolic BP is below this value
//                 </p>
//               </div>

//               {alertErrors.systolic && (
//                 <p className="text-xs text-red-600 dark:text-red-400">
//                   {alertErrors.systolic}
//                 </p>
//               )}
//             </div>

//             {/* Diastolic BP Settings */}
//             <div className="space-y-4">
//               <h4 className="font-medium text-gray-700 dark:text-gray-300">
//                 Diastolic BP (mmHg)
//               </h4>

//               <div>
//                 <label
//                   htmlFor="diastolicHigh"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   High Alert Threshold
//                 </label>
//                 <input
//                   type="number"
//                   id="diastolicHigh"
//                   name="diastolicHigh"
//                   value={doctorAlertSettings.diastolicHigh}
//                   onChange={handleDoctorAlertChange}
//                   min="60"
//                   max="130"
//                   className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                 />
//                 {alertErrors.diastolicHigh && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {alertErrors.diastolicHigh}
//                   </p>
//                 )}
//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Alert me when patient's diastolic BP is above this value
//                 </p>
//               </div>

//               <div>
//                 <label
//                   htmlFor="diastolicLow"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
//                 >
//                   Low Alert Threshold
//                 </label>
//                 <input
//                   type="number"
//                   id="diastolicLow"
//                   name="diastolicLow"
//                   value={doctorAlertSettings.diastolicLow}
//                   onChange={handleDoctorAlertChange}
//                   min="40"
//                   max="100"
//                   className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                 />
//                 {alertErrors.diastolicLow && (
//                   <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//                     {alertErrors.diastolicLow}
//                   </p>
//                 )}
//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Alert me when patient's diastolic BP is below this value
//                 </p>
//               </div>

//               {alertErrors.diastolic && (
//                 <p className="text-xs text-red-600 dark:text-red-400">
//                   {alertErrors.diastolic}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Alert Section Messages */}
//           {alertErrors.api && (
//             <p className="mt-4 text-sm text-red-600 dark:text-red-400">
//               {alertErrors.api}
//             </p>
//           )}
//           {alertSuccess && (
//             <p className="mt-4 text-sm text-green-600 dark:text-green-400">
//               {alertSuccess}
//             </p>
//           )}

//           <div className="mt-6 flex space-x-4">
//             <button
//               onClick={handleSaveDoctorAlerts}
//               disabled={!hasChanges || alertLoading}
//               className={`px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors ${
//                 !hasChanges || alertLoading
//                   ? "opacity-50 cursor-not-allowed"
//                   : ""
//               }`}
//             >
//               {alertLoading ? (
//                 <span className="flex items-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Applying...
//                 </span>
//               ) : (
//                 "Save Alert Settings"
//               )}
//             </button>

//             <button
//               onClick={handleSetDefaultAlerts}
//               className="px-4 py-2 rounded-lg bg-primary dark:bg-darkModeButton text-white transition-colors"
//             >
//               Set as Default (Recommended)
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SettingsPage;

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

const SettingsPage = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Doctor Alert Settings State
  // NOTE: store values as strings while editing so user can clear / edit freely
  const [doctorAlertSettings, setDoctorAlertSettings] = useState({
    systolicHigh: "130",
    systolicLow: "99",
    diastolicHigh: "90",
    diastolicLow: "69",
  });

  const [originalDoctorSettings, setOriginalDoctorSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Separate states for profile and alert sections
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");
  const [alertErrors, setAlertErrors] = useState({});
  const [alertSuccess, setAlertSuccess] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Check if user is a doctor
  const isDoctor =
    auth?.user?.role === "doctor" || auth?.user?.role === "clinician";

  useEffect(() => {
    console.log("useEffect triggered with auth:", auth);
    if (auth?.user) {
      const newFormData = {
        name: auth.user.name || "",
        username: auth.user.userName || auth.user.username || "",
        email: auth.user.email || "",
        phoneNumber: auth.user.phoneNumber || "",
        password: "",
        confirmPassword: "",
      };
      console.log("Setting formData with auth.user:", newFormData);
      setFormData(newFormData);

      // Load doctor alert settings if user is doctor
      if (isDoctor) {
        loadDoctorAlertSettings();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  // Load doctor alert settings
  const loadDoctorAlertSettings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/alerts/alert-settings`,
        {
          withCredentials: true,
        }
      );

      console.log("Doctor alert settings response:", response.data);

      if (response.data.success) {
        const settings = response.data.settings;
        const loadedSettings = {
          // convert to strings so inputs remain editable
          systolicHigh:
            settings.systolic_high !== undefined &&
            settings.systolic_high !== null
              ? String(settings.systolic_high)
              : "130",
          systolicLow:
            settings.systolic_low !== undefined &&
            settings.systolic_low !== null
              ? String(settings.systolic_low)
              : "99",
          diastolicHigh:
            settings.diastolic_high !== undefined &&
            settings.diastolic_high !== null
              ? String(settings.diastolic_high)
              : "90",
          diastolicLow:
            settings.diastolic_low !== undefined &&
            settings.diastolic_low !== null
              ? String(settings.diastolic_low)
              : "69",
        };

        setDoctorAlertSettings(loadedSettings);
        setOriginalDoctorSettings(loadedSettings);
        setHasChanges(false);
      } else {
        // Use default settings if API fails
        setDefaultDoctorSettings();
      }
    } catch (error) {
      console.error("Error loading doctor alert settings:", error);
      // Use default settings if API call fails
      setDefaultDoctorSettings();
    }
  };

  // Set default doctor settings (matching your calculateBPStatus logic)
  const setDefaultDoctorSettings = () => {
    const defaultSettings = {
      systolicHigh: "130", // now minimum allowed for systolic high
      systolicLow: "99", // default low value
      diastolicHigh: "90", // now minimum allowed for diastolic high
      diastolicLow: "69", // default low value
    };

    setDoctorAlertSettings(defaultSettings);
    setOriginalDoctorSettings(defaultSettings);
    setHasChanges(false);
  };

  // Check if settings have changed (compare strings)
  useEffect(() => {
    if (isDoctor && originalDoctorSettings) {
      const changed =
        JSON.stringify(doctorAlertSettings) !==
        JSON.stringify(originalDoctorSettings);
      setHasChanges(changed);
    }
  }, [doctorAlertSettings, originalDoctorSettings, isDoctor]);

  // Real-time password validation
  useEffect(() => {
    if (formData.password) {
      const newValidation = {
        hasMinLength: formData.password.length >= 6,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(
          formData.password
        ),
      };
      setPasswordValidation(newValidation);
    } else {
      // Reset validation when password is empty
      setPasswordValidation({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
  }, [formData.password]);

  // ---------- VALIDATION ----------

  // validateAlertSettings parses string values and returns errors object
  const validateAlertSettings = () => {
    const newErrors = {};

    const parseVal = (v) => {
      if (v === "" || v === undefined || v === null)
        return { ok: false, n: NaN };
      const n = parseInt(String(v), 10);
      return { ok: !isNaN(n), n };
    };

    const sHigh = parseVal(doctorAlertSettings.systolicHigh);
    const sLow = parseVal(doctorAlertSettings.systolicLow);
    const dHigh = parseVal(doctorAlertSettings.diastolicHigh);
    const dLow = parseVal(doctorAlertSettings.diastolicLow);

    // systolicHigh: required & >=130
    if (!sHigh.ok) {
      newErrors.systolicHigh = "Systolic high is required";
    } else if (sHigh.n < 130) {
      newErrors.systolicHigh = "Systolic high should be 130 or above";
    }

    // systolicLow: required & 0-99 (<=99)
    if (!sLow.ok) {
      newErrors.systolicLow = "Systolic low is required";
    } else if (sLow.n < 0) {
      newErrors.systolicLow = "Systolic low should be 0 or above";
    } else if (sLow.n > 99) {
      newErrors.systolicLow = "Systolic low should be 99 or less";
    }

    // check high > low for systolic only when both numeric
    if (sHigh.ok && sLow.ok && sHigh.n <= sLow.n) {
      newErrors.systolic = "Systolic high must be greater than systolic low";
    }

    // diastolicHigh: required & >=90
    if (!dHigh.ok) {
      newErrors.diastolicHigh = "Diastolic high is required";
    } else if (dHigh.n < 90) {
      newErrors.diastolicHigh = "Diastolic high should be 90 or above";
    }

    // diastolicLow: required & 0-69 (<=69)
    if (!dLow.ok) {
      newErrors.diastolicLow = "Diastolic low is required";
    } else if (dLow.n < 0) {
      newErrors.diastolicLow = "Diastolic low should be 0 or above";
    } else if (dLow.n > 69) {
      newErrors.diastolicLow = "Diastolic low should be 69 or less";
    }

    // check high > low for diastolic
    if (dHigh.ok && dLow.ok && dHigh.n <= dLow.n) {
      newErrors.diastolic = "Diastolic high must be greater than diastolic low";
    }

    return newErrors;
  };

  const validatePassword = (password) => {
    if (!password) return "";

    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation only when editing and password is provided
    if (isEditing && formData.password) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- HANDLERS ----------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific errors when user starts typing
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear confirm password error when either password field changes
    if (
      (name === "password" || name === "confirmPassword") &&
      profileErrors.confirmPassword
    ) {
      setProfileErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }

    setProfileSuccess("");
  };

  // This version stores raw string so user can fully edit/delete, but enforces immediate feedback
  const handleDoctorAlertChange = (e) => {
    const { name, value } = e.target;

    // immediate: clear previous API errors for this field
    setAlertErrors((prev) => ({ ...prev, [name]: "" }));
    setAlertSuccess("");

    // allow empty while editing (will be required on save)
    if (value === "" || value === undefined) {
      // clear relation errors for smoother UX
      setAlertErrors((prev) => ({ ...prev, systolic: "", diastolic: "" }));
      setDoctorAlertSettings((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // only digits allowed (no decimals). If not digits, show error but keep value
    if (!/^\d+$/.test(String(value))) {
      // block invalid characters (do not update state)
      return;
    }

    const intVal = parseInt(String(value), 10);

    // Minimum checks
    const mins = {
      systolicHigh: 130,
      systolicLow: 0,
      diastolicHigh: 90,
      diastolicLow: 0,
    };

    const min = mins[name] ?? -Infinity;
    if (intVal < min) {
      // block values below minimum (do not update state)
      return;
    }

    // Apply same blocking logic for low thresholds: cap at allowed max instead of showing error
    const cappedMax =
      name === "systolicLow" ? 99 : name === "diastolicLow" ? 69 : undefined;
    let nextVal = intVal;
    if (typeof cappedMax === "number" && intVal > cappedMax) {
      nextVal = cappedMax;
    }

    // check relation high > low when counterpart is numeric
    const counterpart = name.includes("High")
      ? name.replace("High", "Low")
      : name.replace("Low", "High");
    const counterpartRaw = doctorAlertSettings[counterpart];

    if (
      counterpartRaw !== "" &&
      counterpartRaw !== undefined &&
      /^\d+$/.test(String(counterpartRaw))
    ) {
      const counterpartInt = parseInt(String(counterpartRaw), 10);

      if (name.includes("High") && intVal <= counterpartInt) {
        setAlertErrors((prev) => ({
          ...prev,
          [name]: `${
            name.includes("systolic") ? "Systolic" : "Diastolic"
          } high must be greater than ${
            name.includes("systolic") ? "systolic low" : "diastolic low"
          }`,
        }));
        return;
      }

      if (name.includes("Low") && nextVal >= counterpartInt) {
        // block low being >= high; set just below high if possible
        const adjusted = Math.max(min, counterpartInt - 1);
        nextVal = adjusted;
      }
    }

    // passed immediate checks: update value and clear relation errors
    setDoctorAlertSettings((prev) => ({ ...prev, [name]: String(nextVal) }));
    setAlertErrors((prev) => ({
      ...prev,
      [name]: "",
      systolic: "",
      diastolic: "",
    }));
  };

  // Save doctor alert settings (convert to numbers)
  const saveDoctorAlertSettings = async () => {
    try {
      // convert values to integers before sending
      const doctorSettings = {
        systolic_high: parseInt(String(doctorAlertSettings.systolicHigh), 10),
        systolic_low: parseInt(String(doctorAlertSettings.systolicLow), 10),
        diastolic_high: parseInt(String(doctorAlertSettings.diastolicHigh), 10),
        diastolic_low: parseInt(String(doctorAlertSettings.diastolicLow), 10),
      };

      const response = await axios.patch(
        `${API_BASE}/api/alerts/alert-settings`,
        doctorSettings,
        { withCredentials: true }
      );

      if (response.data.success) {
        // save original as strings to remain consistent with editing state
        setOriginalDoctorSettings({
          systolicHigh: String(doctorSettings.systolic_high),
          systolicLow: String(doctorSettings.systolic_low),
          diastolicHigh: String(doctorSettings.diastolic_high),
          diastolicLow: String(doctorSettings.diastolic_low),
        });
        setHasChanges(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving doctor alert settings:", error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setProfileLoading(true);
    try {
      const changes = {};
      if (formData.name !== (auth.user?.name || ""))
        changes.name = formData.name;
      if (
        formData.username !== (auth.user?.userName || auth.user?.username || "")
      )
        changes.username = formData.username;
      if (formData.email !== (auth.user?.email || ""))
        changes.email = formData.email;
      if (formData.phoneNumber !== (auth.user?.phoneNumber || ""))
        changes.phoneNumber = formData.phoneNumber;
      if (formData.password && formData.password.trim())
        changes.password = formData.password;

      if (Object.keys(changes).length === 0) {
        setProfileSuccess("No changes to save");
        setProfileLoading(false);
        return;
      }

      console.log("Sending changes to /api/settings:", changes);
      const response = await axios.patch(`${API_BASE}/api/settings`, changes, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log("Settings update response:", response.data);
        const updatedUser = response.data.user;

        const newFormData = {
          name: updatedUser.name || "",
          username: updatedUser.userName || updatedUser.username || "",
          email: updatedUser.email || "",
          phoneNumber: updatedUser.phoneNumber || "",
          password: "",
          confirmPassword: "",
        };

        setFormData(newFormData);

        // Update auth state
        const checkResponse = await fetch(`${API_BASE}/api/auth/check-me`, {
          credentials: "include",
        });

        if (checkResponse.ok) {
          const data = await checkResponse.json();
          setAuth({
            ...auth,
            user: {
              ...data.user,
              userName: data.user.username || data.user.userName,
            },
            isAuthenticated: true,
          });
        }

        setProfileSuccess("Profile updated successfully");
        setProfileErrors({});
        setIsEditing(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error("Save error:", error);
      setProfileErrors({
        api: error.response?.data?.error || "Failed to update profile",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveDoctorAlerts = async () => {
    const alertValidationErrors = validateAlertSettings();
    if (Object.keys(alertValidationErrors).length > 0) {
      setAlertErrors(alertValidationErrors);
      return;
    }

    setAlertLoading(true);
    try {
      await saveDoctorAlertSettings();
      setAlertSuccess("Alert settings updated successfully");
      setAlertErrors({});
    } catch (error) {
      console.error("Save error:", error);
      setAlertErrors({
        api: error.response?.data?.error || "Failed to update alert settings",
      });
    } finally {
      setAlertLoading(false);
    }
  };

  const handleSetDefaultAlerts = () => {
    setDefaultDoctorSettings();
    setAlertSuccess("Default alert settings applied");
    setAlertErrors({});
  };

  const handleCancel = () => {
    if (auth?.user) {
      setFormData({
        name: auth.user.name || "",
        username: auth.user.userName || auth.user.username || "",
        email: auth.user.email || "",
        phoneNumber: auth.user.phoneNumber || "",
        password: "",
        confirmPassword: "",
      });
    }

    if (isDoctor) {
      setDoctorAlertSettings(originalDoctorSettings);
      setHasChanges(false);
    }

    setProfileErrors({});
    setProfileSuccess("");
    setAlertErrors({});
    setAlertSuccess("");
    setIsEditing(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordValidation({
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      ...formData,
      password: "",
      confirmPassword: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Real-time validation for password fields
  const getPasswordValidationMessage = () => {
    if (!formData.password) return null;

    const allValid = Object.values(passwordValidation).every(Boolean);

    if (allValid) {
      return (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          Password meets all requirements
        </p>
      );
    }

    return (
      <div className="mt-2 text-xs">
        <p className="text-gray-600 dark:text-gray-400 mb-1">
          Password must contain:
        </p>
        <ul className="space-y-1">
          <li
            className={
              passwordValidation.hasMinLength
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            • At least 6 characters{" "}
            {passwordValidation.hasMinLength ? "✓" : "✗"}
          </li>
          <li
            className={
              passwordValidation.hasUpperCase
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            • One uppercase letter {passwordValidation.hasUpperCase ? "✓" : "✗"}
          </li>
          <li
            className={
              passwordValidation.hasLowerCase
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            • One lowercase letter {passwordValidation.hasLowerCase ? "✓" : "✗"}
          </li>
          <li
            className={
              passwordValidation.hasNumber
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            • One number {passwordValidation.hasNumber ? "✓" : "✗"}
          </li>
          <li
            className={
              passwordValidation.hasSpecialChar
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            • One special character{" "}
            {passwordValidation.hasSpecialChar ? "✓" : "✗"}
          </li>
        </ul>
      </div>
    );
  };

  const getConfirmPasswordMessage = () => {
    if (!formData.confirmPassword) return null;

    if (formData.password === formData.confirmPassword) {
      return (
        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
          Passwords match
        </p>
      );
    } else {
      return (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Passwords do not match
        </p>
      );
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading profile settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary dark:text-white">
        Settings
      </h2>

      {/* User Profile Section - ALWAYS SHOW THIS */}
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-primary dark:text-darkModeText mb-4">
          User Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
                !isEditing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
              }`}
              placeholder="Enter your name"
            />
            {profileErrors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {profileErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
                !isEditing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
              }`}
              placeholder="Enter your username"
            />
            {profileErrors.username && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {profileErrors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
                !isEditing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
              }`}
              placeholder="Enter your email"
            />
            {profileErrors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {profileErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent ${
                !isEditing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
              }`}
              placeholder="Enter your phone number"
            />
            {profileErrors.phoneNumber && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {profileErrors.phoneNumber}
              </p>
            )}
          </div>

          {isEditing && (
            <>
              <div className="md:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Change Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {profileErrors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {profileErrors.password}
                  </p>
                )}
                {getPasswordValidationMessage()}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {profileErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {profileErrors.confirmPassword}
                  </p>
                )}
                {getConfirmPasswordMessage()}
              </div>
            </>
          )}
        </div>

        {/* Profile Section Messages */}
        {profileErrors.api && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {profileErrors.api}
          </p>
        )}
        {profileSuccess && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400">
            {profileSuccess}
          </p>
        )}

        <div className="mt-6 flex space-x-4">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className={`px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors ${
                  profileLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Doctor Alert Settings Section - ONLY FOR DOCTORS */}
      {isDoctor && (
        <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText mb-4">
            Alert Settings
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set your preferred BP thresholds for receiving patient alerts
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Systolic BP Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Systolic BP (mmHg)
              </h4>

              <div>
                <label
                  htmlFor="systolicHigh"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  High Alert Threshold
                </label>
                <input
                  type="number"
                  id="systolicHigh"
                  name="systolicHigh"
                  value={doctorAlertSettings.systolicHigh}
                  onChange={handleDoctorAlertChange}
                  min="130"
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                />
                {alertErrors.systolicHigh && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {alertErrors.systolicHigh}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alert me when patient's systolic BP is above this value (130
                  or above)
                </p>
              </div>

              <div>
                <label
                  htmlFor="systolicLow"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Low Alert Threshold
                </label>
                <input
                  type="number"
                  id="systolicLow"
                  name="systolicLow"
                  value={doctorAlertSettings.systolicLow}
                  onChange={handleDoctorAlertChange}
                  min="0"
                  max="99"
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                />
                {alertErrors.systolicLow && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {alertErrors.systolicLow}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alert me when patient's systolic BP is below this value (99 or
                  less)
                </p>
              </div>

              {alertErrors.systolic && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {alertErrors.systolic}
                </p>
              )}
            </div>

            {/* Diastolic BP Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">
                Diastolic BP (mmHg)
              </h4>

              <div>
                <label
                  htmlFor="diastolicHigh"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  High Alert Threshold
                </label>
                <input
                  type="number"
                  id="diastolicHigh"
                  name="diastolicHigh"
                  value={doctorAlertSettings.diastolicHigh}
                  onChange={handleDoctorAlertChange}
                  min="90"
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                />
                {alertErrors.diastolicHigh && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {alertErrors.diastolicHigh}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alert me when patient's diastolic BP is above this value (90
                  or above)
                </p>
              </div>

              <div>
                <label
                  htmlFor="diastolicLow"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Low Alert Threshold
                </label>
                <input
                  type="number"
                  id="diastolicLow"
                  name="diastolicLow"
                  value={doctorAlertSettings.diastolicLow}
                  onChange={handleDoctorAlertChange}
                  min="0"
                  max="69"
                  className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
                />
                {alertErrors.diastolicLow && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {alertErrors.diastolicLow}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Alert me when patient's diastolic BP is below this value (69
                  or less)
                </p>
              </div>

              {alertErrors.diastolic && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {alertErrors.diastolic}
                </p>
              )}
            </div>
          </div>

          {/* Alert Section Messages */}
          {alertErrors.api && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {alertErrors.api}
            </p>
          )}
          {alertSuccess && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400">
              {alertSuccess}
            </p>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleSaveDoctorAlerts}
              disabled={!hasChanges || alertLoading}
              className={`px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 transition-colors ${
                !hasChanges || alertLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {alertLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Applying...
                </span>
              ) : (
                "Save Alert Settings"
              )}
            </button>

            <button
              onClick={handleSetDefaultAlerts}
              className="px-4 py-2 rounded-lg bg-primary dark:bg-darkModeButton text-white dark:text-black transition-colors"
            >
              Set as Default (Recommended)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

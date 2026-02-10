import React, { useState, useEffect, useContext } from "react";
import { X, User, Mail, Phone } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "api.twentytwohealth.com/rpm-be";

// Fallback to ensure API_BASE is never undefined
// const FINAL_API_BASE = API_BASE || "http://localhost:4000";

const EditUserModal = ({ isOpen, onClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: "Active",
  });
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      console.log("Setting form data for user:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phone || "",
        password: "",
        status: user.status || "Active",
      });
      if (user.role === "patient") {
        fetchAllDoctors();
        fetchAssignedDoctors();
      }
    }
  }, [user]);

  const fetchAllDoctors = async () => {
    setDoctorLoading(true);
    try {
      // Get organization ID from the current user or props
      const organizationId =
        user?.organization_id || auth?.user?.organizationId;

      if (!organizationId) {
        setError("Organization ID not found");
        setDoctorLoading(false);
        return;
      }

      console.log("Fetching doctors for organization:", organizationId);

      const response = await axios.get(
        `${API_BASE}/api/org/organization/${organizationId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Fetched doctors response:", response.data);

      if (response.data.ok) {
        setAllDoctors(response.data.doctors);
        if (response.data.doctors.length === 0) {
          setError("No clinicians available in your organization");
        }
      } else {
        setError(response.data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setError(err.response?.data?.message || "Error fetching doctors");
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchAssignedDoctors = async () => {
    setDoctorLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/patients/${user.id}/doctors`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log("Fetched assigned doctors:", response.data.doctors);
      if (response.data.ok) {
        setAssignedDoctors(response.data.doctors);
      } else {
        setError("Failed to fetch assigned doctors");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching assigned doctors"
      );
      console.error("Fetch assigned doctors error:", err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleUpdateDoctors = async (action, doctorIds = []) => {
    if (doctorIds.length === 0 && action === "add") {
      setError("Please select at least one doctor to add");
      return;
    }
    setDoctorLoading(true);
    setError(null);
    try {
      const numericDoctorIds = doctorIds.map(Number).filter((id) => !isNaN(id));
      if (numericDoctorIds.length === 0 && doctorIds.length > 0) {
        setError("Invalid doctor IDs selected");
        setDoctorLoading(false);
        return;
      }
      console.log(
        `Sending ${action} request for doctor IDs:`,
        numericDoctorIds
      );
      const response = await axios.put(
        `${API_BASE}/api/admin/patients/${user.id}/doctors`,
        {
          addDoctorIds: action === "add" ? numericDoctorIds : [],
          removeDoctorIds: action === "remove" ? numericDoctorIds : [],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.data.ok) {
        await fetchAssignedDoctors();
        setSelectedDoctorIds([]);
      } else {
        setError(response.data.message || `Failed to ${action} doctors`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Error ${action === "add" ? "assigning" : "removing"} doctors`
      );
      console.error("Update doctors error:", err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleRemoveDoctor = async (doctorId) => {
    await handleUpdateDoctors("remove", [doctorId]);
  };

  const handleChange = (field, value) => {
    console.log(`Field changed: ${field}, value:`, value);
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = { ...formData };
      if (!submitData.password || submitData.password.trim() === "") {
        delete submitData.password;
      }

      console.log("Sending edit user data:", submitData);
      console.log("API URL:", `${API_BASE}/api/admin/users/${user.id}`);

      const response = await axios.put(
        `${API_BASE}/api/admin/users/${user.id}`,
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.ok) {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          status: formData.status,
        };
        onSubmit(updatedUser);
        onClose();
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Server error";
      setError(errorMessage);
      if (err.response?.data?.details) {
        const details = err.response.data.details
          .map((d) => d.message)
          .join(", ");
        setError(`${errorMessage}: ${details}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md mx-4 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
            Edit User: {user.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={loading || doctorLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Enter email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Enter phone number"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter new password (leave blank to keep current)"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            {user.role === "patient" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Doctors
                </label>
                {doctorLoading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </p>
                ) : (
                  <>
                    {/* Assigned Doctors List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Currently Assigned:
                      </h4>
                      <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                        <ul className="space-y-1 p-2">
                          {assignedDoctors.map((doc) => (
                            <li
                              key={doc.id}
                              className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
                            >
                              <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                {doc.name} ({doc.email})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDoctor(doc.id)}
                                className="text-red-600 dark:text-red-400 hover:underline text-sm flex-shrink-0 ml-2"
                                disabled={doctorLoading}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                          {assignedDoctors.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                              No doctors assigned
                            </p>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Add New Doctors */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Add New Doctors:
                      </h4>
                      <div className="space-y-2">
                        <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded p-2">
                          {allDoctors.filter(
                            (doc) =>
                              !assignedDoctors.some(
                                (assigned) => assigned.id === doc.id
                              )
                          ).length === 0 ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                              No clinicians available
                            </p>
                          ) : (
                            allDoctors
                              .filter(
                                (doc) =>
                                  !assignedDoctors.some(
                                    (assigned) => assigned.id === doc.id
                                  )
                              )
                              .map((doc) => (
                                <label
                                  key={doc.id}
                                  className="flex items-center space-x-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedDoctorIds.includes(
                                      doc.id.toString()
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedDoctorIds([
                                          ...selectedDoctorIds,
                                          doc.id.toString(),
                                        ]);
                                      } else {
                                        setSelectedDoctorIds(
                                          selectedDoctorIds.filter(
                                            (id) => id !== doc.id.toString()
                                          )
                                        );
                                      }
                                    }}
                                    className="w-3 h-3 text-primary focus:ring-primary dark:focus:ring-darkModeText border-gray-300 dark:border-gray-600 rounded"
                                    disabled={doctorLoading}
                                  />
                                  <span className="text-xs text-gray-900 dark:text-gray-100 flex-1">
                                    {doc.name} ({doc.email})
                                  </span>
                                </label>
                              ))
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateDoctors("add", selectedDoctorIds)
                          }
                          className="w-full px-2 py-1 text-white rounded bg-primary dark:bg-darkModeText dark:text-black hover:opacity-90 disabled:opacity-50 transition-colors text-xs"
                          disabled={
                            doctorLoading || selectedDoctorIds.length === 0
                          }
                        >
                          Add Selected ({selectedDoctorIds.length})
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            disabled={loading || doctorLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 text-white rounded-lg bg-primary dark:bg-darkModeText dark:text-black hover:opacity-90 disabled:opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;

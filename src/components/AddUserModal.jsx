import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";
const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const AddUserModal = ({ isOpen, onClose, onSubmit, organizationId }) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "patient",
    status: "Active",
    assignedDoctors: [],
    doctorIds: [],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Configure axios to include credentials
  const axiosInstance = axios.create({
    withCredentials: true,
  });

  // Fetch doctors from API when modal opens and organizationId changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isOpen || !organizationId) return;

      setLoadingDoctors(true);
      setDoctors([]); // Clear previous doctors
      try {
        const response = await axiosInstance.get(
          `${API_BASE}/api/org/organization/${organizationId}`
        );

        if (response.data.ok) {
          setDoctors(response.data.doctors);
        } else {
          console.error("Failed to fetch doctors:", response.data.message);
          setError("Failed to load doctors list");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Error loading doctors list");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [isOpen, organizationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate that patients have at least one doctor assigned
    if (formData.role === "patient" && formData.doctorIds.length === 0) {
      setError("Please select at least one doctor for the patient");
      setLoading(false);
      return;
    }

    try {
      // Prepare data to send - only include doctorIds for patients
      const dataToSend = {
        ...formData,
        organization_id: organizationId,
      };

      // Only include doctorIds for patients
      if (formData.role !== "patient") {
        delete dataToSend.assignedDoctors;
        delete dataToSend.doctorIds;
      }

      console.log("Sending data to backend:", dataToSend);

      const response = await axiosInstance.post(
        `${API_BASE}/api/auth/register`,
        dataToSend
      );

      if (response.data.ok) {
        alert("User created successfully!");
        onSubmit(formData);
        setFormData({
          username: "",
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
          role: "patient",
          status: "Active",
          assignedDoctors: [],
          doctorIds: [],
        });
        onClose();
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Server error";
      setError(errorMessage);
      if (err.response?.data?.details) {
        const details = err.response.data.details
          .map((detail) => detail.message)
          .join(", ");
        setError(`${errorMessage}: ${details}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Reset doctor selection when role changes from patient to something else
    if (field === "role" && value !== "patient") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        assignedDoctors: [],
        doctorIds: [],
      }));
    }
  };

  const handleDoctorToggle = (doctor) => {
    setFormData((prev) => ({
      ...prev,
      assignedDoctors: prev.assignedDoctors.includes(doctor.name)
        ? prev.assignedDoctors.filter((d) => d !== doctor.name)
        : [...prev.assignedDoctors, doctor.name],
      doctorIds: prev.doctorIds.includes(doctor.id)
        ? prev.doctorIds.filter((id) => id !== doctor.id)
        : [...prev.doctorIds, doctor.id],
    }));
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: "",
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "patient",
        status: "Active",
        assignedDoctors: [],
        doctorIds: [],
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
            Add New User
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter username"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter email address"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter phone number"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                disabled={loading}
              >
                <option value="clinician">Clinician</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            {/* Doctor Selection - Only show when role is "patient" */}
            {formData.role === "patient" && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Assign Doctors <span className="text-red-500">*</span>
                  {formData.doctorIds.length > 0 && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                      ({formData.doctorIds.length} selected)
                    </span>
                  )}
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                  {loadingDoctors ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                      Loading doctors...
                    </div>
                  ) : doctors.length > 0 ? (
                    doctors.map((doctor) => (
                      <label
                        key={doctor.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.doctorIds.includes(doctor.id)}
                          onChange={() => handleDoctorToggle(doctor)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {doctor.name} {doctor.email && `(${doctor.email})`}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                      No doctors available in this organization
                    </div>
                  )}
                </div>
                {formData.doctorIds.length === 0 &&
                  formData.role === "patient" && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select at least one doctor
                    </p>
                  )}
              </div>
            )}

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
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg bg-primary dark:bg-darkModeText  dark:text-black  transition-colors disabled:opacity-50"
              disabled={
                loading ||
                (formData.role === "patient" && formData.doctorIds.length === 0)
              }
            >
              {loading ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

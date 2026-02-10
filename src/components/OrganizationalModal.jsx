import React, { useState, useEffect } from "react";
import { X, Building, UserPlus, Edit, Lock, Trash2 } from "lucide-react";
import {
  editAdminAPI,
  addOrganizationApi,
  deleteOrganization,
  deleteAdminApi,
  addAdminToOrganizationApi,
  editOrganizationApi,
} from "../apis/OrganisationApi";
import { toast } from "react-toastify";

// AddOrganizationModal
const AddOrganizationModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    admin: { username: "", name: "", email: "", phone: "", password: "" },
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Map frontend -> backend fields
    const payload = {
      name: formData.name,
      code: formData.code,
      admin: {
        username: formData.admin.username,
        name: formData.admin.name,
        email: formData.admin.email,
        password: formData.admin.password,
        phone: formData.admin.phone || null,
      },
    };

    try {
      const result = await addOrganizationApi(payload);

      if (result.ok) {
        toast.success("Organization created successfully!");
        // Reset form
        setFormData({
          name: "",
          code: "",
          admin: { username: "", name: "", email: "", phone: "", password: "" },
        });
        // Call the onSubmit callback to refresh the parent component
        if (onSubmit) onSubmit();
        onClose();
      } else {
        toast.error(result.message || "Failed to create organization");
      }
    } catch (err) {
      toast.error("Error creating organization");
      console.error("Create error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
            Add New Organization
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Organization Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Admin Name
              </label>
              <input
                type="text"
                value={formData.admin.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin: { ...formData.admin, name: e.target.value },
                  })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Admin Email
              </label>
              <input
                type="email"
                value={formData.admin.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin: { ...formData.admin, email: e.target.value },
                  })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Username
              </label>
              <input
                type="text"
                value={formData.admin.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin: { ...formData.admin, username: e.target.value },
                  })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Admin Phone
              </label>
              <input
                type="tel"
                value={formData.admin.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin: { ...formData.admin, phone: e.target.value },
                  })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
                Admin Password
              </label>
              <input
                type="password"
                value={formData.admin.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin: { ...formData.admin, password: e.target.value },
                  })
                }
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
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
              className="px-4 py-2 text-white rounded-lg bg-primary dark:bg-darkModeText dark:text-black transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Add Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditOrganizationModal = ({ isOpen, onClose, org, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);

  // Reset form when org changes
  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || "",
        code: org.org_code || "", // Use org_code from API response
      });
    }
  }, [org]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!org?.id) {
      toast.error("Organization ID missing");
      setLoading(false);
      return;
    }

    try {
      const res = await editOrganizationApi(org.id, formData);

      if (res?.success || res?.ok) {
        toast.success("Organization updated successfully");
        if (onUpdated) onUpdated(); // refresh parent list
        onClose();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating organization");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Edit Organization
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Organization Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// AddAdminModal
const AddAdminModal = ({ isOpen, onClose, orgId, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await addAdminToOrganizationApi(orgId, formData);

      if (result.ok) {
        toast.success("Admin added successfully!");
        // Reset form
        setFormData({
          username: "",
          name: "",
          email: "",
          phone: "",
          password: "",
        });
        // Call the onSubmit callback to refresh the parent component
        if (onSubmit) onSubmit();
        onClose();
      } else {
        toast.error(result.message || "Failed to add admin");
      }
    } catch (err) {
      toast.error("Error adding admin");
      console.error("Add admin error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Add New Admin
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Admin Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darkModeText">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditAdminModal = ({ isOpen, onClose, admin, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "", // Add password field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset form when admin changes or modal opens
  useEffect(() => {
    if (admin && isOpen) {
      setFormData({
        name: admin?.name || "",
        email: admin?.email || "",
        phone: admin?.phone || admin?.phoneNumber || "", // Handle both phone field names
        password: "", // Password starts empty
      });
    }
  }, [admin, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API - only include password if it's not empty
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null, // Set to null if empty
      };

      // Only include password if user entered a new one
      if (formData.password.trim()) {
        updateData.password = formData.password.trim();
      }

      await editAdminAPI(admin?.id, updateData);

      // Call the onSubmit prop to refresh the data
      if (onSubmit) {
        await onSubmit();
      }

      setShowConfirm(false);
      onClose();
      toast.success("Admin updated successfully!");
    } catch (err) {
      const errorMsg =
        err.message || "Failed to update admin. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const cancelSave = () => {
    setShowConfirm(false);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Edit Admin
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Optional"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Leave blank to keep current password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only enter if you want to change the password
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </span>
              ) : (
                "Update Admin"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-darkModeText mb-2">
              Confirm Changes
            </h3>
            <p className="text-sm text-gray-600 dark:text-darkModeText mb-4">
              Are you sure you want to update this admin's details?
            </p>

            {/* Show what will be updated */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm mb-4">
              <p className="font-medium">Changes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Name: {formData.name}</li>
                <li>Email: {formData.email}</li>
                <li>Phone: {formData.phone || "Not provided"}</li>
                {formData.password && <li>Password: Will be updated</li>}
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelSave}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Updating..." : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ResetPasswordModal
const ResetPasswordModal = ({ isOpen, onClose, user, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Reset Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 dark:text-darkModeText">
            Are you sure you want to reset the password for {user.name} (
            {user.email})? A new password will be sent to their email.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-white dark:text-black bg-primary dark:bg-darkModeButton rounded-lg hover:opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DeleteOrganizationModal
const DeleteOrganizationModal = ({ isOpen, onClose, org, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      const data = await deleteOrganization(org.id);
      if (data.ok) {
        toast.success("Organization deleted successfully!");
        onDeleteSuccess(org.id); // tell parent to update list
        onClose();
      } else {
        toast.error(data.message || "Failed to delete organization");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error while deleting organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Delete Organization
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 dark:text-darkModeText">
            Are you sure you want to delete the organization "{org.name}" (
            {org.code})? This action cannot be undone and will remove all
            associated admins.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-600 dark:bg-red-500 rounded-lg hover:opacity-90"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DeleteAdminModal
const DeleteAdminModal = ({ isOpen, onClose, admin, onDelete }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!admin || !(admin.id ?? admin._id)) {
      toast.error("Admin ID missing");
      return;
    }

    const adminId = admin.id ?? admin._id;

    try {
      setLoading(true);
      const res = await deleteAdminApi(adminId);

      if (res?.ok) {
        toast.success("Admin deleted successfully");
        // call parent callback so it can remove admin from list
        if (typeof onDelete === "function") onDelete(adminId);
        onClose();
      } else {
        toast.error(res?.message || "Failed to delete admin");
      }
    } catch (err) {
      console.error("DeleteAdminModal error:", err);
      toast.error("Server error while deleting admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-primary dark:text-darkModeText">
            Delete Admin
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-darkModeText hover:text-gray-700 dark:hover:text-darkModeText"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 dark:text-darkModeText">
            Are you sure you want to delete the admin {admin?.name} (
            {admin?.email})? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-600 dark:bg-red-500 rounded-lg hover:opacity-90"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export {
  AddOrganizationModal,
  EditOrganizationModal,
  AddAdminModal,
  EditAdminModal,
  ResetPasswordModal,
  DeleteOrganizationModal,
  DeleteAdminModal,
};

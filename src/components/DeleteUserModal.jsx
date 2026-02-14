import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import axios from "axios";
// const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const API_BASE =
  import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

// Fallback to ensure API_BASE is never undefined
const FINAL_API_BASE = API_BASE || "http://localhost:4000";

const DeleteUserModal = ({ isOpen, onClose, user, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        `${FINAL_API_BASE}/api/admin/users/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.data && response.data.ok) {
        onDelete(user.id);
        onClose();
      } else {
        setError(response.data?.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Unexpected delete error:", err);
      setError("Unexpected server error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-3">
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
              Delete User
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="text-red-500 dark:text-red-400 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 bg-primary dark:bg-blue-600">
                {user.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Created: {user.createdAt} • Last Login: {user.lastLogin}
                </div>
              </div>
            </div>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to permanently delete{" "}
              <strong>{user.name}</strong>?
            </p>

            <div className="flex items-start p-4 rounded-lg mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700">
              <AlertTriangle
                size={20}
                className="text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                  This action cannot be undone
                </p>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p>• All user data will be permanently removed</p>
                  <p>• Associated records and history will be deleted</p>
                  <p>• User will lose access to the system immediately</p>
                  <p>• This action cannot be reversed</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Alternative:</strong> Consider deactivating the user
                instead of deleting. This will preserve data while preventing
                system access.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                loading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              }`}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;

import React from "react";
import { X, Lock, Mail } from "lucide-react";

const ResetPasswordModal = ({ isOpen, onClose, user, onConfirm }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-accent dark:bg-blue-400">
              <Lock size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-primary dark:text-darkModeText">
              Reset Password
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
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
              </div>
            </div>

            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to reset the password for{" "}
              <strong>{user.name}</strong>?
            </p>

            <div className="flex items-center p-4 rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <Mail size={16} className="text-accent dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password reset email will be sent to:
                </p>
                <p className="text-sm font-mono text-primary dark:text-blue-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Note:</strong> The user will receive an email with
                instructions to create a new password. Their current password
                will remain active until they complete the reset process.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white rounded-lg bg-accent dark:bg-darkModeButton hover:bg-primary dark:text-black transition-colors"
            >
              Send Reset Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;

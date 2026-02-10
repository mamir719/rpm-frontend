import React from "react";

const DeviceStatus = ({ device, status, battery, patient }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{device}</div>
        {patient && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{patient}</div>
        )}
        <div
          className={`text-xs ${
            status === "Online" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {status}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{battery}%</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Battery</div>
      </div>
    </div>
  );
};

export default DeviceStatus;
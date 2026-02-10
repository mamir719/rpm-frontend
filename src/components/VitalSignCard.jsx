import React from "react";
import { Clock } from "lucide-react";

const VitalSignCard = ({
  title,
  value,
  unit,
  range,
  status,
  icon: Icon,
  percentage,
  timestamp,
}) => {
  const formatTimeFromDB_UTC = (timestamp) => {
    if (!timestamp) return "No data";
    const d = new Date(timestamp);
    if (isNaN(d)) return "Invalid Date";
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const min = String(d.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon size={20} className="text-accent dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-darkModeText">
            {title}
          </h3>
        </div>
        <span
          className={`text-sm font-medium capitalize ${
            status === "normal"
              ? "text-green-600 dark:text-green-400"
              : status === "warning"
              ? "text-yellow-600 dark:text-yellow-400"
              : status === "critical"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}{" "}
          <span className="text-lg font-normal text-gray-600 dark:text-gray-300">
            {unit}
          </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Normal range: {range}
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <Clock size={16} />
        <span>{formatTimeFromDB_UTC(timestamp)}</span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            status === "normal"
              ? "bg-green-500"
              : status === "warning"
              ? "bg-yellow-500"
              : status === "critical"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default VitalSignCard;

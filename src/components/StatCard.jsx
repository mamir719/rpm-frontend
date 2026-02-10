import React from "react";

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}) => {
  return (
    <div className="bg-white dark:bg-innerDarkColor rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-bold text-black dark:text-white">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {value}
          </p>
          <p
            className={`text-sm mt-1 ${
              changeType === "positive"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {change}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center ${iconColor}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

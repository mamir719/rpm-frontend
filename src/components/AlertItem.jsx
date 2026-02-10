import React from 'react';

const AlertItem = ({ name, condition, severity, time }) => {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-600 dark:text-white">{condition}</div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            severity === 'High' ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' :
            severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
            'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
          }`}>
            {severity}
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
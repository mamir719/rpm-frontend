import React from 'react';

const StatusItem = ({ label, percentage }) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {percentage}% {percentage === 100 ? 'Operational' : 'Active'}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            percentage >= 95 ? 'bg-green-500 dark:bg-green-400' : 
            percentage >= 80 ? 'bg-yellow-500 dark:bg-yellow-400' : 
            'bg-red-500 dark:bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StatusItem;
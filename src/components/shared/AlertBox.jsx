import React from 'react';

const AlertBox = ({ type = 'info', message, icon }) => {
  const types = {
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400',
    success: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',
  };
  
  const styles = types[type] || types.info;
  
  return (
    <div className={`border rounded-lg p-4 mb-6 flex items-center gap-3 ${styles}`}>
      {icon && <span className="h-5 w-5 flex-shrink-0">{icon}</span>}
      <p>{message}</p>
    </div>
  );
};

export default AlertBox;
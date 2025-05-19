import React from 'react';

const AlertBox = ({ 
  type = 'info', 
  message, 
  icon,
  className = '',
  onClose
}) => {
  const types = {
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400',
    success: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',
  };
  
  const styles = types[type] || types.info;
  
  return (
    <div className={`border rounded-lg p-4 mb-6 flex items-center gap-3 ${styles} ${className}`}>
      {icon && <span className="h-5 w-5 flex-shrink-0">{icon}</span>}
      <p className="flex-grow">{message}</p>
      {onClose && (
        <button 
          onClick={onClose} 
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close alert"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AlertBox;
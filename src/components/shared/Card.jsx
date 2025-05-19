import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  title,
  subtitle,
  footer,
  noPadding = false,
  border = false,
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-dark-800 
        rounded-xl shadow-lg
        ${border ? 'border border-dark-200 dark:border-dark-700' : ''}
        ${noPadding ? '' : 'p-6'} 
        ${className}
      `}
    >
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {children}
      
      {footer && (
        <div className="mt-6 pt-4 border-t border-dark-200 dark:border-dark-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
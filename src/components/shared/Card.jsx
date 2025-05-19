const Card = ({ 
  children, 
  className = '', 
  variant = 'default', // default, primary, outline
  elevation = 'md', // none, sm, md, lg
  noPadding = false,
}) => {
  // Base styles
  const baseStyles = 'bg-white dark:bg-dark-800 rounded-xl';
  
  // Variant styles
  const variantStyles = {
    default: '',
    primary: 'border-2 border-primary-200 dark:border-primary-800',
    outline: 'border border-dark-200 dark:border-dark-700',
  };
  
  // Elevation (shadow) styles
  const elevationStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  // Padding styles
  const paddingStyles = noPadding ? '' : 'p-6';
  
  // Combine all styles
  const cardStyles = `${baseStyles} ${variantStyles[variant]} ${elevationStyles[elevation]} ${paddingStyles} ${className}`;
  
  return (
    <div className={cardStyles}>
      {children}
    </div>
  );
};

export default Card;
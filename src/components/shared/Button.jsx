import Link from 'next/link';

const Button = ({
  children,
  className = '',
  variant = 'primary', // primary, secondary, accent, outline
  size = 'md', // sm, md, lg
  href, // If provided, the button will be a Link
  disabled = false,
  type = 'button',
  onClick,
  fullWidth = false,
  ...props
}) => {
  // Base styles for all variants
  const baseStyles = 'btn flex items-center justify-center gap-2 transition-all duration-200';
  
  // Style variations
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30',
  };
  
  // Size variations
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Additional styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`;
  
  // If href is provided, render a Link component
  if (href) {
    return (
      <Link href={href} className={buttonStyles} {...props}>
        {children}
      </Link>
    );
  }
  
  // Otherwise, render a button element
  return (
    <button
      type={type}
      className={buttonStyles}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-desert-gold',
        {
          'bg-desert-gold text-desert-dark hover:bg-amber-date': variant === 'primary',
          'bg-desert-dark text-desert-light hover:bg-desert-gold hover:text-desert-dark': variant === 'secondary',
          'bg-transparent hover:bg-desert-sand text-desert-dark': variant === 'ghost',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

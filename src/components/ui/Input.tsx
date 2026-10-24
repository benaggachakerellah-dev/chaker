import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, id, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-desert-dark">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'px-4 py-2 border border-desert-gold/50 rounded-lg bg-white text-desert-dark focus:outline-none focus:ring-2 focus:ring-desert-gold',
          className
        )}
        {...props}
      />
    </div>
  );
};

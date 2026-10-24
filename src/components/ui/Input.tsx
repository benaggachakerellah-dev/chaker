import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-palm">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full px-3.5 py-2.5 bg-white border border-subtleBorder rounded-lg text-sm text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-palm/20 focus:border-palm transition-colors',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

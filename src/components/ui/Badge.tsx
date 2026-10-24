import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'olive' | 'sand';
}

export function Badge({ children, className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium',
        {
          'bg-palm/10 text-palm': variant === 'primary',
          'bg-olive/10 text-olive': variant === 'olive',
          'bg-sand/30 text-date': variant === 'sand',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

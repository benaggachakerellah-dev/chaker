import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-subtleBorder rounded-lg p-6 shadow-subtle transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

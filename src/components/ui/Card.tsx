import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx('bg-white rounded-xl shadow-md border border-desert-sand p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

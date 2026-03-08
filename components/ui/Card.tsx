import { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'bg-white border border-gray-100 shadow-sm',
  elevated: 'bg-white shadow-md border border-gray-50',
  outline: 'bg-white border border-gray-200',
  ghost: 'bg-gray-50 border border-transparent',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

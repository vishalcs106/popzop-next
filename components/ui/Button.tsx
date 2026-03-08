'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/helpers';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 shadow-sm',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  outline:
    'bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-3 text-xs rounded-lg gap-1.5',
  sm: 'h-9 px-4 text-sm rounded-xl gap-2',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-13 px-7 text-base rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

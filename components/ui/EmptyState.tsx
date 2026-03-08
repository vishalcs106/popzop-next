import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

import { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';
import { OrderStatus, PaymentStatus } from '@/types';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'orange';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  purple: 'bg-violet-50 text-violet-700',
  orange: 'bg-orange-50 text-orange-700',
};

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { label: string; variant: BadgeVariant }
  > = {
    pending: { label: 'Pending', variant: 'warning' },
    paid: { label: 'Paid', variant: 'success' },
    processing: { label: 'Processing', variant: 'info' },
    shipped: { label: 'Shipped', variant: 'purple' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
  };
  const { label, variant } = config[status] ?? {
    label: status,
    variant: 'default' as BadgeVariant,
  };
  return <Badge variant={variant}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config: Record<
    PaymentStatus,
    { label: string; variant: BadgeVariant }
  > = {
    pending: { label: 'Pending', variant: 'warning' },
    paid: { label: 'Paid', variant: 'success' },
    failed: { label: 'Failed', variant: 'danger' },
    refunded: { label: 'Refunded', variant: 'info' },
  };
  const { label, variant } = config[status] ?? {
    label: status,
    variant: 'default' as BadgeVariant,
  };
  return <Badge variant={variant}>{label}</Badge>;
}

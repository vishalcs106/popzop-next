import { Timestamp } from 'firebase/firestore';

export function generateHandle(shopName: string): string {
  return shopName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
    .replace(/^-+|-+$/g, '');
}

export function formatDate(
  date: Timestamp | Date | string | null | undefined
): string {
  if (!date) return '';
  let d: Date;
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeTime(
  date: Timestamp | Date | string | null | undefined
): string {
  if (!date) return '';
  let d: Date;
  if (date instanceof Timestamp) {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

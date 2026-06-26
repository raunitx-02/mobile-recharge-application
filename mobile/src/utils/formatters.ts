import dayjs from 'dayjs';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
};

export const formatPhone = (phone: string): string => {
  if (phone.length === 10) return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  return phone;
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

export const formatDateShort = (date: string | Date): string => {
  return dayjs(date).format('DD MMM YYYY');
};

export const maskPhone = (phone: string): string => {
  if (phone.length === 10) return `+91 XXXXXX${phone.slice(-4)}`;
  return phone;
};

export const formatTxnId = (id: string): string => {
  return `TXN${id.toUpperCase().slice(-8)}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

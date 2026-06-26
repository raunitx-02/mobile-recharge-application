export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 50000;
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidAccountNumber = (account: string): boolean => {
  return account.trim().length >= 6;
};

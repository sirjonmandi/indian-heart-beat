export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,30}$/;
  return nameRegex.test(name.trim());
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateReferralCode = (code: string): boolean => {
  if (!code.trim()) return true; // Optional field
  const codeRegex = /^[A-Za-z0-9]{6,12}$/;
  return codeRegex.test(code);
};

export const validateAge = (dateOfBirth: Date): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 21;
  }
  
  return age >= 21;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length >= 10) {
    return cleaned.slice(-10);
  }
  
  return cleaned;
};

export const formatName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
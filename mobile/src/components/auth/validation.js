/**
 * Validation rules for Authentication (Member 1)
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SRI_LANKAN_PHONE_REGEX = /^(\+94|0)?7\d{8}$/;

export const isEmail = (val) => EMAIL_REGEX.test(String(val || '').trim());

export const isSriLankanPhone = (val) => {
  const sanitized = String(val || '').replace(/[\s-]/g, '');
  return SRI_LANKAN_PHONE_REGEX.test(sanitized);
};

export const isValidEmailOrPhone = (val) => {
  const trimmed = String(val || '').trim();
  return isEmail(trimmed) || isSriLankanPhone(trimmed);
};

export const maskIdentifier = (id) => {
  const trimmed = String(id || '').trim();
  if (isEmail(trimmed)) {
    const [user, domain] = trimmed.split('@');
    const maskedUser = user.length > 2 ? user.slice(0, 2) + '***' : user + '***';
    return `${maskedUser}@${domain}`;
  }
  const cleanPhone = trimmed.replace(/[\s-]/g, '');
  if (cleanPhone.length >= 7) {
    return cleanPhone.slice(0, -3).replace(/\d/g, '•') + cleanPhone.slice(-3);
  }
  return trimmed;
};

/**
 * Checks if password satisfies at least 2 of (upper+lower, number, symbol)
 */
export const hasRequiredComplexity = (password = '') => {
  let complexityCount = 0;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) complexityCount++;
  if (/\d/.test(password)) complexityCount++;
  if (/[^A-Za-z0-9]/.test(password)) complexityCount++;
  return complexityCount >= 2;
};

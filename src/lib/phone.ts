// Ethiopian phone number utilities
export const ETHIOPIAN_PHONE_PREFIXES = [
  '091', '092', '093', '094', '095', '096', '097', '098', '099', // Ethio Telecom
  '070', '071', '072', '073', '074', '075', '076', '077', '078', '079', // Safaricom
];

export const COUNTRY_CODE = '+251';

export function normalizeEthiopianPhone(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Handle different input formats
  if (digitsOnly.startsWith('251')) {
    // Already has country code
    return '+' + digitsOnly;
  } else if (digitsOnly.startsWith('0')) {
    // Starts with 0, remove it and add country code
    return '+251' + digitsOnly.substring(1);
  } else if (digitsOnly.length === 9) {
    // 9 digits without leading 0
    return '+251' + digitsOnly;
  } else if (digitsOnly.length === 10 && digitsOnly.startsWith('9')) {
    // 10 digits starting with 9
    return '+251' + digitsOnly;
  }
  
  // Return as is if we can't normalize
  return phone;
}

export function validateEthiopianPhone(phone: string): boolean {
  const normalized = normalizeEthiopianPhone(phone);
  
  // Check if it matches Ethiopian format: +251XXXXXXXXX (13 digits total)
  if (!normalized.startsWith('+251')) return false;
  
  const localPart = normalized.substring(4); // Remove +251
  
  // Check if local part is 9 digits
  if (localPart.length !== 9) return false;
  
  // Check if it starts with a valid prefix
  const prefix = localPart.substring(0, 2);
  return ETHIOPIAN_PHONE_PREFIXES.some(validPrefix => 
    validPrefix.substring(1) === prefix // Remove the 0 from valid prefixes for comparison
  );
}

export function formatEthiopianPhone(phone: string): string {
  const normalized = normalizeEthiopianPhone(phone);
  
  if (normalized.startsWith('+251') && normalized.length === 13) {
    // Format as +251 XX XXX XXXX
    const localPart = normalized.substring(4);
    return `+251 ${localPart.substring(0, 2)} ${localPart.substring(2, 5)} ${localPart.substring(5)}`;
  }
  
  return phone;
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function validatePassword(password) {
  const regex = /^(?=.*[A-Z]).{6,}$/;
  return regex.test(password);
}
export function validatePhoneNumber(phoneNumber) {
  const trimmedPhoneNumber = phoneNumber.replace(/\s/g, '');
  const isValid =
    /^\d{10}$/.test(trimmedPhoneNumber) && !/\D/.test(trimmedPhoneNumber);

  if (isValid) {
    return trimmedPhoneNumber;
  } else {
    return null;
  }
}
export function validateImage(file) {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(extension);
}

export const hidePartialUsername = (username, visibleChars = 3) => {
  if (visibleChars >= username.length) {
    return username;
  } else {
    const hiddenChars = username.length - visibleChars - 1;
    const hiddenPart = '*'.repeat(hiddenChars);
    const visiblePart = username.slice(0, visibleChars);
    const lastChar = username.slice(-1);
    const hiddenUsername = visiblePart + hiddenPart + lastChar;
    return hiddenUsername;
  }
};

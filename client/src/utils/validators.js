const PHONE = /^\+?[0-9]{10,13}$/;
const USERNAME = /^[a-zA-Z0-9_]{4,20}$/;

const clean = (errors) => Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));

export const passwordError = (v) => {
  if (!v) return 'Enter a password';
  if (v.length < 8) return 'Use at least 8 characters';
  if (!/[a-z]/.test(v) || !/[A-Z]/.test(v) || !/[0-9]/.test(v))
    return 'Include an upper case letter, a lower case letter and a number';
  return '';
};

export const dobError = (v) => {
  if (!v) return 'Select the date of birth';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return 'Enter a valid date';
  if (d > new Date()) return 'Date of birth cannot be in the future';
  if (d.getFullYear() < 1940) return 'Enter a valid date';
  return '';
};

const nameError = (v = '') => {
  const t = v.trim();
  if (!t) return 'Enter the full name';
  if (t.length < 3) return 'Name must be at least 3 characters';
  if (!/^[A-Za-z .'-]+$/.test(t)) return "Use letters, spaces and . ' - only";
  return '';
};

const phoneError = (v = '') => {
  if (!v.trim()) return 'Enter a phone number';
  if (!PHONE.test(v.trim().replace(/[\s-]/g, ''))) return 'Enter a valid phone number (10–13 digits)';
  return '';
};

const confirmError = (confirm, pw) => {
  if (!confirm) return 'Confirm the password';
  return confirm !== pw ? 'Passwords do not match' : '';
};

export const validateRegister = (v) =>
  clean({
    fullName: nameError(v.fullName),
    username: !v.username.trim()
      ? 'Choose a username'
      : !USERNAME.test(v.username.trim())
      ? '4–20 characters: letters, numbers or underscore'
      : '',
    dob: dobError(v.dob),
    gender: v.gender ? '' : 'Select a gender',
    phone: phoneError(v.phone),
    roomType: v.roomType ? '' : 'Select a room type',
    password: passwordError(v.password),
    confirmPassword: confirmError(v.confirmPassword, v.password),
  });

export const validateReset = (v) =>
  clean({
    username: v.username.trim() ? '' : 'Enter your username',
    dob: dobError(v.dob),
    newPassword: passwordError(v.newPassword),
    confirmPassword: confirmError(v.confirmPassword, v.newPassword),
  });

export const validateChangePassword = (v) =>
  clean({
    currentPassword: v.currentPassword ? '' : 'Enter your current password',
    newPassword:
      passwordError(v.newPassword) ||
      (v.newPassword && v.newPassword === v.currentPassword ? 'Choose a password you have not used here' : ''),
    confirmPassword: confirmError(v.confirmPassword, v.newPassword),
  });

export const validateProfile = (v) =>
  clean({
    fullName: nameError(v.fullName),
    phone: phoneError(v.phone),
    gender: v.gender ? '' : 'Select a gender',
  });

export const validateUserEdit = (v) =>
  clean({
    fullName: nameError(v.fullName),
    phone: phoneError(v.phone),
    gender: v.gender ? '' : 'Select a gender',
    dob: dobError(v.dob),
    roomType: v.roomType ? '' : 'Select a room type',
    status: v.status ? '' : 'Select a status',
  });

export const validateRequest = (v) =>
  clean({
    title: !v.title.trim()
      ? 'Give the request a short title'
      : v.title.trim().length < 5
      ? 'Title must be at least 5 characters'
      : v.title.trim().length > 100
      ? 'Title must be 100 characters or fewer'
      : '',
    category: v.category ? '' : 'Select a category',
    priority: v.priority ? '' : 'Select a priority',
    description: !v.description.trim()
      ? 'Describe the problem'
      : v.description.trim().length < 10
      ? 'Add a little more detail (at least 10 characters)'
      : v.description.trim().length > 1000
      ? 'Description must be 1000 characters or fewer'
      : '',
  });

export const validateRoom = (v, { occupancy = 0 } = {}) => {
  const floor = Number(v.floor);
  const capacity = Number(v.capacity);
  return clean({
    roomNumber: !String(v.roomNumber).trim()
      ? 'Enter the room number'
      : String(v.roomNumber).trim().length > 10
      ? 'Room number must be 10 characters or fewer'
      : '',
    floor:
      v.floor === '' || !Number.isInteger(floor) || floor < 0 || floor > 50
        ? 'Enter a floor between 0 and 50'
        : '',
    roomType: v.roomType ? '' : 'Select a room type',
    capacity:
      v.capacity === '' || !Number.isInteger(capacity) || capacity < 1
        ? 'Enter a capacity of at least 1'
        : v.roomType === 'More Than 3 Sharing' && capacity < 4
        ? 'Capacity must be 4 or more for this room type'
        : capacity < occupancy
        ? `Capacity cannot be lower than the ${occupancy} current residents`
        : '',
    status: v.status ? '' : 'Select a status',
  });
};

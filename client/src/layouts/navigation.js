export const userNav = [
  { to: '/user/dashboard', label: 'Dashboard', icon: 'home', end: true },
  { to: '/user/room', label: 'My room', icon: 'door', end: true },
  { to: '/user/requests/new', label: 'New request', icon: 'plus', end: true },
  { to: '/user/requests', label: 'My requests', icon: 'inbox', end: true },
  { to: '/user/profile', label: 'Profile', icon: 'user', end: true },
  { to: '/user/change-password', label: 'Change password', icon: 'lock', end: true },
];

export const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'home', end: true },
  { to: '/admin/users', label: 'Residents', icon: 'users' },
  { to: '/admin/rooms', label: 'Rooms', icon: 'door' },
  { to: '/admin/allocation', label: 'Room allocation', icon: 'swap', end: true },
  { to: '/admin/requests', label: 'Requests', icon: 'inbox' },
  { to: '/admin/profile', label: 'Profile', icon: 'user', end: true },
];

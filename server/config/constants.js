module.exports = {
  ROLES: ['admin', 'user'],
  ROOM_TYPES: ['Single Sharing', '2 Sharing', '3 Sharing', 'More Than 3 Sharing'],
  FIXED_CAPACITY: { 'Single Sharing': 1, '2 Sharing': 2, '3 Sharing': 3 },
  GENDERS: ['Male', 'Female', 'Other'],
  REQUEST_CATEGORIES: [
    'Room Maintenance',
    'Electrical Problem',
    'Plumbing Problem',
    'Cleaning Request',
    'Room Change Request',
    'Food or Mess Complaint',
    'Hostel Facility Complaint',
    'Security Issue',
    'General Complaint',
    'Other',
  ],
  PRIORITIES: ['Low', 'Medium', 'High', 'Urgent'],
  REQUEST_STATUSES: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
  ACCOUNT_STATUSES: ['active', 'inactive'],
  ROOM_STATUSES: ['active', 'inactive'],
  // Fields of a room that are safe to embed in a user document.
  ROOM_FIELDS: 'roomNumber floor roomType capacity occupancy availableBeds status',
};

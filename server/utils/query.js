// Helpers that turn untrusted query-string values into safe filter pieces.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Returns a trimmed string, or '' when the value is not a plain string.
const qs = (v) => (typeof v === 'string' ? v.trim() : '');

// Case-insensitive "contains" regex with user input escaped.
const searchRegex = (v) => new RegExp(escapeRegex(qs(v).slice(0, 50)), 'i');

// Returns the value only when it is one of the allowed options.
const pickEnum = (v, list) => (typeof v === 'string' && list.includes(v) ? v : undefined);

module.exports = { escapeRegex, qs, searchRegex, pickEnum };

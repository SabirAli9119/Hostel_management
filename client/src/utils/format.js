export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const slug = (s) => String(s || '').toLowerCase().replace(/\s+/g, '-');

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export const errMsg = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.request && !err.response) return 'Cannot reach the server. Check that the backend is running.';
  return err?.message || 'Something went wrong. Please try again.';
};

// Backend may return { message, errors: { field: 'message' } } for validation failures.
export const fieldErrors = (err) => err?.response?.data?.errors || {};

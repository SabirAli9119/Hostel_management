// "7d" -> milliseconds. Supports s, m, h, d. Falls back to 7 days.
module.exports = (value) => {
  const match = /^(\d+)\s*([smhd])$/.exec(String(value || '').trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const unit = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]];
  return Number(match[1]) * unit;
};

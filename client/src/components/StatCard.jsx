import { Link } from 'react-router-dom';

export default function StatCard({ label, value, hint, tone = 'default', to }) {
  const body = (
    <>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? '—'}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </>
  );
  return to ? (
    <Link to={to} className={`stat stat-${tone} stat-link`}>
      {body}
    </Link>
  ) : (
    <div className={`stat stat-${tone}`}>{body}</div>
  );
}

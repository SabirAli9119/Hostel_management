import { capitalize, slug } from '../utils/format.js';

export default function StatusBadge({ value }) {
  if (!value) return null;
  return <span className={`badge badge-${slug(value)}`}>{capitalize(value)}</span>;
}

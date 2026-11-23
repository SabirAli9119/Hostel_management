import StatusBadge from './StatusBadge.jsx';
import { formatDateTime, slug } from '../utils/format.js';

export default function Timeline({ items = [] }) {
  if (!items.length) return <p className="muted-text">No activity yet.</p>;
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <li key={i}>
          <span className={`dot dot-${slug(it.status)}`} />
          <div>
            <div className="tl-head">
              <StatusBadge value={it.status} />
              <time>{formatDateTime(it.at)}</time>
            </div>
            {it.note && <p>{it.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

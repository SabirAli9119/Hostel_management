export default function Pagination({ page = 1, pages = 1, total, onChange }) {
  const count = total != null && (
    <span className="muted-text">
      {total} result{total === 1 ? '' : 's'}
    </span>
  );
  if (!pages || pages <= 1) return total ? <div className="pagination">{count}</div> : null;

  const items = [];
  let last = 0;
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      if (i - last > 1) items.push(`gap-${i}`);
      items.push(i);
      last = i;
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {count}
      <div className="pager">
        <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        {items.map((it) =>
          typeof it === 'string' ? (
            <span key={it} className="page-gap">
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              className={`page-btn ${it === page ? 'current' : ''}`}
              aria-current={it === page ? 'page' : undefined}
              onClick={() => onChange(it)}
            >
              {it}
            </button>
          )
        )}
        <button type="button" className="page-btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  );
}

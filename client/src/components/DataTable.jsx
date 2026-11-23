import Loader from './Loader.jsx';
import EmptyState from './EmptyState.jsx';

export default function DataTable({
  columns,
  rows = [],
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyText,
  onRowClick,
  rowKey = '_id',
}) {
  return (
    <div className="table-card">
      <div className={`table-wrap ${loading && rows.length ? 'is-loading' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.className}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r[rowKey]}
                className={onRowClick ? 'clickable' : ''}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.className} data-label={c.header}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && rows.length === 0 && <Loader />}
      {!loading && rows.length === 0 && <EmptyState title={emptyTitle} text={emptyText} />}
    </div>
  );
}

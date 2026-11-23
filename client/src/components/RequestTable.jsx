import { Link, useNavigate } from 'react-router-dom';
import DataTable from './DataTable.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

export default function RequestTable({
  requests = [],
  loading,
  basePath,
  showUser = false,
  emptyTitle = 'No requests found',
  emptyText,
}) {
  const navigate = useNavigate();
  const columns = [
    {
      key: 'title',
      header: 'Request',
      render: (r) => (
        <div>
          <strong>{r.title}</strong>
          <div className="sub">{r.category}</div>
        </div>
      ),
    },
    ...(showUser
      ? [
          {
            key: 'user',
            header: 'Resident',
            render: (r) =>
              r.user ? (
                <div>
                  <strong>{r.user.fullName}</strong>
                  <div className="sub">@{r.user.username}</div>
                </div>
              ) : (
                '—'
              ),
          },
        ]
      : []),
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge value={r.priority} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'createdAt', header: 'Submitted', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (r) => (
        <Link className="btn btn-ghost btn-sm" to={`${basePath}/${r._id}`} onClick={(e) => e.stopPropagation()}>
          View
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={requests}
      loading={loading}
      onRowClick={(r) => navigate(`${basePath}/${r._id}`)}
      emptyTitle={emptyTitle}
      emptyText={emptyText}
    />
  );
}

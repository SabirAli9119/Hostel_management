import { Link } from 'react-router-dom';
import { Alert, Button, FilterSelect, PageHeader, Pagination, RequestTable, SearchInput } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useListQuery from '../../hooks/useListQuery.js';
import * as requestService from '../../services/requestService.js';
import { REQUEST_STATUSES } from '../../utils/constants.js';

export default function MyRequests() {
  const q = useListQuery({ status: '' });
  const { data, loading, error } = useFetch(() => requestService.mine(q.query), [q.queryKey]);
  const filtered = q.params.search || q.params.status;

  return (
    <>
      <PageHeader
        title="My requests"
        subtitle="Everything you have sent to the warden and where it stands."
        actions={
          <Link to="/user/requests/new" className="btn btn-primary btn-md">
            New request
          </Link>
        }
      />
      <div className="toolbar">
        <SearchInput value={q.params.search} onChange={(v) => q.setParam('search', v)} placeholder="Search by title or description" />
        <FilterSelect label="All statuses" value={q.params.status} onChange={(v) => q.setParam('status', v)} options={REQUEST_STATUSES} />
        {filtered && (
          <Button variant="ghost" onClick={q.reset}>
            Clear filters
          </Button>
        )}
      </div>
      <Alert>{error}</Alert>
      <RequestTable
        requests={data?.requests || []}
        loading={loading}
        basePath="/user/requests"
        emptyTitle={filtered ? 'No requests match your filters' : 'No requests yet'}
        emptyText={filtered ? 'Try a different search or clear the filters.' : 'Use New request to tell the warden about a problem.'}
      />
      <Pagination page={data?.pagination?.page} pages={data?.pagination?.pages} total={data?.pagination?.total} onChange={q.setPage} />
    </>
  );
}

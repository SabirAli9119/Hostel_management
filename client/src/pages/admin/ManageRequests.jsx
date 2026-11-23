import { useSearchParams } from 'react-router-dom';
import { Alert, Button, FilterSelect, PageHeader, Pagination, RequestTable, SearchInput } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useListQuery from '../../hooks/useListQuery.js';
import * as adminService from '../../services/adminService.js';
import { PRIORITIES, REQUEST_CATEGORIES, REQUEST_STATUSES } from '../../utils/constants.js';

export default function ManageRequests() {
  const [sp] = useSearchParams();
  const q = useListQuery({ status: sp.get('status') || '', category: '', priority: '' });
  const { data, loading, error } = useFetch(() => adminService.requests(q.query), [q.queryKey]);
  const filtered = q.params.search || q.params.status || q.params.category || q.params.priority;

  return (
    <>
      <PageHeader title="Requests" subtitle="Review what residents have reported and respond to each one." />
      <div className="toolbar">
        <SearchInput value={q.params.search} onChange={(v) => q.setParam('search', v)} placeholder="Search by title, description or resident" />
        <FilterSelect label="All statuses" value={q.params.status} onChange={(v) => q.setParam('status', v)} options={REQUEST_STATUSES} />
        <FilterSelect label="All categories" value={q.params.category} onChange={(v) => q.setParam('category', v)} options={REQUEST_CATEGORIES} />
        <FilterSelect label="All priorities" value={q.params.priority} onChange={(v) => q.setParam('priority', v)} options={PRIORITIES} />
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
        basePath="/admin/requests"
        showUser
        emptyTitle={filtered ? 'No requests match your filters' : 'No requests yet'}
        emptyText={filtered ? 'Try a different search or clear the filters.' : 'Requests from residents will appear here.'}
      />
      <Pagination page={data?.pagination?.page} pages={data?.pagination?.pages} total={data?.pagination?.total} onChange={q.setPage} />
    </>
  );
}

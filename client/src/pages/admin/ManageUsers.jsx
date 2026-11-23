import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, ConfirmDialog, DataTable, FilterSelect, PageHeader, Pagination, RoomTag, SearchInput, StatusBadge } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useListQuery from '../../hooks/useListQuery.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { ACTIVE_STATES, ROOM_TYPES } from '../../utils/constants.js';
import { errMsg } from '../../utils/format.js';

const ALLOCATION = [
  { value: 'assigned', label: 'Room assigned' },
  { value: 'unassigned', label: 'No room yet' },
];

export default function ManageUsers() {
  const [sp] = useSearchParams();
  const q = useListQuery({ status: sp.get('status') || '', roomType: '', allocation: '' });
  const { data, loading, error, reload } = useFetch(() => adminService.users(q.query), [q.queryKey]);
  const toast = useToast();
  const [action, setAction] = useState(null); // { type: 'delete' | 'toggle', user }
  const [busy, setBusy] = useState(false);
  const filtered = q.params.search || q.params.status || q.params.roomType || q.params.allocation;

  const run = async () => {
    setBusy(true);
    try {
      if (action.type === 'delete') {
        await adminService.deleteUser(action.user._id);
        toast.success('Resident deleted');
      } else {
        const next = action.user.status === 'active' ? 'inactive' : 'active';
        await adminService.updateUser(action.user._id, { status: next });
        toast.success(next === 'active' ? 'Resident activated' : 'Resident deactivated');
      }
      setAction(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Resident',
      render: (u) => (
        <div>
          <strong>{u.fullName}</strong>
          <div className="sub">@{u.username}</div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone' },
    { key: 'roomType', header: 'Room type' },
    {
      key: 'room',
      header: 'Room',
      render: (u) => (u.assignedRoom ? <RoomTag number={u.assignedRoom.roomNumber} /> : <span className="muted-text">Not assigned</span>),
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge value={u.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (u) => (
        <div className="row-actions">
          <Link className="btn btn-ghost btn-sm" to={`/admin/users/${u._id}`}>
            View
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setAction({ type: 'toggle', user: u })}>
            {u.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="danger-ghost" size="sm" icon="trash" aria-label={`Delete ${u.fullName}`} onClick={() => setAction({ type: 'delete', user: u })} />
        </div>
      ),
    },
  ];

  const isDelete = action?.type === 'delete';
  const deactivating = action?.type === 'toggle' && action.user.status === 'active';

  return (
    <>
      <PageHeader title="Residents" subtitle="Search, review and manage every resident account." />
      <div className="toolbar">
        <SearchInput value={q.params.search} onChange={(v) => q.setParam('search', v)} placeholder="Search by name, username or phone" />
        <FilterSelect label="All statuses" value={q.params.status} onChange={(v) => q.setParam('status', v)} options={ACTIVE_STATES} />
        <FilterSelect label="All room types" value={q.params.roomType} onChange={(v) => q.setParam('roomType', v)} options={ROOM_TYPES} />
        <FilterSelect label="Any allocation" value={q.params.allocation} onChange={(v) => q.setParam('allocation', v)} options={ALLOCATION} />
        {filtered && (
          <Button variant="ghost" onClick={q.reset}>
            Clear filters
          </Button>
        )}
      </div>
      <Alert>{error}</Alert>
      <DataTable
        columns={columns}
        rows={data?.users || []}
        loading={loading}
        emptyTitle={filtered ? 'No residents match your filters' : 'No residents yet'}
        emptyText={filtered ? 'Try a different search or clear the filters.' : 'Residents appear here after they register.'}
      />
      <Pagination page={data?.pagination?.page} pages={data?.pagination?.pages} total={data?.pagination?.total} onChange={q.setPage} />
      <ConfirmDialog
        open={Boolean(action)}
        danger={isDelete || deactivating}
        title={isDelete ? 'Delete this resident?' : deactivating ? 'Deactivate this resident?' : 'Activate this resident?'}
        message={
          isDelete
            ? `${action?.user.fullName}'s account and requests will be removed and their bed released. This cannot be undone.`
            : deactivating
            ? `${action?.user.fullName} will no longer be able to sign in.`
            : `${action?.user.fullName} will be able to sign in again.`
        }
        confirmLabel={isDelete ? 'Delete resident' : deactivating ? 'Deactivate' : 'Activate'}
        loading={busy}
        onConfirm={run}
        onCancel={() => setAction(null)}
      />
    </>
  );
}

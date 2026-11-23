import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AssignRoomModal, Button, ConfirmDialog, DataTable, FilterSelect, PageHeader, Pagination, RoomTag, SearchInput } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useListQuery from '../../hooks/useListQuery.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { ROOM_TYPES } from '../../utils/constants.js';
import { errMsg, formatDate } from '../../utils/format.js';

const TABS = [
  { value: 'unassigned', label: 'Waiting for a room' },
  { value: 'assigned', label: 'Allocated' },
];

export default function RoomAllocation() {
  const q = useListQuery({ allocation: 'unassigned', roomType: '', status: 'active' });
  const { data, loading, error, reload } = useFetch(() => adminService.users(q.query), [q.queryKey]);
  const toast = useToast();
  const [assigning, setAssigning] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const waiting = q.params.allocation === 'unassigned';

  const removeFromRoom = async () => {
    setBusy(true);
    try {
      await adminService.removeUser(removing.assignedRoom._id, removing._id);
      toast.success(`${removing.fullName} removed from room ${removing.assignedRoom.roomNumber}`);
      setRemoving(null);
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
          <Link to={`/admin/users/${u._id}`}>
            <strong>{u.fullName}</strong>
          </Link>
          <div className="sub">@{u.username}</div>
        </div>
      ),
    },
    { key: 'roomType', header: 'Room type' },
    ...(waiting
      ? [{ key: 'createdAt', header: 'Registered', render: (u) => formatDate(u.createdAt) }]
      : [{ key: 'room', header: 'Current room', render: (u) => (u.assignedRoom ? <RoomTag number={u.assignedRoom.roomNumber} /> : '—') }]),
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (u) => (
        <div className="row-actions">
          <Button size="sm" variant={waiting ? 'primary' : 'secondary'} icon={waiting ? undefined : 'swap'} onClick={() => setAssigning(u)}>
            {waiting ? 'Assign room' : 'Change room'}
          </Button>
          {!waiting && (
            <Button size="sm" variant="danger-ghost" onClick={() => setRemoving(u)}>
              Remove
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Room allocation" subtitle="Give each resident a bed in a room that matches their room type." />
      <div className="segmented" role="tablist" aria-label="Allocation view">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={q.params.allocation === t.value}
            className={q.params.allocation === t.value ? 'active' : ''}
            onClick={() => q.setParam('allocation', t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <SearchInput value={q.params.search} onChange={(v) => q.setParam('search', v)} placeholder="Search by name or username" />
        <FilterSelect label="All room types" value={q.params.roomType} onChange={(v) => q.setParam('roomType', v)} options={ROOM_TYPES} />
      </div>
      <Alert>{error}</Alert>
      <DataTable
        columns={columns}
        rows={data?.users || []}
        loading={loading}
        emptyTitle={waiting ? 'Nobody is waiting for a room' : 'No allocated residents found'}
        emptyText={waiting ? 'New active residents without a room will appear here.' : 'Try a different search or room type.'}
      />
      <Pagination page={data?.pagination?.page} pages={data?.pagination?.pages} total={data?.pagination?.total} onChange={q.setPage} />
      {assigning && (
        <AssignRoomModal
          user={assigning}
          onClose={() => setAssigning(null)}
          onDone={() => {
            setAssigning(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        danger
        title="Remove from room?"
        message={`${removing?.fullName} will give up their bed in room ${removing?.assignedRoom?.roomNumber}.`}
        confirmLabel="Remove from room"
        loading={busy}
        onConfirm={removeFromRoom}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}

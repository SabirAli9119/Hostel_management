import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, BedMeter, Button, ConfirmDialog, DataTable, FilterSelect, PageHeader, Pagination, RoomTag, SearchInput, StatusBadge } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useListQuery from '../../hooks/useListQuery.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { ACTIVE_STATES, ROOM_TYPES } from '../../utils/constants.js';
import { errMsg } from '../../utils/format.js';

const AVAILABILITY = [
  { value: 'available', label: 'Has free beds' },
  { value: 'full', label: 'Full' },
];

export default function ManageRooms() {
  const q = useListQuery({ roomType: '', status: '', availability: '', floor: '' });
  const { data, loading, error, reload } = useFetch(() => adminService.rooms(q.query), [q.queryKey]);
  const toast = useToast();
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const filtered = q.params.search || q.params.roomType || q.params.status || q.params.availability || q.params.floor;

  const remove = async () => {
    setBusy(true);
    try {
      await adminService.deleteRoom(deleting._id);
      toast.success(`Room ${deleting.roomNumber} deleted`);
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'roomNumber', header: 'Room', render: (r) => <RoomTag number={r.roomNumber} /> },
    { key: 'floor', header: 'Floor' },
    { key: 'roomType', header: 'Type' },
    { key: 'occupancy', header: 'Beds', render: (r) => <BedMeter capacity={r.capacity} occupancy={r.occupancy} /> },
    { key: 'availableBeds', header: 'Free beds' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (r) => (
        <div className="row-actions">
          <Link className="btn btn-ghost btn-sm" to={`/admin/rooms/${r._id}`}>
            View
          </Link>
          <Link className="btn btn-ghost btn-sm" to={`/admin/rooms/${r._id}/edit`}>
            Edit
          </Link>
          <Button
            variant="danger-ghost"
            size="sm"
            icon="trash"
            aria-label={`Delete room ${r.roomNumber}`}
            disabled={r.occupancy > 0}
            title={r.occupancy > 0 ? 'Remove residents before deleting this room' : 'Delete room'}
            onClick={() => setDeleting(r)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Rooms"
        subtitle="Every room, its beds and who is in it."
        actions={
          <Link to="/admin/rooms/new" className="btn btn-primary btn-md">
            Add room
          </Link>
        }
      />
      <div className="toolbar">
        <SearchInput value={q.params.search} onChange={(v) => q.setParam('search', v)} placeholder="Search by room number" />
        <FilterSelect label="All room types" value={q.params.roomType} onChange={(v) => q.setParam('roomType', v)} options={ROOM_TYPES} />
        <FilterSelect label="All statuses" value={q.params.status} onChange={(v) => q.setParam('status', v)} options={ACTIVE_STATES} />
        <FilterSelect label="Any availability" value={q.params.availability} onChange={(v) => q.setParam('availability', v)} options={AVAILABILITY} />
        <input
          type="number"
          min={0}
          max={50}
          className="filter-input"
          placeholder="Floor"
          aria-label="Filter by floor"
          value={q.params.floor}
          onChange={(e) => q.setParam('floor', e.target.value)}
        />
        {filtered && (
          <Button variant="ghost" onClick={q.reset}>
            Clear filters
          </Button>
        )}
      </div>
      <Alert>{error}</Alert>
      <DataTable
        columns={columns}
        rows={data?.rooms || []}
        loading={loading}
        emptyTitle={filtered ? 'No rooms match your filters' : 'No rooms yet'}
        emptyText={filtered ? 'Try a different search or clear the filters.' : 'Add the first room to start allocating beds.'}
      />
      <Pagination page={data?.pagination?.page} pages={data?.pagination?.pages} total={data?.pagination?.total} onChange={q.setPage} />
      <ConfirmDialog
        open={Boolean(deleting)}
        danger
        title="Delete this room?"
        message={`Room ${deleting?.roomNumber} will be removed permanently. Only empty rooms can be deleted.`}
        confirmLabel="Delete room"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

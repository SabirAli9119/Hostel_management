import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, BedMeter, Button, ConfirmDialog, DataTable, DetailList, Loader, Modal, PageHeader, RoomTag, SearchInput, StatusBadge,
} from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { errMsg } from '../../utils/format.js';

function AddResidentModal({ room, onClose, onDone }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [savingId, setSavingId] = useState('');
  const { data, loading, error } = useFetch(
    () =>
      adminService.users({
        allocation: 'unassigned',
        roomType: room.roomType,
        status: 'active',
        search: debounced || undefined,
        limit: 50,
      }),
    [debounced, room._id]
  );
  const users = data?.users || [];

  const assign = async (user) => {
    setSavingId(user._id);
    try {
      await adminService.assignUser(room._id, user._id);
      toast.success(`${user.fullName} added to room ${room.roomNumber}`);
      onDone();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSavingId('');
    }
  };

  return (
    <Modal open title="Add a resident" onClose={onClose}>
      <p className="muted-text">
        Active residents waiting for a <strong>{room.roomType}</strong> room.
      </p>
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or username" />
      <Alert>{error}</Alert>
      {loading && <Loader />}
      {!loading && !error && users.length === 0 && <p className="muted-text pad-y">No residents are waiting for this room type.</p>}
      <ul className="plain-list">
        {users.map((u) => (
          <li key={u._id}>
            <div>
              <strong>{u.fullName}</strong>
              <div className="sub">@{u.username}</div>
            </div>
            <Button size="sm" loading={savingId === u._id} disabled={Boolean(savingId)} onClick={() => assign(u)}>
              Add to room
            </Button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default function AdminRoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => adminService.room(id), [id]);
  const [modal, setModal] = useState(null); // 'add' | 'delete'
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const room = data?.room;

  const removeResident = async () => {
    setBusy(true);
    try {
      await adminService.removeUser(id, removing._id);
      toast.success(`${removing.fullName} removed from the room`);
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteRoom = async () => {
    setBusy(true);
    try {
      await adminService.deleteRoom(id);
      toast.success('Room deleted');
      navigate('/admin/rooms', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
      setBusy(false);
      setModal(null);
    }
  };

  if (loading && !room) return <Loader />;
  if (!room)
    return (
      <>
        <PageHeader title="Room" back={{ to: '/admin/rooms', label: 'Rooms' }} />
        <Alert>{error || 'This room could not be found.'}</Alert>
      </>
    );

  const canAdd = room.status === 'active' && room.availableBeds > 0;
  const columns = [
    { key: 'fullName', header: 'Resident', render: (u) => <Link to={`/admin/users/${u._id}`}><strong>{u.fullName}</strong></Link> },
    { key: 'username', header: 'Username', render: (u) => `@${u.username}` },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: '',
      className: 'cell-actions',
      render: (u) => (
        <Button variant="danger-ghost" size="sm" onClick={() => setRemoving(u)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={`Room ${room.roomNumber}`}
        back={{ to: '/admin/rooms', label: 'Rooms' }}
        actions={
          <>
            <Link to={`/admin/rooms/${id}/edit`} className="btn btn-secondary btn-md">
              Edit room
            </Link>
            <Button variant="danger-ghost" icon="trash" disabled={room.occupancy > 0} title={room.occupancy > 0 ? 'Remove residents before deleting this room' : 'Delete room'} onClick={() => setModal('delete')}>
              Delete
            </Button>
          </>
        }
      />
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h3>Room details</h3>
            <StatusBadge value={room.status} />
          </div>
          <div className="room-summary">
            <RoomTag number={room.roomNumber} large />
            <BedMeter capacity={room.capacity} occupancy={room.occupancy} />
            <DetailList
              items={[
                { label: 'Room type', value: room.roomType },
                { label: 'Floor', value: room.floor },
                { label: 'Capacity', value: `${room.capacity} beds` },
                { label: 'Occupancy', value: `${room.occupancy} filled` },
                { label: 'Available beds', value: room.availableBeds },
              ]}
            />
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Residents</h3>
            <Button size="sm" icon="plus" disabled={!canAdd} title={canAdd ? 'Add a resident' : 'This room is full or inactive'} onClick={() => setModal('add')}>
              Add resident
            </Button>
          </div>
          <DataTable columns={columns} rows={room.assignedUsers || []} emptyTitle="No residents in this room" emptyText="Use Add resident to assign someone." />
        </section>
      </div>

      {modal === 'add' && (
        <AddResidentModal
          room={room}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        danger
        title="Remove from room?"
        message={`${removing?.fullName} will give up their bed in room ${room.roomNumber}.`}
        confirmLabel="Remove resident"
        loading={busy}
        onConfirm={removeResident}
        onCancel={() => setRemoving(null)}
      />
      <ConfirmDialog
        open={modal === 'delete'}
        danger
        title="Delete this room?"
        message={`Room ${room.roomNumber} will be removed permanently.`}
        confirmLabel="Delete room"
        loading={busy}
        onConfirm={deleteRoom}
        onCancel={() => setModal(null)}
      />
    </>
  );
}

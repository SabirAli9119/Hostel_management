import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Loader from './Loader.jsx';
import Alert from './Alert.jsx';
import SearchInput from './SearchInput.jsx';
import RoomTag from './RoomTag.jsx';
import BedMeter from './BedMeter.jsx';
import useFetch from '../hooks/useFetch.js';
import useDebounce from '../hooks/useDebounce.js';
import useToast from '../hooks/useToast.js';
import * as adminService from '../services/adminService.js';
import { errMsg } from '../utils/format.js';

// Lists active rooms of the resident's room type that still have free beds.
export default function AssignRoomModal({ user, onClose, onDone }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const moving = Boolean(user.assignedRoom);

  const { data, loading, error } = useFetch(
    () =>
      adminService.rooms({
        roomType: user.roomType,
        status: 'active',
        availability: 'available',
        search: debounced || undefined,
        limit: 50,
      }),
    [debounced, user._id]
  );
  const rooms = (data?.rooms || []).filter((r) => r._id !== user.assignedRoom?._id);

  const submit = async () => {
    setSaving(true);
    try {
      await adminService.assignUser(selected, user._id);
      toast.success(moving ? 'Room changed' : 'Room assigned');
      onDone();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={moving ? 'Change room' : 'Assign room'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!selected} loading={saving}>
            {moving ? 'Move resident' : 'Assign room'}
          </Button>
        </>
      }
    >
      <p className="muted-text">
        Active <strong>{user.roomType}</strong> rooms with a free bed for <strong>{user.fullName}</strong>.
      </p>
      <SearchInput value={search} onChange={setSearch} placeholder="Search by room number" />
      <Alert>{error}</Alert>
      {loading && <Loader />}
      {!loading && !error && rooms.length === 0 && (
        <p className="muted-text pad-y">No matching room has a free bed. Add a room or free up a bed first.</p>
      )}
      <div className="option-list">
        {rooms.map((r) => (
          <label key={r._id} className={`room-option ${selected === r._id ? 'selected' : ''}`}>
            <input type="radio" name="room" value={r._id} checked={selected === r._id} onChange={() => setSelected(r._id)} />
            <RoomTag number={r.roomNumber} />
            <span className="sub">Floor {r.floor}</span>
            <BedMeter capacity={r.capacity} occupancy={r.occupancy} showText={false} />
            <span className="sub">{r.availableBeds} free</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

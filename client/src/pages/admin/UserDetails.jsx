import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, AssignRoomModal, BedMeter, Button, ConfirmDialog, DetailList, FormField, Loader, Modal,
  PageHeader, RequestTable, RoomTag, StatusBadge,
} from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { validateUserEdit } from '../../utils/validators.js';
import { ACTIVE_STATES, GENDERS, ROOM_TYPES } from '../../utils/constants.js';
import { errMsg, fieldErrors, formatDate, toInputDate } from '../../utils/format.js';

function EditUserModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const form = useForm({
    fullName: user.fullName,
    phone: user.phone,
    gender: user.gender,
    dob: toInputDate(user.dob),
    roomType: user.roomType,
    status: user.status,
  });
  const { values, errors } = form;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateUserEdit(values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError('');
    try {
      await adminService.updateUser(user._id, { ...values, fullName: values.fullName.trim(), phone: values.phone.trim() });
      toast.success('Resident updated');
      onSaved();
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Edit resident"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-user-form" loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={submit} noValidate className="form">
        <Alert>{error}</Alert>
        <FormField label="Full name" name="fullName" required value={values.fullName} onChange={form.handleChange} error={errors.fullName} />
        <div className="grid-2">
          <FormField label="Phone number" name="phone" type="tel" required value={values.phone} onChange={form.handleChange} error={errors.phone} />
          <FormField label="Gender" name="gender" as="select" options={GENDERS} required value={values.gender} onChange={form.handleChange} error={errors.gender} />
        </div>
        <div className="grid-2">
          <FormField label="Date of birth" name="dob" type="date" required value={values.dob} onChange={form.handleChange} error={errors.dob} />
          <FormField label="Account status" name="status" as="select" options={ACTIVE_STATES} required value={values.status} onChange={form.handleChange} error={errors.status} />
        </div>
        <FormField
          label="Room type"
          name="roomType"
          as="select"
          options={ROOM_TYPES}
          required
          disabled={Boolean(user.assignedRoom)}
          hint={user.assignedRoom ? 'Remove the resident from their room before changing the room type.' : undefined}
          value={values.roomType}
          onChange={form.handleChange}
          error={errors.roomType}
        />
      </form>
    </Modal>
  );
}

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => adminService.user(id), [id]);
  const [modal, setModal] = useState(null); // 'edit' | 'assign' | 'remove' | 'toggle' | 'delete'
  const [busy, setBusy] = useState(false);
  const user = data?.user;

  const close = () => setModal(null);
  const done = () => {
    close();
    reload();
  };

  const run = async () => {
    setBusy(true);
    try {
      if (modal === 'remove') {
        await adminService.removeUser(user.assignedRoom._id, user._id);
        toast.success('Resident removed from room');
      } else if (modal === 'toggle') {
        const next = user.status === 'active' ? 'inactive' : 'active';
        await adminService.updateUser(user._id, { status: next });
        toast.success(next === 'active' ? 'Resident activated' : 'Resident deactivated');
      } else if (modal === 'delete') {
        await adminService.deleteUser(user._id);
        toast.success('Resident deleted');
        navigate('/admin/users', { replace: true });
        return;
      }
      done();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading && !user) return <Loader />;
  if (!user)
    return (
      <>
        <PageHeader title="Resident" back={{ to: '/admin/users', label: 'Residents' }} />
        <Alert>{error || 'This resident could not be found.'}</Alert>
      </>
    );

  const room = user.assignedRoom;
  const active = user.status === 'active';
  const copy = {
    remove: { title: 'Remove from room?', message: `${user.fullName} will give up their bed in room ${room?.roomNumber}.`, label: 'Remove from room', danger: true },
    toggle: {
      title: active ? 'Deactivate this resident?' : 'Activate this resident?',
      message: active ? `${user.fullName} will no longer be able to sign in.` : `${user.fullName} will be able to sign in again.`,
      label: active ? 'Deactivate' : 'Activate',
      danger: active,
    },
    delete: { title: 'Delete this resident?', message: `${user.fullName}'s account and requests will be removed and their bed released. This cannot be undone.`, label: 'Delete resident', danger: true },
  }[modal];

  return (
    <>
      <PageHeader
        title={user.fullName}
        subtitle={`@${user.username}`}
        back={{ to: '/admin/users', label: 'Residents' }}
        actions={
          <>
            <Button variant="secondary" icon="edit" onClick={() => setModal('edit')}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setModal('toggle')}>
              {active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="danger-ghost" icon="trash" onClick={() => setModal('delete')}>
              Delete
            </Button>
          </>
        }
      />
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h3>Profile</h3>
            <StatusBadge value={user.status} />
          </div>
          <DetailList
            items={[
              { label: 'Full name', value: user.fullName },
              { label: 'Username', value: `@${user.username}` },
              { label: 'Date of birth', value: formatDate(user.dob) },
              { label: 'Gender', value: user.gender },
              { label: 'Phone', value: user.phone },
              { label: 'Requested room type', value: user.roomType },
              { label: 'Registered', value: formatDate(user.createdAt) },
            ]}
          />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Room</h3>
            {room && <Link to={`/admin/rooms/${room._id}`}>Open room</Link>}
          </div>
          {room ? (
            <div className="room-summary">
              <RoomTag number={room.roomNumber} large />
              <BedMeter capacity={room.capacity} occupancy={room.occupancy} />
              <DetailList
                items={[
                  { label: 'Room type', value: room.roomType },
                  { label: 'Floor', value: room.floor },
                ]}
              />
              <div className="form-actions form-actions-start">
                <Button variant="secondary" icon="swap" onClick={() => setModal('assign')}>
                  Change room
                </Button>
                <Button variant="danger-ghost" onClick={() => setModal('remove')}>
                  Remove from room
                </Button>
              </div>
            </div>
          ) : (
            <div className="empty empty-inline">
              <h4>No room assigned</h4>
              <p className="muted-text">This resident asked for a {user.roomType} room.</p>
              <Button onClick={() => setModal('assign')}>Assign room</Button>
            </div>
          )}
        </section>
      </div>

      <section className="section">
        <div className="panel-head">
          <h3>Requests from {user.fullName.split(' ')[0]}</h3>
        </div>
        <RequestTable requests={data.requests || []} basePath="/admin/requests" emptyTitle="No requests from this resident" />
      </section>

      {modal === 'edit' && <EditUserModal user={user} onClose={close} onSaved={done} />}
      {modal === 'assign' && <AssignRoomModal user={user} onClose={close} onDone={done} />}
      <ConfirmDialog
        open={Boolean(copy)}
        danger={copy?.danger}
        title={copy?.title}
        message={copy?.message}
        confirmLabel={copy?.label}
        loading={busy}
        onConfirm={run}
        onCancel={close}
      />
    </>
  );
}

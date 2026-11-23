import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, FormField, Loader, PageHeader } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { validateRoom } from '../../utils/validators.js';
import { ACTIVE_STATES, FIXED_CAPACITY, ROOM_TYPES } from '../../utils/constants.js';
import { errMsg, fieldErrors } from '../../utils/format.js';

// One form for both "Add room" and "Edit room".
export default function RoomForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm({ roomNumber: '', floor: '', roomType: '', capacity: '', status: 'active' });
  const { values, errors } = form;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, error: loadError } = useFetch(
    () => (isEdit ? adminService.room(id) : Promise.resolve({ data: null })),
    [id]
  );
  const room = data?.room;
  const occupancy = room?.occupancy || 0;

  useEffect(() => {
    if (room) {
      form.setValues({
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomType: room.roomType,
        capacity: room.capacity,
        status: room.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const fixed = FIXED_CAPACITY[values.roomType];

  const onTypeChange = (e) => {
    form.handleChange(e);
    const next = FIXED_CAPACITY[e.target.value];
    if (next) form.setField('capacity', next);
    else if (Number(values.capacity) < 4) form.setField('capacity', '');
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRoom(values, { occupancy });
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError('');
    const payload = {
      roomNumber: String(values.roomNumber).trim(),
      floor: Number(values.floor),
      roomType: values.roomType,
      capacity: Number(values.capacity),
      status: values.status,
    };
    try {
      if (isEdit) await adminService.updateRoom(id, payload);
      else await adminService.createRoom(payload);
      toast.success(isEdit ? 'Room updated' : 'Room added');
      navigate(isEdit ? `/admin/rooms/${id}` : '/admin/rooms', { replace: true });
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loading && !room) return <Loader />;

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit room ${room?.roomNumber || ''}` : 'Add room'}
        subtitle={isEdit ? 'Change the room details. Occupancy is managed through allocation.' : 'Create a room so residents can be assigned to it.'}
        back={{ to: isEdit ? `/admin/rooms/${id}` : '/admin/rooms', label: isEdit ? 'Room details' : 'Rooms' }}
      />
      <section className="panel panel-narrow">
        <form onSubmit={submit} noValidate className="form">
          <Alert>{error || loadError}</Alert>
          <div className="grid-2">
            <FormField label="Room number" name="roomNumber" required maxLength={10} placeholder="e.g. 204" value={values.roomNumber} onChange={form.handleChange} error={errors.roomNumber} />
            <FormField label="Floor" name="floor" type="number" min={0} max={50} required value={values.floor} onChange={form.handleChange} error={errors.floor} />
          </div>
          <FormField
            label="Room type"
            name="roomType"
            as="select"
            options={ROOM_TYPES}
            required
            disabled={occupancy > 0}
            hint={occupancy > 0 ? 'Room type is locked while residents are assigned.' : undefined}
            value={values.roomType}
            onChange={onTypeChange}
            error={errors.roomType}
          />
          <div className="grid-2">
            <FormField
              label="Capacity (beds)"
              name="capacity"
              type="number"
              min={Math.max(1, occupancy)}
              required
              disabled={Boolean(fixed)}
              hint={
                fixed
                  ? `Fixed at ${fixed} for ${values.roomType}.`
                  : values.roomType === 'More Than 3 Sharing'
                  ? 'Enter the exact number of beds (4 or more).'
                  : 'Pick a room type first.'
              }
              value={values.capacity}
              onChange={form.handleChange}
              error={errors.capacity}
            />
            <FormField label="Room status" name="status" as="select" options={ACTIVE_STATES} required hint="Inactive rooms cannot receive new residents." value={values.status} onChange={form.handleChange} error={errors.status} />
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? 'Save changes' : 'Add room'}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}

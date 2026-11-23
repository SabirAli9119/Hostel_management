import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, ConfirmDialog, DetailList, FormField, Loader, Modal, PageHeader, StatusBadge, Timeline } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import * as requestService from '../../services/requestService.js';
import { validateRequest } from '../../utils/validators.js';
import { PRIORITIES, REQUEST_CATEGORIES } from '../../utils/constants.js';
import { errMsg, fieldErrors, formatDateTime } from '../../utils/format.js';

function EditRequestModal({ request, onClose, onSaved }) {
  const toast = useToast();
  const form = useForm({
    title: request.title,
    category: request.category,
    priority: request.priority,
    description: request.description,
  });
  const { values, errors } = form;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRequest(values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError('');
    try {
      await requestService.update(request._id, {
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
      toast.success('Request updated');
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
      title="Edit request"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-request-form" loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-request-form" onSubmit={submit} noValidate className="form">
        <Alert>{error}</Alert>
        <FormField label="Title" name="title" required maxLength={100} value={values.title} onChange={form.handleChange} error={errors.title} />
        <div className="grid-2">
          <FormField label="Category" name="category" as="select" options={REQUEST_CATEGORIES} required value={values.category} onChange={form.handleChange} error={errors.category} />
          <FormField label="Priority" name="priority" as="select" options={PRIORITIES} required value={values.priority} onChange={form.handleChange} error={errors.priority} />
        </div>
        <FormField label="Description" name="description" as="textarea" required maxLength={1000} hint={`${values.description.length}/1000 characters`} value={values.description} onChange={form.handleChange} error={errors.description} />
      </form>
    </Modal>
  );
}

export default function UserRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => requestService.get(id), [id]);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const request = data?.request;

  const cancel = async () => {
    setCancelling(true);
    try {
      await requestService.cancel(id);
      toast.success('Request cancelled');
      navigate('/user/requests', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
      setCancelling(false);
      setConfirming(false);
    }
  };

  if (loading && !request) return <Loader />;
  if (!request)
    return (
      <>
        <PageHeader title="Request" back={{ to: '/user/requests', label: 'My requests' }} />
        <Alert>{error || 'This request could not be found.'}</Alert>
      </>
    );

  return (
    <>
      <PageHeader
        title={request.title}
        back={{ to: '/user/requests', label: 'My requests' }}
        actions={
          request.status === 'Pending' && (
            <>
              <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger-ghost" icon="trash" onClick={() => setConfirming(true)}>
                Cancel request
              </Button>
            </>
          )
        }
      />
      <div className="two-col two-col-wide">
        <section className="panel">
          <div className="panel-head">
            <h3>Details</h3>
            <StatusBadge value={request.status} />
          </div>
          <DetailList
            items={[
              { label: 'Category', value: request.category },
              { label: 'Priority', value: <StatusBadge value={request.priority} /> },
              { label: 'Submitted', value: formatDateTime(request.createdAt) },
              { label: 'Resolved', value: request.resolvedAt ? formatDateTime(request.resolvedAt) : null },
            ]}
          />
          <h4 className="sub-head">Description</h4>
          <p className="prose">{request.description}</p>

          <h4 className="sub-head">Warden response</h4>
          {request.status === 'Rejected' && request.rejectionReason && (
            <Alert type="error">
              <strong>Rejected:</strong> {request.rejectionReason}
            </Alert>
          )}
          {request.adminResponse ? (
            <p className="prose response-box">{request.adminResponse}</p>
          ) : (
            request.status !== 'Rejected' && <p className="muted-text">No response yet. You will see it here once the warden replies.</p>
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Progress</h3>
          </div>
          <Timeline items={request.history?.length ? request.history : [{ status: request.status, at: request.createdAt }]} />
        </section>
      </div>
      {editing && (
        <EditRequestModal
          request={request}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            reload();
          }}
        />
      )}
      <ConfirmDialog
        open={confirming}
        danger
        title="Cancel this request?"
        message="The request will be removed and the warden will no longer see it. This cannot be undone."
        confirmLabel="Cancel request"
        loading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, DetailList, FormField, Loader, PageHeader, StatusBadge, Timeline } from '../../components/index.js';
import useFetch from '../../hooks/useFetch.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import * as adminService from '../../services/adminService.js';
import { REQUEST_STATUSES } from '../../utils/constants.js';
import { errMsg, fieldErrors, formatDateTime } from '../../utils/format.js';

export default function AdminRequestDetails() {
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => adminService.request(id), [id]);
  const form = useForm({ status: '', adminResponse: '', rejectionReason: '' });
  const { values, errors } = form;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const request = data?.request;

  useEffect(() => {
    if (request) {
      form.setValues({
        status: request.status,
        adminResponse: request.adminResponse || '',
        rejectionReason: request.rejectionReason || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.status) errs.status = 'Select a status';
    if (values.status === 'Rejected' && !values.rejectionReason.trim()) errs.rejectionReason = 'Give the resident a reason for rejecting';
    if (values.adminResponse.length > 1000) errs.adminResponse = 'Response must be 1000 characters or fewer';
    form.setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setSaveError('');
    try {
      await adminService.updateRequest(id, {
        status: values.status,
        adminResponse: values.adminResponse.trim(),
        rejectionReason: values.status === 'Rejected' ? values.rejectionReason.trim() : '',
      });
      toast.success('Request updated');
      reload();
    } catch (err) {
      setSaveError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !request) return <Loader />;
  if (!request)
    return (
      <>
        <PageHeader title="Request" back={{ to: '/admin/requests', label: 'Requests' }} />
        <Alert>{error || 'This request could not be found.'}</Alert>
      </>
    );

  return (
    <>
      <PageHeader title={request.title} back={{ to: '/admin/requests', label: 'Requests' }} />
      <div className="two-col two-col-wide">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h3>Details</h3>
              <StatusBadge value={request.status} />
            </div>
            <DetailList
              items={[
                {
                  label: 'Resident',
                  value: request.user ? (
                    <Link to={`/admin/users/${request.user._id}`}>
                      {request.user.fullName} (@{request.user.username})
                    </Link>
                  ) : null,
                },
                { label: 'Category', value: request.category },
                { label: 'Priority', value: <StatusBadge value={request.priority} /> },
                { label: 'Submitted', value: formatDateTime(request.createdAt) },
                { label: 'Resolved', value: request.resolvedAt ? formatDateTime(request.resolvedAt) : null },
              ]}
            />
            <h4 className="sub-head">Description</h4>
            <p className="prose">{request.description}</p>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3>Respond</h3>
            </div>
            <form onSubmit={submit} noValidate className="form">
              <Alert>{saveError}</Alert>
              <div className="quick-actions">
                <Button variant="secondary" size="sm" onClick={() => form.setField('status', 'In Progress')}>
                  Start work
                </Button>
                <Button variant="secondary" size="sm" onClick={() => form.setField('status', 'Resolved')}>
                  Mark resolved
                </Button>
              </div>
              <FormField label="Status" name="status" as="select" options={REQUEST_STATUSES} required value={values.status} onChange={form.handleChange} error={errors.status} />
              <FormField label="Response to the resident" name="adminResponse" as="textarea" rows={4} maxLength={1000} hint={`${values.adminResponse.length}/1000 characters`} value={values.adminResponse} onChange={form.handleChange} error={errors.adminResponse} />
              {values.status === 'Rejected' && (
                <FormField label="Reason for rejecting" name="rejectionReason" as="textarea" rows={3} required maxLength={500} value={values.rejectionReason} onChange={form.handleChange} error={errors.rejectionReason} />
              )}
              <div className="form-actions">
                <Button type="submit" loading={saving}>
                  Save update
                </Button>
              </div>
            </form>
          </section>
        </div>

        <section className="panel">
          <div className="panel-head">
            <h3>History</h3>
          </div>
          <Timeline items={request.history?.length ? request.history : [{ status: request.status, at: request.createdAt }]} />
        </section>
      </div>
    </>
  );
}

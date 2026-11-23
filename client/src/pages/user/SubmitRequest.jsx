import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, FormField, PageHeader } from '../../components/index.js';
import useForm from '../../hooks/useForm.js';
import useToast from '../../hooks/useToast.js';
import * as requestService from '../../services/requestService.js';
import { validateRequest } from '../../utils/validators.js';
import { PRIORITIES, REQUEST_CATEGORIES } from '../../utils/constants.js';
import { errMsg, fieldErrors } from '../../utils/format.js';

export default function SubmitRequest() {
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm({ title: '', category: '', priority: 'Medium', description: '' });
  const { values, errors } = form;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRequest(values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await requestService.create({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
      });
      toast.success('Request submitted');
      navigate(`/user/requests/${data.request._id}`, { replace: true });
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New request"
        subtitle="Tell the warden what needs attention. You can follow the status from My requests."
        back={{ to: '/user/requests', label: 'My requests' }}
      />
      <section className="panel panel-narrow">
        <form onSubmit={submit} noValidate className="form">
          <Alert>{error}</Alert>
          <FormField label="Title" name="title" required maxLength={100} placeholder="e.g. Ceiling fan makes a grinding noise" value={values.title} onChange={form.handleChange} error={errors.title} />
          <div className="grid-2">
            <FormField label="Category" name="category" as="select" options={REQUEST_CATEGORIES} required value={values.category} onChange={form.handleChange} error={errors.category} />
            <FormField label="Priority" name="priority" as="select" options={PRIORITIES} required value={values.priority} onChange={form.handleChange} error={errors.priority} />
          </div>
          <FormField
            label="Description"
            name="description"
            as="textarea"
            required
            maxLength={1000}
            placeholder="What is wrong, where, and since when?"
            hint={`${values.description.length}/1000 characters`}
            value={values.description}
            onChange={form.handleChange}
            error={errors.description}
          />
          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate('/user/requests')} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit request
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}

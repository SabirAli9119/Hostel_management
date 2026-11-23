import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Alert, Button, FormField } from '../../components/index.js';
import useForm from '../../hooks/useForm.js';
import * as authService from '../../services/authService.js';
import { validateReset } from '../../utils/validators.js';
import { errMsg, fieldErrors } from '../../utils/format.js';

const today = new Date().toISOString().slice(0, 10);

export default function ResetPassword() {
  const navigate = useNavigate();
  const form = useForm({ username: '', dob: '', newPassword: '', confirmPassword: '' });
  const { values, errors } = form;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateReset(values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setError('');
    try {
      await authService.resetPassword({ ...values, username: values.username.trim() });
      navigate('/login', { replace: true, state: { reset: true } });
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Confirm your username and date of birth, then choose a new password."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <form onSubmit={submit} noValidate className="form">
        <Alert>{error}</Alert>
        <FormField label="Username" name="username" required autoComplete="username" value={values.username} onChange={form.handleChange} error={errors.username} />
        <FormField label="Date of birth" name="dob" type="date" required max={today} value={values.dob} onChange={form.handleChange} error={errors.dob} />
        <FormField label="New password" name="newPassword" type="password" required autoComplete="new-password" hint="8+ characters with upper case, lower case and a number." value={values.newPassword} onChange={form.handleChange} error={errors.newPassword} />
        <FormField label="Confirm new password" name="confirmPassword" type="password" required autoComplete="new-password" value={values.confirmPassword} onChange={form.handleChange} error={errors.confirmPassword} />
        <Button type="submit" size="lg" loading={submitting}>
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}

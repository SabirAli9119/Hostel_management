import { useState } from 'react';
import FormField from './FormField.jsx';
import Button from './Button.jsx';
import Alert from './Alert.jsx';
import useForm from '../hooks/useForm.js';
import useToast from '../hooks/useToast.js';
import * as authService from '../services/authService.js';
import { validateChangePassword } from '../utils/validators.js';
import { errMsg, fieldErrors } from '../utils/format.js';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordForm() {
  const toast = useToast();
  const form = useForm(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateChangePassword(form.values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError('');
    try {
      await authService.changePassword(form.values);
      toast.success('Password updated');
      form.reset(EMPTY);
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="form">
      <Alert>{error}</Alert>
      <FormField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={form.values.currentPassword}
        onChange={form.handleChange}
        error={form.errors.currentPassword}
      />
      <FormField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters with upper case, lower case and a number."
        value={form.values.newPassword}
        onChange={form.handleChange}
        error={form.errors.newPassword}
      />
      <FormField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={form.values.confirmPassword}
        onChange={form.handleChange}
        error={form.errors.confirmPassword}
      />
      <div className="form-actions">
        <Button type="submit" loading={saving}>
          Update password
        </Button>
      </div>
    </form>
  );
}

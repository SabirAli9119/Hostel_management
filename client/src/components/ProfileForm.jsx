import { useState } from 'react';
import FormField from './FormField.jsx';
import Button from './Button.jsx';
import Alert from './Alert.jsx';
import useAuth from '../hooks/useAuth.js';
import useForm from '../hooks/useForm.js';
import useToast from '../hooks/useToast.js';
import * as userService from '../services/userService.js';
import { validateProfile } from '../utils/validators.js';
import { GENDERS } from '../utils/constants.js';
import { errMsg, fieldErrors } from '../utils/format.js';

export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const form = useForm({ fullName: user.fullName, phone: user.phone, gender: user.gender });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateProfile(form.values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await userService.updateProfile({
        fullName: form.values.fullName.trim(),
        phone: form.values.phone.trim(),
        gender: form.values.gender,
      });
      setUser(data.user);
      toast.success('Profile saved');
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
      <FormField label="Full name" name="fullName" required value={form.values.fullName} onChange={form.handleChange} error={form.errors.fullName} />
      <div className="grid-2">
        <FormField label="Phone number" name="phone" type="tel" required value={form.values.phone} onChange={form.handleChange} error={form.errors.phone} />
        <FormField label="Gender" name="gender" as="select" options={GENDERS} required value={form.values.gender} onChange={form.handleChange} error={form.errors.gender} />
      </div>
      <div className="form-actions">
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

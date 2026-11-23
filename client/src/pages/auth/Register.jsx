import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Alert, Button, FormField } from '../../components/index.js';
import useForm from '../../hooks/useForm.js';
import * as authService from '../../services/authService.js';
import { validateRegister } from '../../utils/validators.js';
import { GENDERS, ROOM_TYPES } from '../../utils/constants.js';
import { errMsg, fieldErrors } from '../../utils/format.js';

const today = new Date().toISOString().slice(0, 10);

export default function Register() {
  const navigate = useNavigate();
  const form = useForm({
    fullName: '',
    username: '',
    dob: '',
    gender: '',
    phone: '',
    roomType: '',
    password: '',
    confirmPassword: '',
  });
  const { values, errors } = form;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(values);
    form.setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setError('');
    try {
      await authService.register({
        ...values,
        fullName: values.fullName.trim(),
        username: values.username.trim(),
        phone: values.phone.trim(),
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      setError(errMsg(err));
      form.setErrors(fieldErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="The warden assigns your room after you register."
      footer={
        <>
          Already registered? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form">
        <Alert>{error}</Alert>
        <FormField label="Full name" name="fullName" required autoComplete="name" value={values.fullName} onChange={form.handleChange} error={errors.fullName} />
        <div className="grid-2">
          <FormField label="Username" name="username" required autoComplete="username" value={values.username} onChange={form.handleChange} error={errors.username} />
          <FormField label="Phone number" name="phone" type="tel" required autoComplete="tel" value={values.phone} onChange={form.handleChange} error={errors.phone} />
        </div>
        <div className="grid-2">
          <FormField label="Date of birth" name="dob" type="date" required max={today} hint="You will need this to reset your password." value={values.dob} onChange={form.handleChange} error={errors.dob} />
          <FormField label="Gender" name="gender" as="select" options={GENDERS} required value={values.gender} onChange={form.handleChange} error={errors.gender} />
        </div>
        <FormField label="Room type" name="roomType" as="select" options={ROOM_TYPES} required value={values.roomType} onChange={form.handleChange} error={errors.roomType} />
        <div className="grid-2">
          <FormField label="Password" name="password" type="password" required autoComplete="new-password" hint="8+ characters with upper case, lower case and a number." value={values.password} onChange={form.handleChange} error={errors.password} />
          <FormField label="Confirm password" name="confirmPassword" type="password" required autoComplete="new-password" value={values.confirmPassword} onChange={form.handleChange} error={errors.confirmPassword} />
        </div>
        <Button type="submit" size="lg" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

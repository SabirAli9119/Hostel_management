import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import { Alert, Button, FormField } from '../../components/index.js';
import useAuth from '../../hooks/useAuth.js';
import useForm from '../../hooks/useForm.js';
import { errMsg } from '../../utils/format.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, errors, setErrors, handleChange } = useForm({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const notice = location.state?.registered
    ? 'Account created. Sign in to continue.'
    : location.state?.reset
    ? 'Password updated. Sign in with your new password.'
    : '';

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.username.trim()) errs.username = 'Enter your username';
    if (!values.password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setError('');
    try {
      const user = await login({ username: values.username.trim(), password: values.password });
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use the username you registered with."
      footer={
        <>
          New resident? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="form">
        <Alert type="success">{notice}</Alert>
        <Alert>{error}</Alert>
        <FormField label="Username" name="username" autoComplete="username" value={values.username} onChange={handleChange} error={errors.username} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} />
        <div className="form-row-end">
          <Link to="/reset-password">Forgot your password?</Link>
        </div>
        <Button type="submit" size="lg" loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

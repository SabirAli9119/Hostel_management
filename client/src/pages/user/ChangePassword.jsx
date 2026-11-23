import { ChangePasswordForm, PageHeader } from '../../components/index.js';

export default function ChangePassword() {
  return (
    <>
      <PageHeader title="Change password" subtitle="Choose a new password for your account." />
      <section className="panel panel-narrow">
        <ChangePasswordForm />
      </section>
    </>
  );
}

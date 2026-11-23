import { ChangePasswordForm, DetailList, PageHeader, ProfileForm } from '../../components/index.js';
import useAuth from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/format.js';

export default function AdminProfile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Admin profile" subtitle="Your details and sign-in security." />
      <div className="two-col">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h3>Account</h3>
            </div>
            <DetailList
              items={[
                { label: 'Username', value: `@${user.username}` },
                { label: 'Role', value: 'Administrator' },
                { label: 'Created', value: formatDate(user.createdAt) },
              ]}
            />
          </section>
          <section className="panel">
            <div className="panel-head">
              <h3>Edit details</h3>
            </div>
            <ProfileForm />
          </section>
        </div>
        <section className="panel">
          <div className="panel-head">
            <h3>Change password</h3>
          </div>
          <ChangePasswordForm />
        </section>
      </div>
    </>
  );
}

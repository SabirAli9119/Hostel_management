import { DetailList, PageHeader, ProfileForm, StatusBadge } from '../../components/index.js';
import useAuth from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/format.js';

export default function UserProfile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Profile" subtitle="Update your contact details. Other details are managed by the warden." />
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h3>Edit details</h3>
          </div>
          <ProfileForm />
        </section>
        <section className="panel">
          <div className="panel-head">
            <h3>Account details</h3>
          </div>
          <DetailList
            items={[
              { label: 'Username', value: `@${user.username}` },
              { label: 'Date of birth', value: formatDate(user.dob) },
              { label: 'Requested room type', value: user.roomType },
              { label: 'Account status', value: <StatusBadge value={user.status} /> },
              { label: 'Member since', value: formatDate(user.createdAt) },
            ]}
          />
          <p className="muted-text pad-top">To change your date of birth or room type, ask the warden.</p>
        </section>
      </div>
    </>
  );
}

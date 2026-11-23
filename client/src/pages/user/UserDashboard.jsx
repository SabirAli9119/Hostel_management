import { Link } from 'react-router-dom';
import { Alert, BedMeter, DetailList, PageHeader, RequestTable, RoomTag, StatCard, StatusBadge } from '../../components/index.js';
import useAuth from '../../hooks/useAuth.js';
import useFetch from '../../hooks/useFetch.js';
import * as userService from '../../services/userService.js';

export default function UserDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => userService.getDashboard(), []);
  const stats = data?.stats || {};
  const room = user.assignedRoom;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.fullName.split(' ')[0]}`}
        subtitle="Your room, requests and account at a glance."
        actions={
          <Link to="/user/requests/new" className="btn btn-primary btn-md">
            New request
          </Link>
        }
      />
      <Alert>{error}</Alert>

      <div className="stat-grid">
        <StatCard label="Total requests" value={stats.totalRequests} to="/user/requests" />
        <StatCard label="Pending requests" value={stats.pendingRequests} tone="warning" />
        <StatCard label="Resolved requests" value={stats.resolvedRequests} tone="success" />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h3>Your room</h3>
            {room && <Link to="/user/room">Room details</Link>}
          </div>
          {room ? (
            <div className="room-summary">
              <RoomTag number={room.roomNumber} large />
              <BedMeter capacity={room.capacity} occupancy={room.occupancy} />
              <DetailList
                items={[
                  { label: 'Room type', value: room.roomType },
                  { label: 'Floor', value: room.floor },
                  { label: 'Capacity', value: `${room.capacity} beds` },
                  { label: 'Occupancy', value: `${room.occupancy} of ${room.capacity} beds filled` },
                ]}
              />
            </div>
          ) : (
            <div className="empty empty-inline">
              <h4>No room assigned yet</h4>
              <p className="muted-text">
                The warden will assign you a {user.roomType} room. You will see it here as soon as it is done.
              </p>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Your account</h3>
            <Link to="/user/profile">Edit profile</Link>
          </div>
          <DetailList
            items={[
              { label: 'Name', value: user.fullName },
              { label: 'Username', value: `@${user.username}` },
              { label: 'Requested room type', value: user.roomType },
              { label: 'Account status', value: <StatusBadge value={user.status} /> },
            ]}
          />
        </section>
      </div>

      <section className="section">
        <div className="panel-head">
          <h3>Recent requests</h3>
          <Link to="/user/requests">View all</Link>
        </div>
        <RequestTable
          requests={data?.recentRequests || []}
          loading={loading}
          basePath="/user/requests"
          emptyTitle="No requests yet"
          emptyText="Use New request to tell the warden about a problem."
        />
      </section>
    </>
  );
}

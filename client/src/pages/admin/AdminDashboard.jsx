import { Alert, Loader, PageHeader, RequestTable, StatCard } from '../../components/index.js';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch.js';
import * as adminService from '../../services/adminService.js';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch(() => adminService.dashboard(), []);
  const s = data?.stats;
  const utilisation = s && s.totalBeds ? Math.round((s.occupiedBeds / s.totalBeds) * 100) : 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Occupancy, residents and open requests across the hostel." />
      <Alert>{error}</Alert>
      {loading && !s && <Loader />}
      {s && (
        <>
          <section className="section">
            <h3 className="section-title">Residents</h3>
            <div className="stat-grid">
              <StatCard label="Total residents" value={s.totalUsers} to="/admin/users" />
              <StatCard label="Active" value={s.activeUsers} tone="success" to="/admin/users?status=active" />
              <StatCard label="Inactive" value={s.inactiveUsers} tone="muted" to="/admin/users?status=inactive" />
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">Rooms and beds</h3>
            <div className="stat-grid stat-grid-3">
              <StatCard label="Total rooms" value={s.totalRooms} to="/admin/rooms" />
              <StatCard label="Occupied rooms" value={s.occupiedRooms} />
              <StatCard label="Available rooms" value={s.availableRooms} tone="success" />
              <StatCard label="Total beds" value={s.totalBeds} />
              <StatCard label="Occupied beds" value={s.occupiedBeds} />
              <StatCard label="Available beds" value={s.availableBeds} tone="success" />
            </div>
            <div className="panel utilisation">
              <div className="panel-head">
                <h3>Bed utilisation</h3>
                <strong>{utilisation}%</strong>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={utilisation} aria-valuemin={0} aria-valuemax={100} aria-label="Bed utilisation">
                <span style={{ width: `${utilisation}%` }} />
              </div>
              <p className="muted-text">
                {s.occupiedBeds} of {s.totalBeds} beds are filled.
              </p>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">Requests</h3>
            <div className="stat-grid stat-grid-5">
              <StatCard label="Total" value={s.totalRequests} to="/admin/requests" />
              <StatCard label="Pending" value={s.pendingRequests} tone="warning" to="/admin/requests?status=Pending" />
              <StatCard label="In progress" value={s.inProgressRequests} tone="info" to="/admin/requests?status=In%20Progress" />
              <StatCard label="Resolved" value={s.resolvedRequests} tone="success" to="/admin/requests?status=Resolved" />
              <StatCard label="Rejected" value={s.rejectedRequests} tone="danger" to="/admin/requests?status=Rejected" />
            </div>
          </section>

          <section className="section">
            <div className="panel-head">
              <h3>Latest requests</h3>
              <Link to="/admin/requests">View all</Link>
            </div>
            <RequestTable requests={data.recentRequests || []} basePath="/admin/requests" showUser emptyTitle="No requests yet" />
          </section>
        </>
      )}
    </>
  );
}

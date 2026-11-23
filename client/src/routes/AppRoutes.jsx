import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute, { homeFor } from './ProtectedRoute.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/Loader.jsx';
import useAuth from '../hooks/useAuth.js';

import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import NotFound from '../pages/NotFound.jsx';

import UserDashboard from '../pages/user/UserDashboard.jsx';
import UserProfile from '../pages/user/UserProfile.jsx';
import RoomDetails from '../pages/user/RoomDetails.jsx';
import SubmitRequest from '../pages/user/SubmitRequest.jsx';
import MyRequests from '../pages/user/MyRequests.jsx';
import UserRequestDetails from '../pages/user/UserRequestDetails.jsx';
import ChangePassword from '../pages/user/ChangePassword.jsx';

import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import UserDetails from '../pages/admin/UserDetails.jsx';
import ManageRooms from '../pages/admin/ManageRooms.jsx';
import RoomForm from '../pages/admin/RoomForm.jsx';
import AdminRoomDetails from '../pages/admin/AdminRoomDetails.jsx';
import RoomAllocation from '../pages/admin/RoomAllocation.jsx';
import ManageRequests from '../pages/admin/ManageRequests.jsx';
import AdminRequestDetails from '../pages/admin/AdminRequestDetails.jsx';
import AdminProfile from '../pages/admin/AdminProfile.jsx';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return <Navigate to={user ? homeFor(user) : '/login'} replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />

      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/room" element={<RoomDetails />} />
          <Route path="/user/requests/new" element={<SubmitRequest />} />
          <Route path="/user/requests" element={<MyRequests />} />
          <Route path="/user/requests/:id" element={<UserRequestDetails />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/rooms" element={<ManageRooms />} />
          <Route path="/admin/rooms/new" element={<RoomForm />} />
          <Route path="/admin/rooms/:id" element={<AdminRoomDetails />} />
          <Route path="/admin/rooms/:id/edit" element={<RoomForm />} />
          <Route path="/admin/allocation" element={<RoomAllocation />} />
          <Route path="/admin/requests" element={<ManageRequests />} />
          <Route path="/admin/requests/:id" element={<AdminRequestDetails />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

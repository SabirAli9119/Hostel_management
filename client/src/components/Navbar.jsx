import Icon from './Icon.jsx';
import RoomTag from './RoomTag.jsx';
import { initials } from '../utils/format.js';

export default function Navbar({ user, onMenu }) {
  const isAdmin = user.role === 'admin';
  return (
    <header className="navbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <span className="navbar-title">{isAdmin ? 'Admin console' : 'Resident portal'}</span>
      <div className="navbar-right">
        {!isAdmin && user.assignedRoom && (
          <span className="navbar-room">
            Room <RoomTag number={user.assignedRoom.roomNumber} />
          </span>
        )}
        <span className="avatar" aria-hidden="true">
          {initials(user.fullName)}
        </span>
        <span className="navbar-name">{user.fullName}</span>
      </div>
    </header>
  );
}

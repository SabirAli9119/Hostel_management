import { NavLink } from 'react-router-dom';
import Brand from './Brand.jsx';
import Icon from './Icon.jsx';

export default function Sidebar({ nav, open, onClose, onLogout, user }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-top">
          <Brand light />
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon name="x" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-user">
            <strong>{user.fullName}</strong>
            <span>{user.role === 'admin' ? 'Administrator' : 'Resident'}</span>
          </div>
          <button type="button" className="nav-link nav-logout" onClick={onLogout}>
            <Icon name="logout" size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

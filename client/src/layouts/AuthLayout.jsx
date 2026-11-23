import Brand from '../components/Brand.jsx';
import RoomTag from '../components/RoomTag.jsx';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <Brand light />
        <div className="auth-copy">
          <h1>Rooms, residents and requests in one place.</h1>
          <p>
            Residents see their room and follow every request. Wardens allocate beds without
            double-booking a single one.
          </p>
        </div>
        <div className="keyrack" aria-hidden="true">
          {['101', '102', '103', '204', '205', '206'].map((n) => (
            <RoomTag key={n} number={n} large />
          ))}
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-brand-mobile">
            <Brand />
          </div>
          <h2>{title}</h2>
          <p className="muted-text">{subtitle}</p>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

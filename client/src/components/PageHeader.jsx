import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function PageHeader({ title, subtitle, actions, back }) {
  return (
    <header className="page-header">
      <div>
        {back && (
          <Link to={back.to} className="back-link">
            <Icon name="arrowLeft" size={16} /> {back.label}
          </Link>
        )}
        <h1>{title}</h1>
        {subtitle && <p className="muted-text">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

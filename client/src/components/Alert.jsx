import Icon from './Icon.jsx';

export default function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;
  const icon = type === 'success' ? 'check' : type === 'info' ? 'info' : 'alert';
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <div className="alert-body">{children}</div>
      {onClose && (
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}

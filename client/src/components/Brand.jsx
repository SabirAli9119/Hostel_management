import Icon from './Icon.jsx';

export default function Brand({ light = false }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark">
        <Icon name="key" size={18} />
      </span>
      <span>Hostel Desk</span>
    </span>
  );
}

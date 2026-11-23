import Icon from './Icon.jsx';

export default function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="search">
      <Icon name="search" size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

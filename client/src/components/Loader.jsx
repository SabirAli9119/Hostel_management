export default function Loader({ label = 'Loading…', fullPage = false }) {
  return (
    <div className={`loader ${fullPage ? 'loader-page' : ''}`} role="status">
      <span className="spinner" />
      <span className="muted-text">{label}</span>
    </div>
  );
}

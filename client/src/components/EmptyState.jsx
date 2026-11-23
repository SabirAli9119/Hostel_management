export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <h4>{title}</h4>
      {text && <p className="muted-text">{text}</p>}
      {action}
    </div>
  );
}

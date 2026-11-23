export default function DetailList({ items }) {
  return (
    <dl className="dl">
      {items.map((i) => (
        <div key={i.label}>
          <dt>{i.label}</dt>
          <dd>{i.value || i.value === 0 ? i.value : '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

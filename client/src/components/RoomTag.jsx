export default function RoomTag({ number, large = false }) {
  return <span className={`keytag ${large ? 'keytag-lg' : ''}`}>{number}</span>;
}

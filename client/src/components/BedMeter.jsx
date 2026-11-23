export default function BedMeter({ capacity = 0, occupancy = 0, showText = true }) {
  return (
    <div className="bedmeter" role="img" aria-label={`${occupancy} of ${capacity} beds occupied`}>
      <div className="beds">
        {Array.from({ length: capacity }).map((_, i) => (
          <span key={i} className={`bed ${i < occupancy ? 'filled' : ''}`} />
        ))}
      </div>
      {showText && (
        <span className="bedmeter-text">
          {occupancy}/{capacity}
        </span>
      )}
    </div>
  );
}

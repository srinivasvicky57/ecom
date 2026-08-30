const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function AboutMandala() {
  return (
    <svg viewBox="0 0 200 200" className="mandala-svg">
      <defs>
        <linearGradient id="mandalaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--kk-deep-red)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--kk-mustard)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--kk-indigo)" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" stroke="var(--kk-mustard)" strokeWidth="0.5" fill="none" opacity="0.3" />
      <circle cx="100" cy="100" r="80" stroke="var(--kk-deep-red)" strokeWidth="0.5" fill="none" opacity="0.2" />
      <circle cx="100" cy="100" r="65" stroke="var(--kk-mustard)" strokeWidth="0.5" fill="none" opacity="0.3" />
      {PETAL_ANGLES.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 100 100)`}>
          <path d="M100 20 C105 40, 115 50, 100 70 C85 50, 95 40, 100 20Z" fill="url(#mandalaGrad)" />
        </g>
      ))}
      <circle cx="100" cy="100" r="15" fill="var(--kk-mustard)" opacity="0.15" stroke="var(--kk-mustard)" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="100" cy="100" r="5" fill="var(--kk-deep-red)" opacity="0.3" />
    </svg>
  );
}

export default AboutMandala;

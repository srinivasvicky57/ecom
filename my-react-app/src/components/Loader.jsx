/**
 * Kalamkari-themed page loader / spinner.
 * Usage: <Loader /> or <Loader message="Loading products…" />
 */
function Loader({ message = 'Loading…' }) {
  return (
    <div className="kk-loader-overlay">
      <div className="kk-loader-content">
        {/* Ornamental spinning mandala ring */}
        <div className="kk-loader-spinner">
          <svg viewBox="0 0 80 80" width="72" height="72" className="kk-loader-svg">
            {/* Outer ring */}
            <circle cx="40" cy="40" r="36" fill="none" stroke="#c8933e" strokeWidth="3" strokeDasharray="170 56" strokeLinecap="round" className="kk-loader-ring" />
            {/* Inner ring */}
            <circle cx="40" cy="40" r="24" fill="none" stroke="#8B1A1A" strokeWidth="2.5" strokeDasharray="100 50" strokeLinecap="round" className="kk-loader-ring-inner" />
            {/* Center dot */}
            <circle cx="40" cy="40" r="4" fill="#c8933e" />
          </svg>
        </div>
        <p className="kk-loader-text">{message}</p>
      </div>
    </div>
  );
}

export default Loader;

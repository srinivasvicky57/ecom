import { useState, useRef, useEffect, useCallback } from 'react';

function CustomDropdown({ label, value, placeholder, options, onSelect, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) close(); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open, close]);

  const activeOption = options.find((o) => o.value === value);
  const displayText = activeOption ? activeOption.label : placeholder;

  return (
    <div className={`pp-dropdown ${open ? 'pp-dropdown--open' : ''} ${className || ''}`} ref={ref}>
      {label && <span className="pp-dropdown-label">{label}</span>}
      <button type="button" className="pp-dropdown-trigger" onClick={() => setOpen(!open)}>
        {activeOption?.icon && <span className="pp-dropdown-trigger-icon">{activeOption.icon}</span>}
        <span className="pp-dropdown-text">{displayText}</span>
        <svg className="pp-dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ul className="pp-dropdown-menu">
          <li>
            <button
              type="button"
              className={`pp-dropdown-item ${!value ? 'pp-dropdown-item--active' : ''}`}
              onClick={() => { onSelect(''); close(); }}
            >
              {placeholder}
            </button>
          </li>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className={`pp-dropdown-item ${value === o.value ? 'pp-dropdown-item--active' : ''}`}
                onClick={() => { onSelect(o.value); close(); }}
              >
                {o.icon && <span className="pp-dropdown-item-icon">{o.icon}</span>}
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomDropdown;

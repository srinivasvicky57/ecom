function TinyLotus({ className }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="4" fill="#C8933E" fillOpacity="0.12"/>
      <path d="M30 12C32 18,32 26,30 30C28 26,28 18,30 12Z" fill="#8B1A1A" fillOpacity="0.08"/>
      <path d="M30 48C32 42,32 34,30 30C28 34,28 42,30 48Z" fill="#8B1A1A" fillOpacity="0.08"/>
      <path d="M12 30C18 28,26 28,30 30C26 32,18 32,12 30Z" fill="#8B1A1A" fillOpacity="0.08"/>
      <path d="M48 30C42 28,34 28,30 30C34 32,42 32,48 30Z" fill="#8B1A1A" fillOpacity="0.08"/>
      <circle cx="30" cy="30" r="12" stroke="#8B1A1A" strokeWidth="0.4" fill="none" opacity="0.1"/>
    </svg>
  );
}

export default TinyLotus;

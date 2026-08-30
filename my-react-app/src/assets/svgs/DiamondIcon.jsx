function DiamondIcon({ className }) {
  return (
    <svg className={className} width="56" height="56" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <path d="M18 4 C20 10, 24 14, 30 16 C24 18, 20 22, 18 28 C16 22, 12 18, 6 16 C12 14, 16 10, 18 4Z" fill="currentColor" opacity="0.9" />
      <circle cx="18" cy="16" r="2.5" fill="#FDF5E6" opacity="0.95" />
    </svg>
  );
}

export default DiamondIcon;

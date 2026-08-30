function FeatureIcon({ color, icon, showDiamond }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" stroke={color} strokeWidth="1.5" opacity="0.25" />
      {showDiamond && (
        <path
          d="M18 5 C20.5 12, 24 15.5, 31 18 C24 20.5, 20.5 24, 18 31 C15.5 24, 12 20.5, 5 18 C12 15.5, 15.5 12, 18 5Z"
          fill={color}
          opacity="0.15"
        />
      )}
      <text x="18" y="23" textAnchor="middle" fontSize="16" fill={color}>
        {icon}
      </text>
    </svg>
  );
}

export default FeatureIcon;

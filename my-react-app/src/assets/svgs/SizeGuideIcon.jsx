const SizeGuideIcon = (props) => (
  <svg
    width={props.width || "28"}
    height={props.height || "28"}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 3H3v18h18V3z" />
    <path d="M9 3v18" />
    <path d="M3 9h6" />
    <path d="M3 15h6" />
  </svg>
);

export default SizeGuideIcon;

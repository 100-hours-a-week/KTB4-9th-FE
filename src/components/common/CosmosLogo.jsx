export default function CosmosLogo({ size = 44, color = "white", className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="9" stroke={color} strokeWidth="2.2" />
      <circle cx="22" cy="22" r="3" fill={color} />
      <path d="M22 4v6M22 34v6M4 22h6M34 22h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="m9 9 4.5 4.5M30.5 30.5 35 35M35 9l-4.5 4.5M13.5 30.5 9 35" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

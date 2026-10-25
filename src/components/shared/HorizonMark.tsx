// A small, original line-art motif (horizon + sun) used in place of photography.
// Kept as inline SVG so the app never depends on an external image service to function.
export default function HorizonMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="62" r="34" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <path
        d="M4 108C34 90 60 118 92 100C124 82 142 112 176 96C192 88 204 92 216 100"
        stroke="currentColor"
        strokeWidth="1.3"
        opacity="0.8"
      />
      <path
        d="M4 124C34 110 60 130 92 118C124 106 142 128 176 116C192 110 204 113 216 118"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.45"
      />
      <path d="M58 62H162" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeDasharray="1 5" />
    </svg>
  );
}

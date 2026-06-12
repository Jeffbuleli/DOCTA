// Footer global "Powered by McBuleli" — present sur chaque page.
// Le nom McBuleli renvoie vers https://x.com/McBuleli.

const McBuleliMark = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" fill="none" aria-hidden>
    <rect x="3" y="3" width="42" height="42" rx="11" fill="none" stroke="#1e8e3e" strokeWidth="3" />
    <path
      d="M24 14v18M16 22h-1M33 22h-1M24 14a3 3 0 1 0 0-0.1M16 22a3 3 0 1 0 0-0.1M32 22a3 3 0 1 0 0-0.1"
      stroke="#e2342b"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M17 30h14v6H17zM22 36v3M27 36v3M20 39h8"
      stroke="#e2342b"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function Footer() {
  return (
    <footer className="powered">
      <span>Powered by</span>
      <a
        className="powered__link"
        href="https://x.com/McBuleli"
        target="_blank"
        rel="noopener noreferrer"
      >
        <McBuleliMark />
        McBuleli
      </a>
    </footer>
  );
}

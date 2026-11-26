const paths = {
  expand: "M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5",
  reset: "M3 11a9 9 0 1 1 2 7 M3 4v7h7",
  candles: "M5 3v18 M2 8h6v8H2z M17 3v18 M14 6h6v9h-6z",
  line: "m3 17 5-6 4 3 8-10",
  plus: "M12 5v14 M5 12h14",
  close: "M6 6l12 12 M18 6 6 18",
  check: "m5 12 4 4L19 6",
  up: "m6 14 6-6 6 6",
  down: "m6 10 6 6 6-6",
  home: "M3 10 12 3l9 7v10H3z M9 20v-7h6v7",
  trade: "M3 17l6-6 4 4 7-8 M15 7h5v5",
  portfolio: "M3 7h18v13H3z M8 7V4h8v3 M3 12h18",
  book: "M12 5v15 M3 4h4c2 0 4 1 5 2 1-1 3-2 5-2h4v14h-4c-2 0-4 1-5 2-1-1-3-2-5-2H3z",
  people:
    "M16 21v-2c0-3-2-4-5-4H7c-3 0-5 1-5 4v2 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17 4a4 4 0 0 1 0 7 M22 21v-2c0-2-1-3-3-4",
  profile:
    "M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  tasks: "M6 3h12v18H6z M9 9l2 2 4-4 M9 15h6",
  plan: "M3 5h18v14H3z M3 9h18 M6 15h4",
  bell: "M4 17h16l-2-3V9a6 6 0 0 0-12 0v5z M10 21h4",
  support: "M3 12a9 9 0 0 1 18 0v5h-4v-6h4 M3 11h4v6H3z M21 17v2l-4 2h-4",
  exit: "M10 4H4v16h6 M9 12h12 M17 8l4 4-4 4",
  arrow: "M4 12h15 M13 6l6 6-6 6",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  search: "M15.5 15.5 21 21 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  admin: "M12 22s8-3 8-11V5l-8-3-8 3v6c0 8 8 11 8 11 M9 12l2 2 4-4",
  journal: "M5 3h14v18H5z M9 7h6 M9 11h6 M9 15h4",
};
export function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Icon name="trade" size={23} />
      </span>
      <span>IndAI</span>
    </div>
  );
}

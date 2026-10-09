/** Small line icons, 20px grid, stroke inherits currentColor. */
const PATHS: Record<string, string> = {
  plus: 'M10 4v12M4 10h12',
  close: 'M5 5l10 10M15 5L5 15',
  send: 'M4 10h11M10 4l6 6-6 6',
  stop: 'M6 6h8v8H6z',
  mic: 'M10 3a2.5 2.5 0 0 0-2.5 2.5v4a2.5 2.5 0 0 0 5 0v-4A2.5 2.5 0 0 0 10 3zM5 9.5a5 5 0 0 0 10 0M10 14.5V17',
  clip: 'M14.5 9.5l-5 5a3 3 0 0 1-4.2-4.2l5.6-5.6a2 2 0 0 1 2.8 2.8l-5.6 5.6a1 1 0 0 1-1.4-1.4l5-5',
  doc: 'M6 3h5.5L15 6.5V17H6zM11 3v4h4M8.5 10.5h4M8.5 13.5h4',
  menu: 'M4 6h12M4 10h12M4 14h12',
  panel: 'M4 4h12v12H4zM11 4v12',
  trash: 'M5 6h10M8 6V4h4v2M6.5 6l.7 10h5.6l.7-10',
  arrow: 'M6 10h8M10 6l4 4-4 4',
  file: 'M6 3h5.5L15 6.5V17H6zM11 3v4h4',
  drive: 'M7.5 3.5h5l4.5 8-2.5 4.5h-9L3 11.5zM7.5 3.5l5 8.5M12.5 3.5L8 11.5M3 11.5h14',
  back: 'M12 5l-5 5 5 5',
  expand: 'M12 4h4v4M8 16H4v-4M16 4l-5 5M4 16l5-5',
  collapse: 'M15 9h-4V5M5 11h4v4M11 9l5-5M9 11l-5 5',
  download: 'M10 3v10M6 9l4 4 4-4M4 16h12',
  chevron: 'M6 8l4 4 4-4',
  share: 'M10 3v10M6 7l4-4 4 4M5 11v5h10v-5',
  copy: 'M7 7h9v9H7zM4 13V4h9',
  check: 'M4.5 10.5l3.5 3.5 7.5-8',
  book: 'M4 4.5c2-.8 4-.8 6 .5 2-1.3 4-1.3 6-.5V16c-2-.8-4-.8-6 .5-2-1.3-4-1.3-6-.5zM10 5v11.5',
};

export function Icon({ name, size = 18 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

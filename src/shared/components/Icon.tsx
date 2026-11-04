import type { SVGProps } from 'react'
const paths = {
  home: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  calendar:
    'M7 3v4m10-4v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM7 14h2m6 0h2m-10 4h2',
  clipboard:
    'M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3M9 3h6v4H9ZM8 12h8m-8 4h5',
  checkUser: 'M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-2a6 6 0 0 1 10-4m2 3 2 2 4-5',
  review:
    'M9 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3M9 3h6v4H9Zm-1 12 3 3 5-6',
  users:
    'M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM2 21v-2a6 6 0 0 1 12 0v2m3-17a4 4 0 0 1 0 8m1 4a5 5 0 0 1 4 5',
  shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 12h8m-8 4h8m-4-4v7',
  message: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2ZM7 8h10M7 12h7',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Zm7 5v2',
  logout: 'M9 3H4v18h5m5-14 5 5-5 5m-6-5h13',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm6 6 12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  alert: 'm12 3 10 18H2Zm0 6v5m0 3v.1',
  inbox: 'M4 4h16l2 12v4H2v-4Zm-2 12h6l2 3h4l2-3h6',
  refresh: 'M20 7V3m0 4h-4m4 0a9 9 0 1 0 1 8',
  award: 'M17 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-9 4-2 9 6-3 6 3-2-9',
  left: 'm14 6-6 6 6 6',
  right: 'm10 6 6 6-6 6',
} as const
export type IconName = keyof typeof paths
/** Small, original line icons. Decorative: the adjacent control text is the accessible name. */
export function Icon({
  name,
  className = 'size-5',
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      {...props}
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}

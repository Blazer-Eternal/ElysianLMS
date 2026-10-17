import { cn } from "@/lib/utils";

/**
 * Hand-drawn icon set. One voice throughout: 24×24 grid, 1.5 stroke,
 * round caps and joins, no fills. Kept deliberately small — icons appear
 * where they aid scanning (nav, status, actions), never as decoration.
 */

const PATHS = {
  "arrow-right": "M4 12h15M13 6l6 6-6 6",
  "arrow-up": "M12 20V5M6 11l6-6 6 6",
  "arrow-down": "M12 4v15M6 13l6 6 6-6",
  "arrow-up-right": "M7 17L17 7M8.5 7H17v8.5",
  "chevron-down": "M6 9.5l6 6 6-6",
  "chevron-left": "M15 5.5l-6.5 6.5L15 18.5",
  "chevron-right": "M9 5.5L15.5 12 9 18.5",
  check: "M4.5 12.5l5 5L19.5 6.5",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  play: "M8.5 5.5v13L19 12z",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
  mail: "M3.5 5.5h17v13h-17zM3.5 7.5l8.5 6 8.5-6",
  eye: "M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12zM14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z",
  "eye-off": "M4 4l16 16M9.9 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 5.5 9.5 5.5a18 18 0 0 1-3.3 3.6M6.4 6.7A17.4 17.4 0 0 0 2.5 10.5S6 16 12 16a10.6 10.6 0 0 0 3.6-.6",
  user: "M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM5 20c1.4-3.4 3.9-5 7-5s5.6 1.6 7 5",
  users: "M9 4.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM2.8 19.5c1.2-3 3.5-4.6 6.2-4.6s5 1.6 6.2 4.6M15.8 5.3a3.2 3.2 0 0 1 0 6.2M17 15.4c2 .6 3.4 2 4.2 4.1",
  book: "M12 7C9.8 5.4 7 4.8 3.5 4.8V18c3.5 0 6.3.6 8.5 2.2 2.2-1.6 5-2.2 8.5-2.2V4.8C17 4.8 14.2 5.4 12 7zM12 7v13.2",
  layers: "M12 3.2l8.5 4.6L12 12.4 3.5 7.8 12 3.2zM3.5 12.4L12 17l8.5-4.6M3.5 16.6L12 21.2l8.5-4.6",
  sliders: "M4 7.5h8M16 7.5h4M4 16.5h4M12 16.5h8M14 5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 14.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  logout: "M14 4.5H6.5v15H14M10.5 12h9.5M17 8.5l3.5 3.5L17 15.5",
  sun: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2.5V4.5M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19",
  moon: "M20 14.2A8.4 8.4 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2z",
  monitor: "M4 4.5h16v11.5H4zM9 20.5h6M12 16v4.5",
  menu: "M4 7h16M4 12h16M4 17h16",
  search: "M11 18.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zM16.4 16.4L21 21",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5.2l3.6 2.1",
  star: "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z",
  "trending-up": "M3.5 16.5l6-6 4 4 7-7M14.5 7.5h6v6",
  bag: "M6 8h12l1 12H5L6 8zM9 8V6.5a3 3 0 0 1 6 0V8",
  alert: "M12 4l8.5 15.5h-17L12 4zM12 10v4M12 17.2v.6",
  inbox: "M3.5 13.5h5l1.5 3h4l1.5-3h5M3.5 13.5L6 5.5h12l2.5 8v6a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-6z",
  loader: "M12 3a9 9 0 0 1 9 9",
  pencil: "M4 20l1.2-4.2L16.6 4.4a2.1 2.1 0 0 1 3 3L8.2 18.8 4 20zM14.8 6.2l3 3",
  trash: "M4 6.8h16M9.5 6.8V4.5h5v2.3M6.2 6.8L7.3 20h9.4l1.1-13.2M10.2 10.5v6M13.8 10.5v6",
  external: "M14 4.5h5.5V10M19.5 4.5L11 13M17.5 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1h5",
  home: "M4 11l8-7 8 7M6.2 9.3V20h11.6V9.3",
  cap: "M2.5 9L12 4l9.5 5L12 14 2.5 9zM6.8 11.6V16c0 1.6 2.3 2.9 5.2 2.9s5.2-1.3 5.2-2.9v-4.4M21.5 9v5",
  document: "M7 3.5h6.5L18 8v12.5H7zM13.5 3.5V8H18M9.5 12.5h5M9.5 16h5",
  chart: "M4.5 20V11M12 20V4M19.5 20v-6.5",
  refresh: "M20 12a8 8 0 1 1-2.4-5.7M20 3.5V9h-5.5",
  send: "M21 3L10.2 13.8M21 3l-6.7 18-4.1-7.2L3 9.7 21 3z",
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** Provide when the icon is the only content of a control. */
  title?: string;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.5, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Small inline SVG icon set (no icon library dependency). Decorative by default. */
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const MenuIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M3 6h18M3 12h18M3 18h12" /></svg>
);
export const CloseIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const ChevronDown = ({ className = "size-3.5" }: IconProps) => (
  <svg {...base} strokeWidth={2.4} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronLeft = ({ className = "size-5" }: IconProps) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRight = ({ className = "size-5" }: IconProps) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="m9 18 6-6-6-6" /></svg>
);
export const MapPinIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const PhoneIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const ClockIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const SparkleIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" /></svg>
);
export const ShirtIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0z" /></svg>
);
export const TagIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>
);
export const StoreIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M5 11v10h14V11" /><path d="M10 21v-5h4v5" /></svg>
);
export const FilterIcon = ({ className = "size-4" }: IconProps) => (
  <svg {...base} className={className}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
);
export const InstagramIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
);
export const WhatsAppIcon = ({ className = "size-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.2-4.24 9.44-9.44 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.07c0 2 .52 3.96 1.52 5.68L.58 23.3l5.68-1.49a11.33 11.33 0 0 0 5.79 1.47c6.27 0 11.37-5.1 11.37-11.37 0-3.04-1.18-5.9-3.33-8.04" />
  </svg>
);
export const PlusIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const TrashIcon = ({ className = "size-4" }: IconProps) => (
  <svg {...base} className={className}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);
export const UploadIcon = ({ className = "size-6" }: IconProps) => (
  <svg {...base} className={className}><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /></svg>
);
export const EyeIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const UsersIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2A6.5 6.5 0 0 1 21.5 20" /></svg>
);
export const MailIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
);
export const ActivityIcon = ({ className = "size-5" }: IconProps) => (
  <svg {...base} className={className}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
);

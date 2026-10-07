import React from 'react';

const paths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  droplet: <path d="M12 2.8S6 9.1 6 14a6 6 0 0 0 12 0c0-4.9-6-11.2-6-11.2Z"/>,
  alert: <><path d="M10.3 2.8 2.5 17a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 2.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  valve: <><path d="M4 12h16"/><path d="M8 8v8"/><path d="M16 8v8"/><circle cx="12" cy="5" r="2"/><path d="M12 7v5"/></>,
  bug: <><path d="M8 2h8"/><path d="M9 6 7 4"/><path d="m15 6 2-2"/><rect x="7" y="6" width="10" height="14" rx="5"/><path d="M4 13h3M17 13h3M5 8l3 2M19 8l-3 2M5 18l3-2M19 18l-3-2M12 6v14"/></>,
  device: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></>,
  wifi: <><path d="M5 12.6a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 20h.01"/></>,
  activity: <path d="M3 12h4l2-7 4 14 2-7h6"/>,
  leaf: <><path d="M20 4c-8 0-14 4-14 10 0 3 2 6 6 6 6 0 8-8 8-16Z"/><path d="M4 20c3-5 7-8 12-10"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  server: <><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></>
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.activity}
    </svg>
  );
}

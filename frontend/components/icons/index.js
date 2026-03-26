import React from 'react';

const base = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

export const HospitalIcon = (props) => (
    <svg {...base} {...props}>
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" />
        <path d="M12 7v10M7 12h10" />
    </svg>
);

export const AmbulanceIcon = (props) => (
    <svg {...base} {...props}>
        <rect x="3" y="9" width="14" height="8" rx="2.5" />
        <path d="M17 11h2.5a1.5 1.5 0 0 1 1.5 1.5V15a2 2 0 0 1-2 2h-2" />
        <path d="M6 9V7a1 1 0 0 1 1-1h4" />
        <circle cx="8" cy="17" r="1.4" />
        <circle cx="17" cy="17" r="1.4" />
        <path d="M9 12h4M11 10v4" />
    </svg>
);

export const MapIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M9 4 3 6.5v13l6-2.5 6 2.5 6-2.5v-13L15 6.5 9 4Z" />
        <path d="m9 4 .1 13" />
        <path d="m15 6.5-.1 13" />
    </svg>
);

export const ChartIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M4 19h16" />
        <rect x="6" y="11" width="3" height="6" rx="1" />
        <rect x="11" y="7" width="3" height="10" rx="1" />
        <rect x="16" y="9" width="3" height="8" rx="1" />
    </svg>
);

export const BellIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M18 16v-4a6 6 0 1 0-12 0v4" />
        <path d="M5 16h14" />
        <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
);

export const SignalIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M4 16a8 8 0 0 1 16 0" />
        <path d="M7 16a5 5 0 0 1 10 0" />
        <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
    </svg>
);

export const DoctorIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
        <path d="M9.5 13.5v3M8 15h3" />
    </svg>
);

export const PersonIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="12" cy="7" r="3" />
        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
    </svg>
);

export const RefreshIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M20 4v6h-6" />
        <path d="M4 20v-6h6" />
        <path d="M20 10a8 8 0 0 0-14-4M4 14a8 8 0 0 0 14 4" />
    </svg>
);

export const CloseIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);

export const ArrowRightIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </svg>
);

export const ArrowLeftIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M19 12H5" />
        <path d="m11 6-6 6 6 6" />
    </svg>
);

export const ClipboardIcon = (props) => (
    <svg {...base} {...props}>
        <rect x="6" y="5" width="12" height="14" rx="2" />
        <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
        <path d="M9 10h6M9 14h4" />
    </svg>
);

export const SearchIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="11" cy="11" r="6" />
        <path d="m15.5 15.5 3 3" />
    </svg>
);

export const WarningIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 3 2.5 19.5h19L12 3Z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const AlertIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5" />
        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const StatusDot = ({ color = 'currentColor', size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="4.5" fill={color} />
    </svg>
);

export const HeartIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 20s-6.5-4.35-8.5-8.05C1.5 9.1 2.5 6 5.5 5c2-.7 3.5.5 4.5 2.1C11.5 5.5 13 4.3 15 5c3 .9 4 4.1 2 6.95C18.5 15.65 12 20 12 20Z" />
    </svg>
);

export const DropletIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 3s6 6.1 6 10.2A6 6 0 0 1 6 13.2C6 9.1 12 3 12 3Z" />
        <path d="M10 14a2 2 0 0 0 4 0" />
    </svg>
);

export const ThermometerIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M14 14.5V6a2 2 0 1 0-4 0v8.5a3 3 0 1 0 4 0Z" />
        <path d="M10 9h4" />
    </svg>
);

export const SpeedIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M4.5 17.5a8 8 0 1 1 15 0" />
        <path d="m12 12 4-2" />
        <path d="M5 17.5h14" />
    </svg>
);

export const LocationIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 21s-6-6.2-6-11a6 6 0 1 1 12 0c0 4.8-6 11-6 11Z" />
        <circle cx="12" cy="10" r="2.5" />
    </svg>
);

export const ShieldIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M12 3 5 6v6c0 3 2.9 5.4 7 7 4.1-1.6 7-4 7-7V6l-7-3Z" />
    </svg>
);

export const SunIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.4-1.4M20.4 20.4 19 19M5 19l-1.4 1.4M20.4 3.6 19 5" />
    </svg>
);

export const MoonIcon = (props) => (
    <svg {...base} {...props}>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 6.5 6.5 0 1 0 20 14.5Z" />
    </svg>
);

export const MapPinIcon = LocationIcon;
export const SuccessIcon = (props) => (
    <svg {...base} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5 11 15l4.5-6" />
    </svg>
);

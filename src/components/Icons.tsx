/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const MotorcycleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Rear Wheel */}
    <circle cx="5" cy="16" r="3.5" />
    <circle cx="5" cy="16" r="1.5" />
    {/* Front Wheel */}
    <circle cx="19" cy="16" r="3.5" />
    <circle cx="19" cy="16" r="1.5" />
    {/* Frame, engine and tank */}
    <path d="M5 16l4-7h4l3 7" />
    <path d="M9 9l3-4h3l3 11" />
    <path d="M8 12h5" />
    {/* Handlebars & Headlight */}
    <path d="M15 5l2-2h2" />
    <circle cx="20" cy="5" r="0.75" fill="currentColor" />
    {/* Seat */}
    <path d="M7 9h4" strokeWidth="2.5" />
  </svg>
);

export const EnterVehicleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Vehicle silhouette */}
    <path d="M4 17h16" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M5 15l2-6h5l3 6" />
    {/* Arrow pointing in */}
    <path d="M12 3v7" strokeWidth="2.5" />
    <path d="M9 7l3 3 3-3" strokeWidth="2.5" />
  </svg>
);

export const ExitVehicleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Vehicle silhouette */}
    <path d="M3 18h14" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="14" cy="18" r="2" />
    <path d="M4 16l2-5h5l2 5" />
    {/* Arrow pointing out/up */}
    <path d="M18 10V3" strokeWidth="2.5" />
    <path d="M15 6l3-3 3 3" strokeWidth="2.5" />
  </svg>
);

export const SprintIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="14" cy="4" r="2" fill="currentColor" />
    {/* Body running */}
    <path d="M7 21l3-6 3 2 3-5-2-4 3-2" />
    <path d="M13 8l3 4" />
    <path d="M10 15l-4 5" />
    {/* Motion wind lines */}
    <path d="M3 8h3" strokeDasharray="2 2" />
    <path d="M2 12h4" strokeDasharray="2 2" />
    <path d="M4 16h3" strokeDasharray="2 2" />
  </svg>
);

export const JumpIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="12" cy="5" r="2" fill="currentColor" />
    {/* Torso & jumping legs */}
    <path d="M12 7v5l-3 4-2-1" />
    <path d="M12 12l4 3 2-2" />
    <path d="M9 10l-2-2" />
    <path d="M15 10l2-2" />
    {/* Upward chevron / ground indicator */}
    <path d="M7 21l5-3 5 3" strokeWidth="2" />
  </svg>
);

export const PunchIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Clenched fist silhouette */}
    <rect x="5" y="8" width="10" height="9" rx="3" />
    <path d="M7 8V5a1.5 1.5 0 0 1 3 0v3" />
    <path d="M10 8V4a1.5 1.5 0 0 1 3 0v4" />
    <path d="M13 8V5a1.5 1.5 0 0 1 3 0v3" />
    {/* Thumb wrap */}
    <path d="M5 12h3v4H5z" />
    {/* Impact sparks */}
    <path d="M18 5l2-2" />
    <path d="M20 10h3" />
    <path d="M19 15l2 2" />
  </svg>
);

export const AcceleratorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Angled gas pedal */}
    <rect x="7" y="3" width="10" height="18" rx="2" transform="rotate(8 12 12)" fill="currentColor" fillOpacity="0.15" />
    <line x1="9" y1="7" x2="15" y2="8" strokeWidth="2" />
    <line x1="8" y1="11" x2="14" y2="12" strokeWidth="2" />
    <line x1="7" y1="15" x2="13" y2="16" strokeWidth="2" />
    {/* Speed arrow indicator */}
    <path d="M17 6l3 2-3 2" />
  </svg>
);

export const BrakeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Wide brake pedal */}
    <rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
    <line x1="7" y1="9" x2="7" y2="15" strokeWidth="2.5" />
    <line x1="12" y1="9" x2="12" y2="15" strokeWidth="2.5" />
    <line x1="17" y1="9" x2="17" y2="15" strokeWidth="2.5" />
    {/* Stop bar */}
    <line x1="4" y1="19" x2="20" y2="19" strokeWidth="2" strokeDasharray="3 2" />
  </svg>
);

export const HandbrakeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Brake symbol (circle with parenthesis) */}
    <circle cx="12" cy="12" r="6" />
    <path d="M4 8a10 10 0 0 0 0 8" />
    <path d="M20 8a10 10 0 0 1 0 8" />
    {/* Letter P for Park/Handbrake */}
    <path d="M10 9h3a2 2 0 0 1 0 4h-3v3" strokeWidth="2.2" />
  </svg>
);

export const HornIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Horn trumpet */}
    <path d="M3 10v4a1 1 0 0 0 1 1h4l5 4V5L8 9H4a1 1 0 0 0-1 1z" fill="currentColor" fillOpacity="0.15" />
    {/* Sound waves */}
    <path d="M16 8a5 5 0 0 1 0 8" strokeWidth="2.5" />
    <path d="M19 5a9 9 0 0 1 0 14" strokeWidth="2.5" />
  </svg>
);

export const HeadlightIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Lamp fixture */}
    <path d="M6 8a5 5 0 0 0 0 8h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3H6z" fill="currentColor" fillOpacity="0.2" />
    {/* Light rays */}
    <line x1="14" y1="7" x2="21" y2="5" strokeWidth="2" />
    <line x1="15" y1="12" x2="22" y2="12" strokeWidth="2.5" />
    <line x1="14" y1="17" x2="21" y2="19" strokeWidth="2" />
  </svg>
);

export const RecenterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Crosshair & center dot */}
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <line x1="12" y1="2" x2="12" y2="6" strokeWidth="2.5" />
    <line x1="12" y1="18" x2="12" y2="22" strokeWidth="2.5" />
    <line x1="2" y1="12" x2="6" y2="12" strokeWidth="2.5" />
    <line x1="18" y1="12" x2="22" y2="12" strokeWidth="2.5" />
  </svg>
);

export const RadioIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
    <path d="M5 7L16 2" strokeWidth="2.2" />
    <circle cx="8" cy="14" r="3.5" />
    <line x1="15" y1="11" x2="18" y2="11" strokeWidth="2" />
    <line x1="15" y1="15" x2="18" y2="15" strokeWidth="2" />
  </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" />
  </svg>
);

export const CompassIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const TakaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Bengali Taka currency stylized vector sign */}
    <path d="M15 5H9a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4h3a3 3 0 0 1 3 3v2a4 4 0 0 1-4 4H8" />
    <line x1="17" y1="5" x2="17" y2="19" strokeWidth="2.5" />
    <line x1="6" y1="10" x2="19" y2="10" strokeWidth="2" />
  </svg>
);

export const VolumeHighIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth="2" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeWidth="2" />
  </svg>
);

export const VolumeMuteIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity="0.2" />
    <line x1="23" y1="9" x2="17" y2="15" strokeWidth="2.5" />
    <line x1="17" y1="9" x2="23" y2="15" strokeWidth="2.5" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

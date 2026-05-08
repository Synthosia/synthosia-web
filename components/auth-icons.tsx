type IconProps = {
  className?: string;
};

export function GoogleIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M21.8 12.23c0-.76-.07-1.49-.2-2.18H12v4.13h5.48a4.68 4.68 0 0 1-2.03 3.07v2.55h3.29c1.92-1.77 3.06-4.38 3.06-7.57Z" />
      <path fill="#34A853" d="M12 22c2.75 0 5.05-.91 6.74-2.47l-3.29-2.55c-.91.61-2.08.97-3.45.97-2.65 0-4.89-1.79-5.69-4.19H2.92v2.63A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.31 13.76A6.02 6.02 0 0 1 6 12c0-.61.11-1.2.31-1.76V7.61H2.92A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.39l3.23-2.63Z" />
      <path fill="#EA4335" d="M12 6.05c1.49 0 2.83.51 3.88 1.52l2.92-2.92C17.04 3.01 14.74 2 12 2a10 10 0 0 0-9.08 5.61l3.39 2.63c.8-2.4 3.04-4.19 5.69-4.19Z" />
    </svg>
  );
}

export function GitHubIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.19-3.37-1.19-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.35 1.08 2.92.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.48 9.48 0 0 1 12 6.99c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.57c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function ShieldIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 3 5 6v5.4c0 4.18 2.92 7.8 7 8.6 4.08-.8 7-4.42 7-8.6V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KeyIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14.5 9.5a4.5 4.5 0 1 0-3.2 4.31L14 16.5h2.5V19H19v-2.5h2.5V14L18 10.5a4.5 4.5 0 0 0-3.5-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 9.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function TerminalIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="m5 8 4 4-4 4M11 16h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CloudIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M7.5 18.5h10.2a4.3 4.3 0 0 0 .35-8.58A6.5 6.5 0 0 0 5.53 8.5 5.1 5.1 0 0 0 7.5 18.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Assistente de novo ambiente / provisionamento guiado. */
export function RocketIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 2.5c1.8 3.2 2.5 5.9 2.5 8.5m0 0c0 2.1-.4 4.2-1.1 6.2M14.5 11c3 .4 5.5 1.3 7.5 2.8-1.3 1.5-3 2.6-5 3.2m-8 4.5c-2-1.8-3.2-4.3-3.5-7m7.5 2.8c-1.5 2.8-3.8 5-6.8 6.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14.5 7 22l2.5-2 2 1.5-1-5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2h5.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ApiIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IntegrationIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM7 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9.5 6.5h5M9.5 17.5h5M7 8v8M17 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M14 18a2 2 0 1 1-4 0M6 9a6 6 0 1 1 12 0c0 3.18.75 4.22 1.5 5.5a1 1 0 0 1-.8 1.5H5.3a1 1 0 0 1-.8-1.5C5.25 13.22 6 12.18 6 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RefreshCwIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M21 21v-5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ícones do menu lateral estilo painel (CloudPanel / hosting UI). */
export function PanelDashboardIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12h8M12 4v16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PanelSitesIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7h2M7 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PanelDatabaseIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PanelFilesIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function PanelCronIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PanelSettingsIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MenuIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Rede / topologia (menu lateral estilo Acme). */
export function NavNetworkingIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 5v4M5.5 9.5 9.5 11.5M18.5 9.5 14.5 11.5M5.5 14.5 9.5 12.5M18.5 14.5 14.5 12.5M12 15v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="4" r="1.25" fill="currentColor" />
      <circle cx="4" cy="9" r="1.25" fill="currentColor" />
      <circle cx="20" cy="9" r="1.25" fill="currentColor" />
      <circle cx="4" cy="15" r="1.25" fill="currentColor" />
      <circle cx="20" cy="15" r="1.25" fill="currentColor" />
      <circle cx="12" cy="20" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function NavMonitorIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="4" y="5" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NavBarChartIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5 19V9M11 19v-6M17 19V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Prompt estilo >_ (Terminal no menu). */
export function NavTerminalPromptIcon({ className = "size-4" }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M8 9 4 12l4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
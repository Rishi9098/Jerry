import { NavLink } from "react-router-dom";
import "./sidebar.css";

interface NavItem {
  to: string;
  label: string;
  icon: JSX.Element;
}

const NAV: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
        <rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1" />
        <rect x="10" y="2.5" width="5.5" height="5.5" rx="1" />
        <rect x="2.5" y="10" width="5.5" height="5.5" rx="1" />
        <rect x="10" y="10" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
  {
    to: "/students",
    label: "Students",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
        <circle cx="7" cy="6" r="2.6" />
        <path d="M2.5 15c0-2.6 2-4.3 4.5-4.3s4.5 1.7 4.5 4.3" />
        <path d="M12.5 4.5a2.3 2.3 0 010 4.4M13 10.8c2 .4 3.5 1.9 3.5 4.2" />
      </svg>
    ),
  },
  {
    to: "/grades",
    label: "Grades",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
        <path d="M3 2.5h9l3 3V15.5H3z" />
        <path d="M12 2.5v3h3" />
        <path d="M6 9.5h6M6 12.5h4" />
      </svg>
    ),
  },
  {
    to: "/courses",
    label: "Courses",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
        <path d="M9 2.5L16 6 9 9.5 2 6z" />
        <path d="M4.5 7.6v3.4c0 1 2 2 4.5 2s4.5-1 4.5-2V7.6" />
      </svg>
    ),
  },
  {
    to: "/degree-audit",
    label: "Degree Audit",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="9" cy="9" r="6.5" />
        <path d="M6.5 9l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: "/at-risk",
    label: "At-Risk Alerts",
    icon: (
      <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M9 2.5L16 15H2L9 2.5z" strokeLinejoin="round" />
        <path d="M9 7v4m0 2h.01" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  return (
    <aside className="sidebar" data-open={open || undefined}>
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden>
          L
        </span>
        <div className="sidebar__wordmark">
          <span className="sidebar__name">Lumen</span>
          <span className="sidebar__sub">Registrar</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <p className="sidebar__group-label">Workspace</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "is-active" : ""}`
            }
            onClick={onNavigate}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__inst">Lumen University</p>
        <p className="sidebar__term">Office of the Registrar · 2025–26</p>
      </div>
    </aside>
  );
}

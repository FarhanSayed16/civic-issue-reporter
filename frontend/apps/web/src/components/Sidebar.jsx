import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, ListChecks, BarChart3, HelpCircle, Shield } from 'lucide-react';

const links = [
  { to: '/home', icon: LayoutDashboard, label: 'Dashboard', end: false },
  { to: '/issues', icon: ListChecks, label: 'All Issues', end: false },
  { to: '/my-issues', icon: ListChecks, label: 'My Assigned Issues', end: false },
  { to: '/help-settings', icon: HelpCircle, label: 'Help & Settings', end: false },
];

export default function Sidebar() {
  const base = 'flex items-center gap-3 px-4 py-3 rounded-md transition-colors';
  const active = 'bg-accent text-white';
  const inactive = 'text-white/90 hover:bg-white/10';

  return (
    <aside className="w-64 bg-primary min-h-screen text-white flex-shrink-0">
      <nav className="pt-6">
        <ul className="space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
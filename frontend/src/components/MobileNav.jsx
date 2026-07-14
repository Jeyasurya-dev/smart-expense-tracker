import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, Target, Settings } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budget', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const MobileNav = () => (
  <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass rounded-2xl px-2 py-2 flex justify-between">
    {links.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] ${
            isActive ? 'text-white' : 'text-white/50'
          }`
        }
      >
        <Icon className="w-5 h-5" />
        {label}
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;

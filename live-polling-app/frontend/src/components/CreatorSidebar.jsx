import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BarChart3, ChevronDown, CircleUserRound, Compass, House, LogOut, Menu, Plus, Settings, SlidersHorizontal, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const navigation = [
  { to: '/choice', label: 'Home', icon: House },
  { to: '/join', label: 'Explore Polls', icon: Compass },
  { to: '/create', label: 'Create Poll', icon: Plus },
  { to: '/dashboard', label: 'My Polls', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function CreatorSidebar() {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const name = profile?.displayName || profile?.email?.split('@')[0] || '';
  const email = profile?.email || '';
  const close = () => setOpen(false);
  const linkClass = ({ isActive }) => isActive ? 'active' : undefined;

  return <>
    <header className="creator-header">
      <div className="creator-header-brand"><button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={21} /></button><Link className="brand" to="/choice">LivePoll</Link></div>
      <div className="account-menu"><button className="account-trigger" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span className="account-trigger-copy"><span className="account-trigger-label">{name || 'Your account'}</span><small>{email}</small></span><ChevronDown className="account-chevron" size={16} aria-hidden="true" /></button>{accountOpen && <div className="account-dropdown creator-account-dropdown"><div className="account-dropdown-identity"><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><div><strong>{name || 'Your account'}</strong><small>{email}</small></div></div><div className="account-dropdown-links"><Link to="/account" onClick={() => setAccountOpen(false)}><CircleUserRound size={16} />Account</Link><Link to="/settings" onClick={() => setAccountOpen(false)}><SlidersHorizontal size={16} />Settings</Link><button type="button" onClick={() => { setAccountOpen(false); logout(); }}><LogOut size={16} />Sign Out</button></div></div>}</div>
    </header>
    {open && <button className="drawer-scrim" type="button" aria-label="Close navigation" onClick={close} />}
    <aside className={`creator-sidebar ${open ? 'drawer-open' : ''}`}>
      <div className="creator-sidebar-inner"><div className="creator-sidebar-top"><div className="sidebar-brand-row"><span className="brand-mark" aria-hidden="true">L</span><span>LivePoll</span><button className="drawer-close" type="button" aria-label="Close navigation" onClick={close}><X size={21} /></button></div><p className="sidebar-caption">Make every response count.</p><nav className="sidebar-nav" aria-label="Creator navigation">{navigation.map(({ to, label, icon: Icon }) => <NavLink className={linkClass} to={to} onClick={close} key={to}><Icon size={18} strokeWidth={2.15} /><span>{label}</span></NavLink>)}</nav></div><div className="sidebar-pulse"><span className="pulse-dot" aria-hidden="true" />Live ideas, real answers.</div></div>
    </aside>
  </>;
}

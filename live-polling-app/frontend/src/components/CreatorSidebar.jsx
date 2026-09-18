import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function CreatorSidebar({ pollId }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const name = profile?.displayName || 'Poovendhan R';
  const email = profile?.email || 'existing account';
  const close = () => setOpen(false);
  const linkClass = ({ isActive }) => isActive ? 'active' : undefined;

  return <>
    <header className="creator-header"><div className="creator-header-brand"><button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><Link className="brand" to="/choice">LivePoll</Link></div><div className="account-menu"><button className="account-trigger" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen((value) => !value)}><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span className="account-trigger-label">{name}</span><span aria-hidden="true">▾</span></button>{accountOpen && <div className="account-dropdown creator-account-dropdown"><strong>{name}</strong><small>{email}</small><Link to="/account" onClick={() => setAccountOpen(false)}>Account</Link><Link to="/settings" onClick={() => setAccountOpen(false)}>Settings</Link><button type="button" onClick={() => { setAccountOpen(false); logout(); }}>Sign Out</button></div>}</div></header>
    {open && <button className="drawer-scrim" type="button" aria-label="Close navigation" onClick={close} />}
    <aside className={`creator-sidebar ${open ? 'drawer-open' : ''}`}>
      <div className="creator-sidebar-inner">
        <div className="creator-sidebar-top"><div className="sidebar-brand-row"><span className="brand-mark">L</span><span>LivePoll</span><button className="drawer-close" type="button" aria-label="Close navigation" onClick={close}>×</button></div><nav className="sidebar-nav" aria-label="Creator navigation"><NavLink className={linkClass} to="/choice" onClick={close}>Home</NavLink><NavLink className={linkClass} to="/join" onClick={close}>Explore Polls</NavLink><NavLink className={linkClass} to="/create" onClick={close}>Create Poll</NavLink><NavLink className={linkClass} to="/dashboard" onClick={close}>My Polls</NavLink>{pollId ? <NavLink className={linkClass} to={`/analytics/${pollId}`} end onClick={close}>Analytics</NavLink> : <span className="sidebar-disabled">Analytics</span>}<NavLink className={linkClass} to="/settings" onClick={close}>Settings</NavLink></nav></div>
    </div>
    </aside>
  </>;
}

import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function CreatorSidebar({ pollId }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const name = profile?.displayName || 'Poovendhan R';
  const email = profile?.email || 'existing account';
  const close = () => setOpen(false);
  const linkClass = ({ isActive }) => isActive ? 'active' : undefined;

  return <>
    <header className="mobile-creator-header"><button className="menu-toggle" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><Link className="brand" to="/choice">PollPop</Link></header>
    {open && <button className="drawer-scrim" type="button" aria-label="Close navigation" onClick={close} />}
    <aside className={`creator-sidebar ${open ? 'drawer-open' : ''}`}>
      <div className="creator-sidebar-inner">
        <div className="creator-sidebar-top"><div className="sidebar-brand-row"><span className="brand-mark">P</span><span>PollPop</span><button className="drawer-close" type="button" aria-label="Close navigation" onClick={close}>×</button></div><nav className="sidebar-nav" aria-label="Creator navigation"><NavLink className={linkClass} to="/choice" onClick={close}>Home</NavLink><NavLink className={linkClass} to="/join" onClick={close}>Explore Polls</NavLink><NavLink className={linkClass} to="/create" onClick={close}>Create Poll</NavLink><NavLink className={linkClass} to="/dashboard" onClick={close}>My Polls</NavLink>{pollId ? <NavLink className={linkClass} to={`/analytics/${pollId}`} end onClick={close}>Analytics</NavLink> : <span className="sidebar-disabled">Analytics</span>}<NavLink className={linkClass} to="/settings" onClick={close}>Settings</NavLink></nav></div><div className="sidebar-account"><div className="sidebar-account-profile"><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span><strong>{name}</strong><small>{email}</small></span></div><div className="sidebar-account-actions"><Link to="/account" onClick={close}>Account</Link><Link to="/settings" onClick={close}>Settings</Link><button type="button" onClick={() => { close(); logout(); }}>Sign Out</button></div></div>
    </div>
    </aside>
  </>;
}

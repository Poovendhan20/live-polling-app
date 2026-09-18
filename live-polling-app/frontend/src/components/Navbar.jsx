import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getMyPolls } from '../api/polls';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { token, profile, logout } = useAuth();
  const location = useLocation();
  const [hasCreatedPolls, setHasCreatedPolls] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const name = profile?.displayName || profile?.email?.split('@')[0] || '';

  useEffect(() => {
    if (!token) {
      setHasCreatedPolls(false);
      return;
    }
    getMyPolls()
      .then((r) => { const items = Array.isArray(r.data) ? r.data : []; setHasCreatedPolls(items.length > 0); })
      .catch(() => setHasCreatedPolls(false));
  }, [token]);

  if (location.pathname.startsWith('/results/')) {
    return token ? null : <nav className="topbar"><span className="brand">LivePoll</span></nav>;
  }

  if (location.pathname.startsWith('/vote/') || location.pathname === '/join') {
    if (location.pathname.startsWith('/vote/')) {
      return (
        <nav className="voter-topbar" aria-label="Voter navigation">
          <div className="voter-auth-links">
            {!token && <><Link to="/login" state={{ from: { pathname: '/create' } }}>Login</Link><Link to="/signup" state={{ from: { pathname: '/create' } }}>Sign Up</Link></>}
            {token && <Link to="/create">Create Poll</Link>}
          </div>
          <span className="brand">LivePoll</span>
        </nav>
      );
    }
    return <nav className="topbar"><span className="brand">LivePoll</span></nav>;
  }

  if (!token) {
    return (
      <nav className="topbar">
        <Link to="/choice" className="brand">LivePoll</Link>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="button small">Get started</Link>
        </div>
      </nav>
    );
  }

  if (location.pathname === '/choice' || location.pathname === '/dashboard' || location.pathname === '/create' || location.pathname === '/settings' || location.pathname === '/account' || location.pathname.startsWith('/analytics/') || location.pathname.startsWith('/polls/')) {
    return null;
  }

  return (
    <nav className="topbar">
      <Link to="/choice" className="brand">LivePoll</Link>
      <div className="nav-links">
        <Link to="/choice">Home</Link>
        <Link to="/join">Explore Polls</Link>
        <Link to="/create">Create Poll</Link>
        {hasCreatedPolls && <NavLink to="/dashboard">My Polls</NavLink>}
        <div className="account-menu"><button className="account-trigger" type="button" onClick={() => setAccountOpen((open) => !open)}><span className="avatar">{name.slice(0, 1).toUpperCase()}</span><span className="account-trigger-label">{name}</span></button>{accountOpen && <div className="account-dropdown"><Link to="/account" onClick={() => setAccountOpen(false)}>Account</Link><Link to="/settings" onClick={() => setAccountOpen(false)}>Settings</Link><button type="button" onClick={logout}>Sign Out</button></div>}</div>
      </div>
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getMyPolls } from '../api/polls';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { token, profile, logout } = useAuth();
  const location = useLocation();
  const [hasCreatedPolls, setHasCreatedPolls] = useState(false);
  const [firstPollId, setFirstPollId] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setHasCreatedPolls(false);
      return;
    }
    getMyPolls()
      .then((r) => { const items = Array.isArray(r.data) ? r.data : []; setHasCreatedPolls(items.length > 0); setFirstPollId(items[0]?.poll?.id || null); })
      .catch(() => setHasCreatedPolls(false));
  }, [token]);

  if (location.pathname.startsWith('/vote/') || location.pathname.startsWith('/results/') || location.pathname === '/join') {
    return <nav className="topbar"><span className="brand">PollPop</span></nav>;
  }

  if (!token) {
    return (
      <nav className="topbar">
        <Link to="/choice" className="brand">PollPop</Link>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="button small">Get started</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="topbar">
      <Link to="/choice" className="brand">PollPop</Link>
      <div className="nav-links">
        <Link to="/choice">Home</Link>
        <Link to="/join">Explore Polls</Link>
        <Link to="/create">Create Poll</Link>
        {hasCreatedPolls && <NavLink to="/dashboard">My Polls</NavLink>}
        {firstPollId && <NavLink to={`/analytics/${firstPollId}`}>Analytics</NavLink>}
        <div className="account-menu"><button className="account-trigger" type="button" onClick={() => setAccountOpen((open) => !open)}><span className="avatar">{(profile?.displayName || 'Poovendhan R').slice(0, 1).toUpperCase()}</span><span className="account-trigger-label">{profile?.displayName || 'Poovendhan R'}</span></button>{accountOpen && <div className="account-dropdown"><Link to="/account" onClick={() => setAccountOpen(false)}>Account</Link><Link to="/settings" onClick={() => setAccountOpen(false)}>Settings</Link><button type="button" onClick={logout}>Sign Out</button></div>}</div>
      </div>
    </nav>
  );
}
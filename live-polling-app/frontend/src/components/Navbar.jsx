import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyPolls } from '../api/polls';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { token, logout } = useAuth();
  const [hasCreatedPolls, setHasCreatedPolls] = useState(false);

  useEffect(() => {
    if (!token) {
      setHasCreatedPolls(false);
      return;
    }
    getMyPolls()
      .then((r) => setHasCreatedPolls(Array.isArray(r.data) && r.data.length > 0))
      .catch(() => setHasCreatedPolls(false));
  }, [token]);

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
        {hasCreatedPolls && <Link to="/dashboard">My Polls</Link>}
        <Link to="/dashboard">Analytics</Link>
        <button className="link-button" type="button" onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}
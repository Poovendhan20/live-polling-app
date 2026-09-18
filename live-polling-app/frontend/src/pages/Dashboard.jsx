import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyPolls } from '../api/polls';

export default function Dashboard() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    getMyPolls()
      .then((r) => setPolls(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPolls([]));
  }, []);

  const totalVotes = polls.reduce((sum, poll) => {
    const counts = poll.counts || {};
    return sum + Object.values(counts).reduce((inner, v) => inner + Number(v || 0), 0);
  }, 0);
  const activePolls = polls.filter((p) => !p.deadlineAt || Number(p.deadlineAt) > Date.now()).length;
  const closedPolls = polls.length - activePolls;
  const recent = [...polls].sort((a, b) => Number(new Date(b.createdAt || 0)) - Number(new Date(a.createdAt || 0))).slice(0, 4);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar-panel">
        <div>
          <div className="brand-wrap"><span className="brand-mark">P</span><span>PollPop</span></div>
          <nav className="sidebar-nav">
            <a href="/choice">Home</a>
            <a href="/join">Explore Polls</a>
            <a href="/create">Create Poll</a>
            <a href="/dashboard" className="active">My Polls</a>
            <a href="/dashboard">Analytics</a>
            <a href="/choice">Settings</a>
            <button className="sidebar-signout" type="button">Sign Out</button>
          </nav>
        </div>
      </aside>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DASHBOARD</span>
            <h1>Welcome back, creator.</h1>
          </div>
          <Link className="button" to="/create">Create Poll</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><span>Total Polls</span><strong>{polls.length}</strong></div>
          <div className="stat-card"><span>Total Votes</span><strong>{totalVotes}</strong></div>
          <div className="stat-card"><span>Active Polls</span><strong>{activePolls}</strong></div>
          <div className="stat-card"><span>Closed Polls</span><strong>{closedPolls}</strong></div>
        </div>

        <div className="panel-header-row">
          <h2>Recent Polls</h2>
        </div>

        <div className="poll-list">
          {recent.length === 0 && <div className="empty-state card-surface">No polls yet. Create your first poll to get started.</div>}
          {recent.map((poll) => {
            const total = Object.values(poll.counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
            const status = poll.deadlineAt && Number(poll.deadlineAt) < Date.now() ? 'Closed' : 'Active';
            return (
              <article key={poll.id} className="poll-card card-surface">
                <div className="poll-card-top">
                  <div>
                    <span className="pill">{status}</span>
                    <h3>{poll.question}</h3>
                  </div>
                  <span className="poll-id">ID: {poll.id}</span>
                </div>
                <div className="poll-meta-row">
                  <span>{total} votes</span>
                  <span>{poll.deadlineAt ? new Date(Number(poll.deadlineAt)).toLocaleString() : 'No deadline'}</span>
                </div>
                <div className="card-actions">
                  <Link to={`/results/${poll.id}`} className="small-action">View Results</Link>
                  <button type="button" className="small-action muted">View Voters</button>
                  <button type="button" className="small-action muted">Analytics</button>
                  <button type="button" className="small-action muted">Share</button>
                  <button type="button" className="small-action muted">Download Report</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
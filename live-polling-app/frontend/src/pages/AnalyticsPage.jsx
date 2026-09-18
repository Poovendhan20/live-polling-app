import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPollAnalytics } from '../api/polls';

export default function AnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState('');

  useEffect(() => {
    getPollAnalytics(id).then((response) => setData(response.data)).catch(() => setError('You do not have access to this analytics page.'));
  }, [id]);

  if (error) return <main className="narrow-page"><div className="error">{error}</div></main>;
  if (!data) return <main className="narrow-page"><p>Loading analytics...</p></main>;

  const total = Number(data.totalVotes || 0);
  const deadline = data.poll.deadlineAt ? new Date(Number(data.poll.deadlineAt)).toLocaleString() : 'No deadline';
  return (
    <main className="narrow-page creator-page">
      <Link className="back-link" to="/dashboard">Back to My Polls</Link>
      <span className="eyebrow">POLL ANALYTICS</span>
      <h1>{data.poll.question}</h1>
      <div className="summary-grid analytics-summary">
        <div className="summary-card card-surface"><span>Total votes</span><strong>{total}</strong></div>
        <div className="summary-card card-surface"><span>Total voters</span><strong>{data.totalVoters}</strong></div>
        <div className="summary-card card-surface"><span>Status</span><strong>{data.status}</strong></div>
        <div className="summary-card card-surface"><span>Deadline</span><strong className="summary-value-small">{deadline}</strong></div>
      </div>
      <div className="card-surface chart-card analytics-chart">
        {data.poll.options.map((option, index) => {
          const count = Number((data.counts || {})[index] || 0);
          const percentage = total ? count / total * 100 : 0;
          return <div className="bar-row" key={option}><div className="bar-label"><span>{option}</span><strong>{count} votes · {percentage.toFixed(1)}%</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(percentage, count ? 8 : 0)}%` }} /></div></div>;
        })}
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPoll } from '../api/polls';
import useWebSocket from '../hooks/useWebSocket';
import PollResultsChart from '../components/PollResultsChart';

export default function ResultsPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const live = useWebSocket(id);
  const shareUrl = `${window.location.origin}/vote/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  const handleShare = async (type) => {
    const payload = { title: 'Live Poll', text: 'Vote on this poll', url: shareUrl };
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${payload.text}: ${payload.url}`)}`, '_blank');
      return;
    }
    if (type === 'instagram' && navigator.share) {
      try { await navigator.share(payload); return; } catch (err) { }
    }
    if (navigator.share) {
      try { await navigator.share(payload); return; } catch (err) { }
    }
    await handleCopy();
  };

  useEffect(() => {
    getPoll(id).then((r) => setPoll(r.data)).catch(() => setPoll(null));
  }, [id]);

  useEffect(() => {
    if (poll && Object.keys(live).length) {
      setPoll((prev) => (prev ? { ...prev, counts: live } : prev));
    }
  }, [live, poll]);

  if (!poll) {
    return <main className="narrow-page"><p>Loading results...</p></main>;
  }

  const totalVotes = Object.values(poll.counts || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const optionEntries = (poll.poll?.options || []).map((option, index) => ({
    option,
    index,
    count: Number((poll.counts || {})[index] || 0),
    percentage: totalVotes ? (Number((poll.counts || {})[index] || 0) / totalVotes) * 100 : 0,
  }));

  return (
    <main className="narrow-page results-page">
      <span className="eyebrow">LIVE RESULTS</span>
      <h1>{poll.poll.question}</h1>
      {poll.isClosed && <div className="notice">This poll has ended.</div>}

      <div className="summary-grid">
        <div className="summary-card card-surface">
          <span>Total votes</span>
          <strong>{totalVotes}</strong>
        </div>
        <div className="summary-card card-surface">
          <span>Status</span>
          <strong>{poll.status || 'Active'}</strong>
        </div>
      </div>

      <div className="card-surface chart-card">
        <PollResultsChart options={poll.poll.options} counts={poll.counts || {}} />
      </div>

      <div className="share-box card-surface">
        <div className="share-header">
          <span>Share this poll</span>
          <button type="button" className="button small" onClick={() => setShareOpen((v) => !v)}>Share Poll</button>
        </div>
        {shareOpen && (
          <div className="share-menu">
            <button type="button" className="share-option" onClick={handleCopy}>{copied ? 'Link copied!' : 'Copy Link'}</button>
            <button type="button" className="share-option" onClick={() => handleShare('whatsapp')}>WhatsApp</button>
            <button type="button" className="share-option" onClick={() => handleShare('instagram')}>Instagram</button>
            <button type="button" className="share-option" onClick={() => handleShare('native')}>More / Share</button>
          </div>
        )}
        <div className="share-link">{shareUrl}</div>
        <div className="poll-id-line">Poll ID: {id}</div>
      </div>

      <div className="card-surface details-card">
        <h3>Breakdown</h3>
        {optionEntries.map(({ option, count, percentage }) => (
          <div key={option} className="bar-row">
            <div className="bar-label">
              <span>{option}</span>
              <strong>{count} · {percentage.toFixed(1)}%</strong>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(percentage, 8)}%` }} /></div>
          </div>
        ))}
      </div>
    </main>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Radio, Share2 } from 'lucide-react';
import { getPoll } from '../api/polls';
import useWebSocket from '../hooks/useWebSocket';
import PollResultsChart from '../components/PollResultsChart';
import CreatorSidebar from '../components/CreatorSidebar';
import useAuth from '../hooks/useAuth';

export default function ResultsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
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
    if (Object.keys(live).length) {
      setPoll((prev) => (prev ? { ...prev, counts: live } : prev));
    }
  }, [live]);

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

  const resultsContent = (
    <>
      <div className="page-back-heading"><button className="back-arrow" type="button" aria-label="Go back" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button><span className="results-title">Results</span></div>
      <div className="results-hero"><div><span className="eyebrow">LIVE RESULTS</span><h1>{poll.poll.question}</h1></div><span className={`live-status ${poll.isClosed ? 'is-closed' : ''}`}><Radio size={15} />{poll.isClosed ? 'Poll ended' : 'Live updates'}</span></div>
      {poll.isClosed && <div className="notice">This poll has ended.</div>}

      <div className="summary-grid">
        <div className="summary-card card-surface">
          <span>Total votes</span>
          <strong>{totalVotes}</strong>
        </div>
        <div className="summary-card card-surface">
          <span>Poll status</span>
          <strong>{poll.status || 'Active'}</strong>
        </div>
      </div>

      <div className="card-surface chart-card results-card">
        <PollResultsChart options={poll.poll.options} counts={poll.counts || {}} />
      </div>

      <div className="share-box card-surface">
        <div className="share-header">
          <span>Share this poll</span>
          <button type="button" className="button small" onClick={() => setShareOpen((v) => !v)}><Share2 size={16} />Share Poll</button>
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

      <div className="card-surface details-card results-card">
        <h3>Breakdown</h3>
        {optionEntries.map(({ option, count, percentage }) => (
          <div key={option} className="result-row">
            <div className="result-row-header">
              <span className="result-option">{option}</span>
              <span className="result-stat"><b>{count} votes</b><span>{percentage.toFixed(1)}%</span></span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(percentage, 8)}%` }} /></div>
          </div>
        ))}
      </div>
      </>
  );
  return token ? <main className="dashboard-shell results-shell"><CreatorSidebar pollId={id} /><section className="content-panel results-page">{resultsContent}</section></main> : <main className="narrow-page results-page">{resultsContent}</main>;
}

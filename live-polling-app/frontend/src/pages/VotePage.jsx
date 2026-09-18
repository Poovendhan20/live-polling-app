import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { getPoll, vote } from '../api/polls';
import VoteOption from '../components/VoteOption';

function CreatePollCallout() {
  return <section className="voter-create-callout"><p>Want to create your own poll?</p><Link className="button small" to="/create">Create Poll</Link></section>;
}

function VoterFooter() {
  return <footer className="voter-footer">LivePoll</footer>;
}

export default function VotePage() {
  const { id } = useParams();
  const [data, setData] = useState();
  const [selected, setSelected] = useState();
  const [message, setMessage] = useState('');
  const [voter, setVoter] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(`voter:${id}`)) || { name: '', email: '' }; } catch { return { name: '', email: '' }; }
  });
  const [identityComplete, setIdentityComplete] = useState(() => Boolean(sessionStorage.getItem(`voter:${id}`)));
  const [identityError, setIdentityError] = useState('');

  useEffect(() => {
    getPoll(id)
      .then((r) => {
        setData(r.data);
        if (r.data.hasVoted) setMessage('Your vote is submitted');
      })
      .catch(() => setMessage('Poll not found'));
  }, [id]);

  const submit = async () => {
    if (selected === undefined) return;
    try {
      await vote(id, selected, voter.name, voter.email);
      setMessage('Your vote is submitted');
      setSelected(undefined);
    } catch (e) {
      setMessage(e.response?.data?.error || 'Could not record vote');
    }
  };

  const continueToVote = (event) => {
    event.preventDefault();
    const name = voter.name.trim();
    const email = voter.email.trim();
    if (!name) { setIdentityError('Enter your name to continue.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setIdentityError('Enter a valid email address to continue.'); return; }
    const next = { name, email };
    sessionStorage.setItem(`voter:${id}`, JSON.stringify(next));
    setVoter(next);
    setIdentityError('');
    setIdentityComplete(true);
  };

  if (!data) {
    return <main className="narrow-page voter-page"><p>{message || 'Loading poll...'}</p><CreatePollCallout /><VoterFooter /></main>;
  }

  const hasVoted = Boolean(data.hasVoted || message === 'Your vote is submitted');
  const pollClosed = Boolean(data.isClosed);

  if (!identityComplete && !hasVoted) {
    return <main className="narrow-page identity-page voter-page"><div className="voter-intro"><span className="eyebrow">BEFORE YOU VOTE</span><h1>Tell us who is voting.</h1><p>Your name and email are used only to record this vote.</p></div><form className="card-surface identity-form" onSubmit={continueToVote}><label>Name<input value={voter.name} onChange={(event) => setVoter({ ...voter, name: event.target.value })} placeholder="Enter your name" autoComplete="name" /></label><label>Email<input type="email" value={voter.email} onChange={(event) => setVoter({ ...voter, email: event.target.value })} placeholder="Enter your email" autoComplete="email" /></label>{identityError && <div className="error">{identityError}</div>}<button className="button">Continue to Vote</button></form><CreatePollCallout /><VoterFooter /></main>;
  }

  return (
    <main className="narrow-page voter-page">
      <div className="voter-intro"><span className="eyebrow">CAST YOUR VOTE</span><h1>{data.poll.question}</h1><p><Sparkles size={16} />Your response helps shape the outcome.</p></div>
      {pollClosed && !hasVoted && <div className="notice">This poll has ended.</div>}
      {!hasVoted && !pollClosed && (
        <>
          <div className="vote-list">
            {data.poll.options.map((o, i) => (
              <VoteOption key={o} index={i} label={o} count={data.counts?.[i] || 0} selected={selected === i} onClick={() => setSelected(i)} />
            ))}
          </div>
          <button className="button vote-submit" onClick={submit}>Submit vote <CheckCircle2 size={18} /></button>
        </>
      )}
      {message && (
        <p className="notice">
          {message} <Link to={`/results/${id}`}>View live results</Link>
        </p>
      )}
      <CreatePollCallout />
      <VoterFooter />
    </main>
  );
}

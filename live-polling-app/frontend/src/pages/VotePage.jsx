import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPoll, vote } from '../api/polls';
import VoteOption from '../components/VoteOption';

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
    return <main className="narrow-page"><p>{message || 'Loading poll...'}</p></main>;
  }

  const hasVoted = Boolean(data.hasVoted || message === 'Your vote is submitted');
  const pollClosed = Boolean(data.isClosed);

  if (!identityComplete && !hasVoted) {
    return <main className="narrow-page identity-page"><span className="eyebrow">BEFORE YOU VOTE</span><h1>Tell us who is voting.</h1><p>Your name and email are used only to record this vote.</p><form className="card-surface identity-form" onSubmit={continueToVote}><label>Name<input value={voter.name} onChange={(event) => setVoter({ ...voter, name: event.target.value })} placeholder="Enter your name" autoComplete="name" /></label><label>Email<input type="email" value={voter.email} onChange={(event) => setVoter({ ...voter, email: event.target.value })} placeholder="Enter your email" autoComplete="email" /></label>{identityError && <div className="error">{identityError}</div>}<button className="button">Continue to Vote</button></form></main>;
  }

  return (
    <main className="narrow-page">
      <span className="eyebrow">CAST YOUR VOTE</span>
      <h1>{data.poll.question}</h1>
      {pollClosed && !hasVoted && <div className="notice">This poll has ended.</div>}
      {!hasVoted && !pollClosed && (
        <>
          <div className="vote-list">
            {data.poll.options.map((o, i) => (
              <VoteOption key={o} label={o} count={data.counts?.[i] || 0} selected={selected === i} onClick={() => setSelected(i)} />
            ))}
          </div>
          <button className="button" onClick={submit}>Submit vote</button>
        </>
      )}
      {message && (
        <p className="notice">
          {message} <Link to={`/results/${id}`}>View live results</Link>
        </p>
      )}
    </main>
  );
}
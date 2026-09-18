import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPollVoters } from '../api/polls';

export default function VotersPage() {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState('');

  useEffect(() => {
    getPollVoters(id).then((response) => setData(response.data)).catch(() => setError('You do not have access to this voter list.'));
  }, [id]);

  if (error) return <main className="narrow-page"><div className="error">{error}</div></main>;
  if (!data) return <main className="narrow-page"><p>Loading voters...</p></main>;

  return (
    <main className="narrow-page creator-page">
      <Link className="back-link" to="/dashboard">Back to My Polls</Link>
      <span className="eyebrow">VOTER INFORMATION</span>
      <h1>{data.question}</h1>
      <div className="summary-card card-surface"><span>Total voters</span><strong>{data.totalVoters}</strong></div>
      <div className="table-card card-surface">
        <div className="voter-row voter-heading"><span>Name</span><span>Email</span><span>Selected option</span></div>
        {data.voters.map((voter, index) => <div className="voter-row" key={`${voter.email}-${index}`}><span>{voter.name}</span><span>{voter.email}</span><span>{voter.selectedOption}</span></div>)}
        {data.voters.length === 0 && <p className="empty-state">No votes yet.</p>}
      </div>
    </main>
  );
}

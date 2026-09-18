import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  return <main className="narrow-page voters-page"><h1>Voters</h1><div className="table-card card-surface"><div className="voter-row voter-heading"><span>Name</span><span>Email</span><span>Selected Option</span></div>{data.voters.map((voter, index) => <div className="voter-row" key={`${voter.email}-${index}`}><span data-label="Name">{voter.name}</span><span data-label="Email">{voter.email}</span><span data-label="Selected Option">{voter.selectedOption}</span></div>)}{data.voters.length === 0 && <p className="empty-state">No voters yet.</p>}</div></main>;
}

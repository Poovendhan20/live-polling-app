import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPollVoters } from '../api/polls';
import CreatorSidebar from '../components/CreatorSidebar';

export default function VotersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [error, setError] = useState('');

  useEffect(() => {
    getPollVoters(id).then((response) => setData(response.data)).catch(() => setError('You do not have access to this voter list.'));
  }, [id]);

  if (error) return <main className="narrow-page"><div className="error">{error}</div></main>;
  if (!data) return <main className="narrow-page"><p>Loading voters...</p></main>;

  return <main className="dashboard-shell"><CreatorSidebar /><section className="content-panel voters-page"><div className="page-back-heading"><button className="back-arrow" type="button" aria-label="Back to My Polls" onClick={() => navigate(-1)}>←</button><h1>Voters</h1></div><div className="table-card card-surface"><div className="voter-row voter-heading"><span>Name</span><span>Email</span><span>Selected Option</span></div>{data.voters.map((voter, index) => <div className="voter-row" key={`${voter.email}-${index}`}><span data-label="Name">{voter.name}</span><span data-label="Email">{voter.email}</span><span data-label="Selected Option">{voter.selectedOption}</span></div>)}{data.voters.length === 0 && <p className="empty-state">No voters yet.</p>}</div></section></main>;
}

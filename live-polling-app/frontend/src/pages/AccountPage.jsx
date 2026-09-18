import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CreatorSidebar from '../components/CreatorSidebar';

export default function AccountPage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const name = profile?.displayName || 'Poovendhan R';
  return <main className="dashboard-shell"><CreatorSidebar /><section className="content-panel narrow-content"><div className="page-back-heading"><button className="back-arrow" type="button" aria-label="Go back" onClick={() => navigate(-1)}>←</button><h1>Account</h1></div><span className="eyebrow">ACCOUNT</span><h2>{name}</h2><div className="card-surface account-card"><strong>{profile?.email || 'Signed-in account'}</strong><span>Your LivePoll account</span><div className="inline-actions"><Link className="button" to="/settings">Account settings</Link><button className="small-action" type="button" onClick={logout}>Sign out</button></div></div></section></main>;
}

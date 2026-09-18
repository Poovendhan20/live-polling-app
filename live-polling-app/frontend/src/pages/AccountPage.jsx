import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AccountPage() {
  const { profile, logout } = useAuth();
  const name = profile?.displayName || 'Poovendhan R';
  return <main className="narrow-page creator-page"><span className="eyebrow">ACCOUNT</span><h1>{name}</h1><div className="card-surface account-card"><strong>{profile?.email || 'Signed-in account'}</strong><span>Your PollPop account</span><div className="inline-actions"><Link className="button" to="/settings">Account settings</Link><button className="small-action" type="button" onClick={logout}>Sign out</button></div></div></main>;
}

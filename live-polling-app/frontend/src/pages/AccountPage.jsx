import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AccountPage() {
  const { logout } = useAuth();
  const email = (() => { try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])).email || 'Signed-in account'; } catch { return 'Signed-in account'; } })();
  const name = 'Poovendhan R';
  return <main className="narrow-page creator-page"><Link className="back-link" to="/choice">Back home</Link><span className="eyebrow">ACCOUNT</span><h1>{name}</h1><div className="card-surface account-card"><strong>{email}</strong><span>Your PollPop account</span><div className="inline-actions"><Link className="button" to="/settings">Account settings</Link><button className="small-action" type="button" onClick={logout}>Sign out</button></div></div></main>;
}

import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return <main className="narrow-page creator-page"><Link className="back-link" to="/choice">Back home</Link><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Account settings</h1><div className="card-surface settings-form"><label>Profile name<input value="Poovendhan R" readOnly /></label><p className="settings-note">Your profile name is managed by the existing account configuration.</p><Link className="button" to="/account">View account</Link></div></main>;
}

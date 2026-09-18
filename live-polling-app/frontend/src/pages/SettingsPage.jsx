import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const [name, setName] = useState(localStorage.getItem('profileName') || '');
  const [saved, setSaved] = useState(false);
  const save = (event) => {
    event.preventDefault();
    localStorage.setItem('profileName', name.trim());
    setSaved(true);
  };
  return <main className="narrow-page creator-page"><Link className="back-link" to="/choice">Back home</Link><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Your account, your details.</h1><form className="card-surface settings-form" onSubmit={save}><label>Profile name<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} placeholder="Your name" /></label><p className="settings-note">Your email remains managed by the existing authentication account.</p><button className="button">Save name</button>{saved && <div className="notice">Name updated.</div>}</form></main>;
}

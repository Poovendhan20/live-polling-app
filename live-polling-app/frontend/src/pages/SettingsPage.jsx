import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import CreatorSidebar from '../components/CreatorSidebar';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { profile, updateDisplayName } = useAuth();
  const [editing, setEditing] = useState(false);
  const profileName = profile?.displayName || profile?.email?.split('@')[0] || '';
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profileName);
  }, [profile, profileName]);

  const beginEdit = () => {
    setName(profileName);
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    setName(profileName);
    setError('');
    setEditing(false);
  };

  const save = async (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Profile name cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateDisplayName(trimmed);
      setName(trimmed);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save profile name.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dashboard-shell"><CreatorSidebar /><section className="content-panel narrow-content settings-page">
      <div className="page-back-heading"><button className="back-arrow" type="button" aria-label="Go back" onClick={() => navigate(-1)}>←</button><h1>Account Settings</h1></div>
      <span className="eyebrow">ACCOUNT SETTINGS</span>
      <section className="card-surface settings-form">
        <h2>Profile</h2>
        <div className="settings-field">
          <span className="settings-label">Profile Name</span>
          {editing ? (
            <form onSubmit={save} className="profile-edit-form">
              <input value={name} onChange={(event) => setName(event.target.value)} autoFocus aria-label="Profile Name" />
              <div className="settings-actions"><button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button><button className="small-action" type="button" onClick={cancel}>Cancel</button></div>
              {error && <div className="error">{error}</div>}
            </form>
          ) : (
            <div className="settings-value-row"><strong>{profileName}</strong><button className="small-action" type="button" onClick={beginEdit}>Edit</button></div>
          )}
        </div>
        <div className="settings-field"><span className="settings-label">Email</span><strong className="settings-value">{profile?.email || 'Signed-in account'}</strong></div>
      </section>
    </section></main>
  );
}

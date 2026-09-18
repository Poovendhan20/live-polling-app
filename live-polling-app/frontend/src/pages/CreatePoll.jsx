import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock3, Plus, Sparkles } from 'lucide-react';
import { createPoll } from '../api/polls';
import CreatorSidebar from '../components/CreatorSidebar';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [deadlineHours, setDeadlineHours] = useState('');
  const [customDeadline, setCustomDeadline] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) {
      setError('Add a clear question and at least two options.');
      return;
    }
    try {
      const payload = {
        question: question.trim(),
        options: cleaned,
        deadlineHours: Number(deadlineHours || 0),
        customDeadline: customDeadline || '',
      };
      const response = await createPoll(payload);
      nav(`/results/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Check your poll details');
    }
  };

  return (
    <main className="dashboard-shell create-shell">
      <CreatorSidebar />
      <section className="content-panel form-panel">
        <div className="create-page-header">
          <span className="eyebrow">NEW POLL</span>
          <h1>Ask something<br />worth answering.</h1>
          <p>Set the question, invite the room, and let the signal come through.</p>
        </div>

        <form onSubmit={submit} className="poll-form create-form card-surface">
          <label className="form-field">
            <span className="field-label"><Sparkles size={16} />The question</span>
            <input className="question-input" value={question} onChange={(e) => setQuestion(e.target.value)} minLength="5" required placeholder="What should we decide together?" />
          </label>

          <div className="option-builder"><div className="option-builder-heading"><span className="field-label">Response options</span><small>At least two choices</small></div><div className="option-stack">
            {options.map((o, i) => (
              <label className="form-field option-field" key={i}>
                <span className="option-number">{String(i + 1).padStart(2, '0')}</span>
                <input
                  value={o}
                  onChange={(e) => setOptions((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  required={i < 2}
                  placeholder={`Enter option ${i + 1}`}
                />
              </label>
            ))}
          </div></div>

          <button type="button" className="add-option-button" onClick={() => setOptions((prev) => [...prev, ''])}><Plus size={17} />Add another option</button>

          <div className="deadline-section"><div className="deadline-section-heading"><Clock3 size={17} /><span>Close date</span><small>Optional</small></div><div className="deadline-grid create-deadline-grid">
            <label className="form-field">
              <span>Deadline</span>
              <select value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)}>
                <option value="">No Deadline</option>
                <option value="24">1 Day</option>
                <option value="48">2 Days</option>
                <option value="72">3 Days</option>
                <option value="96">4 Days</option>
              </select>
            </label>
            <label className="form-field">
              <span>Custom date &amp; time</span>
              <input type="datetime-local" value={customDeadline} onChange={(e) => setCustomDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </label>
          </div></div>

          {error && <div className="error">{error}</div>}
          <div className="create-form-footer"><button className="button create-submit">Create &amp; Share</button></div>
        </form>
      </section>
    </main>
  );
}

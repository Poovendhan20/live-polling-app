import { Check } from 'lucide-react';

export default function VoteOption({ index, label, count = 0, selected, onClick }) {
  return <button className={`vote-option ${selected ? 'selected' : ''}`} onClick={onClick} type="button">
    <span className="vote-option-index">{String((index || 0) + 1).padStart(2, '0')}</span>
    <span className="vote-option-label">{label}</span>
    <span className="vote-option-meta">{selected ? <><Check size={16} />Selected</> : `${count} ${count === 1 ? 'vote' : 'votes'}`}</span>
  </button>;
}

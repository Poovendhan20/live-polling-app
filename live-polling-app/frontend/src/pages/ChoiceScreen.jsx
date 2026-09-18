import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Plus } from 'lucide-react';
import CreatorSidebar from '../components/CreatorSidebar';
import useAuth from '../hooks/useAuth';

export default function ChoiceScreen(){
  const { profile } = useAuth();
  const firstName = (profile?.displayName || profile?.email?.split('@')[0] || '').trim().split(/\s+/)[0];
  return <main className="dashboard-shell"><CreatorSidebar/><section className="content-panel choice-page home-page"><div className="home-intro"><span className="eyebrow">LIVEPOLL HOME</span><h1>What are we asking<br/>the room today{firstName ? `, ${firstName}` : ''}?</h1><p>Start a fresh conversation or add your voice to one already in motion.</p></div><div className="choice-grid"><Link to="/join" className="choice-card"><div className="choice-icon"><Compass size={21} /></div><b>01 · EXPLORE</b><h2>Vote on a Poll</h2><span>Paste a link or poll ID and make your voice heard.</span><i className="choice-arrow"><ArrowUpRight size={19} /></i></Link><Link to="/create" className="choice-card accent"><div className="choice-icon"><Plus size={22} /></div><b>02 · CREATE</b><h2>Create a Poll</h2><span>Ask a sharp question and share the live results.</span><i className="choice-arrow"><ArrowUpRight size={19} /></i></Link></div></section></main>;
}

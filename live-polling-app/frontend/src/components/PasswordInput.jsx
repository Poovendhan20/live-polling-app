import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
export default function PasswordInput({ value, onChange, name = 'password', placeholder = 'Password' }) { const [visible, setVisible] = useState(false); return <div className="password-wrap"><input name={name} value={value} onChange={onChange} type={visible ? 'text' : 'password'} placeholder={placeholder} required minLength="6" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>; }

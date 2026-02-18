
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { BRAND_NAME } from '../constants';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'admin123') { 
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid Ops Password.');
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4 border-t-[20px] border-brand-pink">
      <div className="max-w-md w-full bg-white rounded-none p-12 border-8 border-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <span className="text-8xl font-black serif">BAR</span>
        </div>
        
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl font-black serif text-black mb-2 uppercase tracking-tighter leading-none">{BRAND_NAME}</h1>
          <p className="text-[10px] font-black text-brand-pink uppercase tracking-[0.4em]">Ops Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                disabled
                value="OPS_ADMINISTRATOR"
                className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-black font-black text-[10px] tracking-widest uppercase text-gray-400 outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={20} />
              <input
                type="password"
                required
                autoFocus
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full pl-16 pr-6 py-6 bg-white border-2 border-black font-black text-xl tracking-tighter outline-none focus:bg-brand-pink focus:text-white transition-all"
                placeholder="OPS_KEY"
              />
            </div>
          </div>

          {error && <p className="text-brand-red text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[8px_8px_0px_0px_rgba(255,20,147,1)] hover:bg-brand-pink hover:shadow-none transition-all flex items-center justify-center space-x-3"
          >
            <span>Enter Dashboard</span>
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

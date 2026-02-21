
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-secondary/30 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-brand-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 lg:p-16 shadow-premium border border-brand-secondary relative z-10">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-8 shadow-soft">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl font-black serif text-brand-dark mb-3 uppercase tracking-tighter leading-none">{BRAND_NAME}</h1>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Ops Portal Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-2">Operator</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
                <input
                  type="text"
                  disabled
                  value="OPS_ADMINISTRATOR"
                  className="w-full pl-16 pr-6 py-6 bg-brand-secondary/30 border border-transparent rounded-2xl font-black text-[10px] tracking-widest uppercase text-brand-muted outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-2">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-dark" size={20} />
                <input
                  type="password"
                  required
                  autoFocus
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-brand-secondary/30 border border-transparent rounded-2xl font-black text-xl tracking-tighter outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-xl">
              <p className="text-brand-red text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
          >
            <span>Enter Dashboard</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 text-center">
           <button 
             onClick={() => navigate('/')}
             className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-brand-primary transition-colors"
           >
             Return to Public Site
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

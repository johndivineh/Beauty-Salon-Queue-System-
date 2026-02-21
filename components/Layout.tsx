
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, Phone, Clock, MapPin, Menu, X, ChevronRight } from 'lucide-react';
import { BRAND_NAME, INSTAGRAM_HANDLE, CONTACT_NUMBERS, OPENING_HOURS } from '../constants';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const navLinkClasses = (path: string) => {
    const base = "font-semibold transition-all duration-300 text-sm uppercase tracking-[0.2em] relative py-2";
    const active = "text-brand-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-primary after:rounded-full";
    const inactive = "text-brand-dark hover:text-brand-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-primary after:rounded-full hover:after:w-full after:transition-all after:duration-300";
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-brand-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black text-brand-dark tracking-tighter uppercase serif group-hover:text-brand-primary transition-colors duration-300">{BRAND_NAME}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className={navLinkClasses('/')}>Home</Link>
            <Link to="/catalogue" className={navLinkClasses('/catalogue')}>Inspo</Link>
            <Link to="/track" className={navLinkClasses('/track')}>Track</Link>
            <Link to="/policies" className={navLinkClasses('/policies')}>Policies</Link>
            <Link to="/join" className="bg-gradient-premium text-white px-8 py-3.5 rounded-full font-bold hover:shadow-premium transition-all duration-300 uppercase text-xs tracking-[0.2em] transform hover:-translate-y-0.5 active:translate-y-0">
              Join Queue
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-dark p-2 hover:bg-brand-secondary rounded-full transition-colors">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-secondary p-6 flex flex-col space-y-6 shadow-premium animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className={`text-xl font-bold uppercase tracking-widest ${isActive('/') ? 'text-brand-primary' : 'text-brand-dark'}`}>Home</Link>
          <Link to="/catalogue" onClick={() => setIsOpen(false)} className={`text-xl font-bold uppercase tracking-widest ${isActive('/catalogue') ? 'text-brand-primary' : 'text-brand-dark'}`}>Braids Inspo</Link>
          <Link to="/track" onClick={() => setIsOpen(false)} className={`text-xl font-bold uppercase tracking-widest ${isActive('/track') ? 'text-brand-primary' : 'text-brand-dark'}`}>Track My Turn</Link>
          <Link to="/policies" onClick={() => setIsOpen(false)} className={`text-xl font-bold uppercase tracking-widest ${isActive('/policies') ? 'text-brand-primary' : 'text-brand-dark'}`}>Policies</Link>
          <Link to="/join" onClick={() => setIsOpen(false)} className="bg-gradient-premium text-white px-6 py-5 rounded-2xl font-bold text-center uppercase tracking-widest shadow-soft">Join Queue</Link>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-secondary text-brand-dark pt-24 pb-12 border-t border-brand-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <div>
            <h3 className="text-3xl font-black serif mb-8 uppercase tracking-tighter text-brand-accent">{BRAND_NAME}</h3>
            <p className="text-brand-muted mb-8 max-w-xs font-medium text-sm leading-relaxed">
              Premium walk-in braiding services. Ghanaian Northern braiders delivering excellence with every strand.
            </p>
            <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} className="inline-flex items-center space-x-3 text-brand-dark hover:text-brand-primary transition-all duration-300 font-bold uppercase text-xs tracking-widest group">
              <div className="p-2 bg-white rounded-full shadow-soft group-hover:shadow-premium transition-all">
                <Instagram size={18} />
              </div>
              <span>@{INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <div>
            <h4 className="text-sm font-black mb-8 uppercase tracking-[0.3em] text-brand-primary">Contact Us</h4>
            <div className="space-y-6">
              {CONTACT_NUMBERS.map(num => (
                <a key={num} href={`tel:${num}`} className="flex items-center space-x-3 text-brand-muted hover:text-brand-primary transition-colors font-bold group">
                  <div className="p-2 bg-white rounded-full shadow-soft group-hover:shadow-premium transition-all">
                    <Phone size={16} />
                  </div>
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black mb-8 uppercase tracking-[0.3em] text-brand-primary">Hours</h4>
            <div className="space-y-6 text-brand-muted font-bold">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-full shadow-soft">
                  <Clock size={16} className="text-brand-primary" />
                </div>
                <div className="text-sm pt-1">
                  <p className="text-brand-dark">Mon – Sat: {OPENING_HOURS.monSat}</p>
                  <p>Sun: {OPENING_HOURS.sun}</p>
                </div>
              </div>
            </div>
            <div className="mt-10">
              <Link to="/policies" className="text-brand-dark hover:text-brand-primary flex items-center font-black uppercase text-xs tracking-widest group">
                Our Policies <ChevronRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-brand-muted/20 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-brand-muted uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. High-end Haircare.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
             <Link to="/admin/login" className="hover:text-brand-primary transition-colors">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

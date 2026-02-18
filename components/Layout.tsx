
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
    const base = "font-extrabold transition-colors text-sm uppercase tracking-widest transition-all duration-200";
    const active = "text-brand-pink underline decoration-2 underline-offset-4";
    const inactive = "text-black hover:text-brand-pink";
    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black text-black tracking-tighter uppercase">{BRAND_NAME}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClasses('/')}>Home</Link>
            <Link to="/catalogue" className={navLinkClasses('/catalogue')}>Inspo</Link>
            <Link to="/track" className={navLinkClasses('/track')}>Track</Link>
            <Link to="/policies" className={navLinkClasses('/policies')}>Policies</Link>
            <Link to="/join" className="bg-black text-white px-6 py-2.5 rounded-none font-black hover:bg-brand-pink transition-all shadow-[4px_4px_0px_0px_rgba(190,24,93,1)] uppercase text-xs tracking-[0.2em]">
              Join Queue
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-black">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex flex-col space-y-4 shadow-xl">
          <Link to="/" onClick={() => setIsOpen(false)} className={`text-lg font-black py-2 border-b border-gray-50 uppercase ${isActive('/') ? 'text-brand-pink' : 'text-black'}`}>Home</Link>
          <Link to="/catalogue" onClick={() => setIsOpen(false)} className={`text-lg font-black py-2 uppercase ${isActive('/catalogue') ? 'text-brand-pink' : 'text-black'}`}>Braids Inspo</Link>
          <Link to="/track" onClick={() => setIsOpen(false)} className={`text-lg font-black py-2 uppercase ${isActive('/track') ? 'text-brand-pink' : 'text-black'}`}>Track My Turn</Link>
          <Link to="/policies" onClick={() => setIsOpen(false)} className={`text-lg font-black py-2 uppercase ${isActive('/policies') ? 'text-brand-pink' : 'text-black'}`}>Policies</Link>
          <Link to="/join" onClick={() => setIsOpen(false)} className="bg-brand-pink text-white px-6 py-4 rounded-none font-black text-center uppercase">Join Queue</Link>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-black serif mb-6 uppercase tracking-tighter">{BRAND_NAME}</h3>
            <p className="text-gray-400 mb-6 max-w-xs font-medium text-sm leading-relaxed">
              Premium walk-in braiding services. Ghanaian Northern braiders delivering excellence with every strand.
            </p>
            <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} className="inline-flex items-center space-x-2 text-white hover:text-brand-pink transition-colors font-black uppercase text-xs tracking-widest">
              <Instagram size={16} />
              <span>@{INSTAGRAM_HANDLE}</span>
            </a>
          </div>

          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-[0.3em] text-brand-pink">Contact Us</h4>
            <div className="space-y-4">
              {CONTACT_NUMBERS.map(num => (
                <a key={num} href={`tel:${num}`} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-bold">
                  <Phone size={16} />
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-[0.3em] text-brand-pink">Hours</h4>
            <div className="space-y-4 text-gray-400 font-bold">
              <div className="flex items-start space-x-2">
                <Clock size={16} className="mt-1" />
                <div className="text-sm">
                  <p>Mon – Sat: {OPENING_HOURS.monSat}</p>
                  <p>Sun: {OPENING_HOURS.sun}</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link to="/policies" className="text-white hover:text-brand-pink flex items-center font-black uppercase text-xs tracking-widest">
                Our Policies <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. High-end Haircare.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <Link to="/admin/login" className="hover:text-white transition-colors">Staff Portal</Link>
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


import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, ArrowRight, CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { Branch } from '../types';
import { useApp } from '../store';

const BranchCard: React.FC<{ branch: Branch, phone: string, mapUrl: string }> = ({ branch, phone, mapUrl }) => {
  const { getBranchStatus } = useApp();
  const status = getBranchStatus(branch);

  const getStatusBadge = () => {
    if (!status.isPhysicallyOpen) {
      return <div className="bg-brand-muted/20 text-brand-muted px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest">Closed - Pre-join</div>;
    }
    return <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center">
      <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mr-2 animate-pulse"></div>
      Open Now
    </div>;
  };

  return (
    <div className="bg-white rounded-3xl p-10 shadow-soft border border-brand-secondary transition-all duration-500 hover:shadow-premium hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black serif text-brand-dark uppercase tracking-tighter">{branch}</h3>
          <div className="flex items-center text-brand-muted mt-2 font-bold uppercase text-[10px] tracking-widest">
            <MapPin size={12} className="mr-1.5 text-brand-primary" />
            <span>Northern Ghana Specialists</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-brand-secondary/30 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-brand-dark group-hover:text-white">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">In Queue</p>
          <p className="text-4xl font-black serif">{status.peopleWaiting}</p>
        </div>
        <div className="bg-brand-secondary/30 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white">
          <p className="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">Now At</p>
          <p className="text-4xl font-black serif">{status.isPhysicallyOpen ? `#${status.nowServing}` : '--'}</p>
        </div>
      </div>

      {!status.isPhysicallyOpen && (
        <p className="text-xs text-brand-primary mb-6 font-bold uppercase tracking-widest flex items-center justify-center">
          <AlertCircle size={14} className="inline mr-2" />
          {status.nextOpeningText}
        </p>
      )}

      <div className="space-y-4">
        <Link 
          to={`/join?branch=${branch}`} 
          className={`block w-full text-center py-5 rounded-2xl font-bold transition-all duration-300 uppercase text-xs tracking-[0.2em] shadow-soft hover:shadow-premium transform active:scale-[0.98] ${
            status.isPhysicallyOpen 
              ? 'bg-brand-dark text-white hover:bg-brand-primary' 
              : 'bg-brand-primary text-white hover:brightness-110'
          }`}
        >
          {status.isPhysicallyOpen ? 'Join Live Queue' : 'Pre-join for Tomorrow'}
        </Link>
        <div className="grid grid-cols-2 gap-4">
          <a href={`tel:${phone}`} className="flex items-center justify-center space-x-2 rounded-2xl border border-brand-secondary text-brand-dark py-4 font-bold text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all duration-300">
            <Phone size={14} className="text-brand-primary" />
            <span>Call</span>
          </a>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 rounded-2xl border border-brand-secondary text-brand-dark py-4 font-bold text-xs uppercase tracking-widest hover:bg-brand-secondary transition-all duration-300">
            <MapPin size={14} className="text-brand-primary" />
            <span>Map</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-brand-dark overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-3 bg-brand-secondary text-brand-primary px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-soft">
            <Star size={14} fill="currentColor" />
            <span>Premium Ghanaian Braiding</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-brand-dark serif mb-12 leading-[0.9] uppercase tracking-tighter">
            Join the Queue.<br />Show Up When It’s <br />
            <span className="text-brand-primary italic">Almost Your Turn.</span>
          </h1>
          <p className="text-lg font-medium text-brand-muted max-w-2xl mx-auto mb-16 uppercase tracking-[0.2em] leading-relaxed">
            The Modern Standard for African Braiding. Ghana's First Location-Aware Walk-In Operations System.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <Link to="/join" className="bg-gradient-premium text-white px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:shadow-premium transition-all duration-500 transform hover:-translate-y-1 flex items-center justify-center group">
              Join Queue <ArrowRight className="ml-3 transform group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link to="/catalogue" className="bg-white text-brand-dark border border-brand-secondary px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all duration-500 flex items-center justify-center">
              View Inspo
            </Link>
          </div>
        </div>

        {/* High contrast blurs */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px]"></div>
      </section>

      {/* Branches Section */}
      <section className="py-32 bg-brand-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-brand-dark serif uppercase tracking-tighter">Select A Branch</h2>
            <p className="text-brand-muted font-bold uppercase tracking-[0.3em] text-[10px] mt-4">Real-time capacity tracking across Ghana</p>
            <div className="w-24 h-1 bg-brand-primary mx-auto mt-8 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <BranchCard 
              branch={Branch.MADINA} 
              phone="0598911140" 
              mapUrl="https://maps.app.goo.gl/134RG9bQsXpPSetC9" 
            />
            <BranchCard 
              branch={Branch.ACCRA} 
              phone="0207913529" 
              mapUrl="https://maps.app.goo.gl/oEpmZwtByy2AiTXZA" 
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-brand-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32">
            <h2 className="text-6xl font-black serif uppercase tracking-tighter text-brand-primary">How We Operate</h2>
            <p className="text-brand-muted font-bold uppercase tracking-[0.4em] text-[10px] mt-6">A New Standard of Professionalism</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Register Remote',
                desc: 'Select your style, length and branch. No physical walk-in required to secure your position.'
              },
              {
                step: '02',
                title: 'Track Location',
                desc: 'Watch the queue move in real-time. Our system calculates your leave-time based on your GPS distance.'
              },
              {
                step: '03',
                title: 'Head to Chair',
                desc: "Arrive only when prompted. Your stylist will be ready for immediate service upon arrival."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-12 rounded-3xl bg-white/5 border border-white/10 hover:bg-brand-primary group transition-all duration-500 hover:-translate-y-2">
                <div className="text-5xl font-black mb-8 text-brand-primary group-hover:text-white transition-colors serif italic opacity-50">{item.step}</div>
                <h4 className="text-2xl font-black serif mb-6 uppercase tracking-tighter group-hover:text-white transition-colors">{item.title}</h4>
                <p className="text-gray-400 font-medium text-sm leading-relaxed uppercase tracking-wider group-hover:text-white transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-primary/5 blur-[150px] rounded-full"></div>
      </section>

      {/* Value Prop */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-premium rounded-[3rem] p-16 md:p-32 text-white flex flex-col md:flex-row items-center justify-between shadow-premium relative overflow-hidden">
            <div className="md:w-3/5 mb-16 md:mb-0 relative z-10">
              <h2 className="text-6xl md:text-8xl font-black serif mb-12 uppercase leading-[0.9] tracking-tighter">Artistry & Efficiency.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  'Zero Salon Congestion',
                  'Precision Time Estimates',
                  'Strict Fairness Protocols',
                  'Elite Northern Artistry'
                ].map((txt, i) => (
                  <div key={i} className="flex items-center space-x-4 group">
                    <div className="p-2 bg-white/20 rounded-full group-hover:bg-white transition-colors duration-300">
                      <CheckCircle2 className="text-white group-hover:text-brand-primary transition-colors duration-300" size={20} />
                    </div>
                    <span className="text-lg font-bold uppercase tracking-widest">{txt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/3 text-center md:text-right relative z-10">
               <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <p className="text-white text-lg font-medium uppercase tracking-wider mb-8 italic leading-relaxed">"Professional, fast, and the live tracking is a game-changer for my Saturdays."</p>
                 <p className="font-black text-white uppercase tracking-[0.3em] text-xs opacity-60">— Premium Client</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

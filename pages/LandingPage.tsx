
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
      return <div className="bg-brand-red text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">Closed - Pre-join</div>;
    }
    return <div className="bg-brand-pink text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center">
      <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-ping"></div>
      Open Now
    </div>;
  };

  return (
    <div className="bg-white rounded-none p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] border-2 border-black transition-all hover:shadow-[20px_20px_0px_0px_rgba(190,24,93,1)] group">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-3xl font-black serif text-black uppercase tracking-tighter">{branch}</h3>
          <div className="flex items-center text-gray-400 mt-2 font-black uppercase text-[10px] tracking-widest">
            <MapPin size={12} className="mr-1.5" />
            <span>Northern Ghana Specialists</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 border-2 border-black text-center group-hover:bg-black group-hover:text-white transition-colors">
          <p className="text-[10px] uppercase font-black tracking-widest mb-2 opacity-50">In Queue</p>
          <p className="text-4xl font-black">{status.peopleWaiting}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black text-center group-hover:bg-brand-pink group-hover:text-white group-hover:border-brand-pink transition-colors">
          <p className="text-[10px] uppercase font-black tracking-widest mb-2 opacity-50">Now At</p>
          <p className="text-4xl font-black">{status.isPhysicallyOpen ? `#${status.nowServing}` : '--'}</p>
        </div>
      </div>

      {!status.isPhysicallyOpen && (
        <p className="text-xs text-brand-red mb-6 font-black uppercase tracking-widest">
          <AlertCircle size={14} className="inline mr-1" />
          {status.nextOpeningText}
        </p>
      )}

      <div className="space-y-4">
        <Link 
          to={`/join?branch=${branch}`} 
          className={`block w-full text-center py-5 font-black transition-all uppercase text-xs tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-1 active:translate-y-1 ${
            status.isPhysicallyOpen 
              ? 'bg-black text-white hover:bg-brand-pink' 
              : 'bg-brand-pink text-white hover:brightness-110'
          }`}
        >
          {status.isPhysicallyOpen ? 'Join Live Queue' : 'Pre-join for Tomorrow'}
        </Link>
        <div className="grid grid-cols-2 gap-4">
          <a href={`tel:${phone}`} className="flex items-center justify-center space-x-2 border-2 border-black text-black py-4 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all">
            <Phone size={14} />
            <span>Call</span>
          </a>
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center space-x-2 border-2 border-black text-black py-4 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all">
            <MapPin size={14} />
            <span>Map</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white text-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-pink text-white px-6 py-2 rounded-none text-xs font-black uppercase tracking-[0.3em] mb-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Star size={14} fill="currentColor" />
            <span>Premium Ghanaian Braiding</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-black serif mb-12 leading-[0.8] uppercase tracking-tighter">
            Join the Queue.<br />Show Up When It’s <br />
            <span className="text-brand-pink">Almost Your Turn.</span>
          </h1>
          <p className="text-xl font-bold text-gray-500 max-w-2xl mx-auto mb-16 uppercase tracking-widest text-sm">
            The Modern Standard for African Braiding. Ghana's First Location-Aware Walk-In Operations System.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <Link to="/join" className="bg-black text-white px-12 py-6 rounded-none text-xs font-black uppercase tracking-[0.4em] hover:bg-brand-pink transition-all transform shadow-[8px_8px_0px_0px_rgba(190,24,93,1)] hover:shadow-none flex items-center justify-center">
              Join Queue <ArrowRight className="ml-3" size={18} />
            </Link>
            <Link to="/catalogue" className="bg-white text-black border-4 border-black px-12 py-6 rounded-none text-xs font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all flex items-center justify-center">
              View Inspo
            </Link>
          </div>
        </div>

        {/* High contrast blurs - Updated to new pink tint */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-black/5 rounded-full blur-[120px]"></div>
      </section>

      {/* Branches Section */}
      <section className="py-32 bg-white border-y-[10px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-5xl font-black text-black serif uppercase tracking-tighter">Select A Branch</h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">Real-time capacity tracking across Ghana</p>
            </div>
            <div className="h-0.5 bg-black flex-grow mx-12 hidden md:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl mx-auto">
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
      <section className="py-32 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-32">
            <h2 className="text-6xl font-black serif uppercase tracking-tighter text-brand-pink">How We Operate</h2>
            <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs mt-6">A New Standard of Professionalism</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-white/20">
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
              <div key={idx} className={`p-16 border-white/20 ${idx !== 2 ? 'md:border-r-2' : ''} hover:bg-brand-pink group transition-colors duration-500`}>
                <div className="text-6xl font-black mb-10 text-brand-pink group-hover:text-black transition-colors">{item.step}</div>
                <h4 className="text-3xl font-black serif mb-6 uppercase tracking-tighter group-hover:text-black transition-colors">{item.title}</h4>
                <p className="text-gray-500 font-bold text-sm leading-relaxed uppercase tracking-wider group-hover:text-white transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-pink p-16 md:p-32 text-white flex flex-col md:flex-row items-center justify-between shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
            <div className="md:w-3/5 mb-16 md:mb-0">
              <h2 className="text-6xl md:text-8xl font-black serif mb-12 uppercase leading-[0.8] tracking-tighter">Artistry & Efficiency.</h2>
              <div className="space-y-6">
                {[
                  'Zero Salon Congestion',
                  'Precision Time Estimates',
                  'Strict Fairness Protocols',
                  'Elite Northern Artistry'
                ].map((txt, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <CheckCircle2 className="text-black" size={24} />
                    <span className="text-xl font-black uppercase tracking-widest">{txt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
               <div className="bg-black p-10 rotate-3 shadow-2xl">
                 <p className="text-white text-lg font-black uppercase tracking-wider mb-8 italic">"Professional, fast, and the live tracking is a game-changer for my Saturdays."</p>
                 <p className="font-black text-brand-pink uppercase tracking-[0.3em] text-sm">— Premium Client</p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, CreditCard, ChevronRight, X } from 'lucide-react';
import { useApp } from '../store';
import { Style } from '../types';
import { CATEGORIES } from '../constants';

const StyleDetailModal: React.FC<{ style: Style, onClose: () => void }> = ({ style, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-premium overflow-hidden relative animate-in zoom-in duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 z-10 p-3 bg-brand-secondary text-brand-dark rounded-full hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-soft">
          <X size={24} />
        </button>
        
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-1/2 bg-brand-secondary">
            <img src={style.images[0]} className="w-full h-96 md:h-full object-cover" alt={style.name} />
          </div>
          <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-between">
            <div>
              <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">{style.category}</span>
              <h2 className="text-4xl lg:text-5xl font-black serif text-brand-dark uppercase tracking-tighter leading-[1.1] mb-8">{style.name}</h2>
              <p className="text-brand-muted font-medium text-sm leading-relaxed mb-10 uppercase tracking-widest">{style.description}</p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="flex items-center space-x-4 p-4 bg-brand-secondary/50 rounded-2xl">
                  <div className="p-2 bg-white rounded-full shadow-soft">
                    <Clock size={18} className="text-brand-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Duration</span>
                    <span className="text-xs font-black text-brand-dark uppercase tracking-widest">{style.durationMinutes} Mins</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-brand-secondary/50 rounded-2xl">
                  <div className="p-2 bg-white rounded-full shadow-soft">
                    <CreditCard size={18} className="text-brand-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Starting At</span>
                    <span className="text-xs font-black text-brand-dark uppercase tracking-widest">{style.priceRange.split('-')[0]}</span>
                  </div>
                </div>
              </div>
              <div className="bg-brand-dark text-white p-8 rounded-3xl border-l-8 border-brand-primary shadow-premium">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Supply Requirements</p>
                <p className="text-[10px] font-bold tracking-widest leading-relaxed uppercase opacity-80">{style.recommendedExtensions}</p>
              </div>
            </div>
            
            <Link 
              to={`/join?style=${style.id}`} 
              className="w-full bg-gradient-premium text-white text-center py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all duration-500 mt-12 transform hover:-translate-y-1"
            >
              Select Style
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CataloguePage: React.FC = () => {
  const { styles } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const filteredStyles = styles.filter(s => {
    const matchesFilter = filter === 'All' || s.category === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch && !s.hidden;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-brand-secondary/30 py-32 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="w-20 h-1 bg-brand-primary mx-auto mb-10 rounded-full"></div>
          <h1 className="text-7xl md:text-9xl font-black serif text-brand-dark uppercase tracking-tighter leading-none mb-8">Braids Inspo</h1>
          <p className="text-brand-muted font-bold uppercase tracking-[0.4em] text-[10px] max-w-2xl mx-auto">Elite Northern Ghana Artistry Catalogue. Choose Your Signature Look.</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none">
           <span className="text-[300px] font-black serif">ARTISTRY</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 mb-24 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-6 flex flex-col lg:flex-row gap-6 shadow-premium border border-brand-secondary">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
            <input
              type="text"
              placeholder="SEARCH CATALOGUE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-brand-secondary/30 rounded-2xl font-bold uppercase text-xs tracking-widest outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all border border-transparent focus:border-brand-primary/30"
            />
          </div>
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide px-2">
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                  filter === cat 
                    ? 'bg-brand-primary text-white shadow-premium transform -translate-y-1' 
                    : 'bg-brand-secondary/50 text-brand-dark hover:bg-brand-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filteredStyles.map(style => (
            <div 
              key={style.id} 
              className="bg-white rounded-[2rem] overflow-hidden group cursor-pointer shadow-soft hover:shadow-premium transition-all duration-500 border border-brand-secondary hover:-translate-y-2"
              onClick={() => setSelectedStyle(style)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-brand-secondary">
                <img 
                  src={style.images[0]} 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" 
                  alt={style.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                   <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center">
                     View Details <ChevronRight size={14} className="ml-2" />
                   </span>
                </div>
                {(style.featured || style.trending) && (
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {style.featured && <span className="bg-brand-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-premium">Featured</span>}
                    {style.trending && <span className="bg-brand-dark text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-md">Trending</span>}
                  </div>
                )}
              </div>
              <div className="p-8">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3 block">{style.category}</span>
                <h3 className="text-2xl font-black text-brand-dark serif uppercase tracking-tighter leading-tight mb-6 group-hover:text-brand-primary transition-colors">{style.name}</h3>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-muted mb-8">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-brand-primary" />
                    <span>~{style.durationMinutes}M</span>
                  </div>
                  <div className="text-brand-dark">
                    {style.priceRange.split('-')[0].trim()}
                  </div>
                </div>
                <button className="w-full flex items-center justify-center space-x-3 bg-brand-secondary/50 text-brand-dark py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  <span>Explore Style</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStyles.length === 0 && (
          <div className="text-center py-40 rounded-[3rem] border-2 border-dashed border-brand-secondary">
            <div className="bg-brand-secondary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 text-brand-primary shadow-soft">
              <Search size={40} />
            </div>
            <h3 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter">Zero Results</h3>
            <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-4">Adjust filters for operations availability</p>
          </div>
        )}
      </div>

      {selectedStyle && <StyleDetailModal style={selectedStyle} onClose={() => setSelectedStyle(null)} />}
    </div>
  );
};

export default CataloguePage;

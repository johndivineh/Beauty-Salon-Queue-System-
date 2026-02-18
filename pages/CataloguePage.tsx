
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, CreditCard, ChevronRight, X } from 'lucide-react';
import { useApp } from '../store';
import { Style } from '../types';
import { CATEGORIES } from '../constants';

const StyleDetailModal: React.FC<{ style: Style, onClose: () => void }> = ({ style, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-none border-4 border-white overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-3 bg-black text-white hover:bg-brand-pink transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-1/2 bg-black">
            <img src={style.images[0]} className="w-full h-96 md:h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={style.name} />
          </div>
          <div className="md:w-1/2 p-12 flex flex-col justify-between">
            <div>
              <span className="text-brand-pink text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">{style.category}</span>
              <h2 className="text-5xl font-black serif text-black uppercase tracking-tighter leading-[0.9] mb-8">{style.name}</h2>
              <p className="text-gray-500 font-bold text-sm leading-relaxed mb-10 uppercase tracking-widest">{style.description}</p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest text-black">
                  <Clock size={20} className="text-brand-pink" />
                  <span>Duration: {style.durationMinutes} Mins</span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest text-black">
                  <CreditCard size={20} className="text-brand-pink" />
                  <span>Fare: {style.priceRange}</span>
                </div>
                <div className="bg-black text-white p-6 border-l-8 border-brand-pink">
                  <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-2">Supply Req.</p>
                  <p className="text-[10px] font-bold tracking-widest leading-relaxed uppercase">{style.recommendedExtensions}</p>
                </div>
              </div>
            </div>
            
            <Link 
              to={`/join?style=${style.id}`} 
              className="w-full bg-black text-white text-center py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[8px_8px_0px_0px_rgba(190,24,93,1)] hover:bg-brand-pink transition-all"
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
      <div className="bg-black text-white py-32 px-4 border-b-[12px] border-brand-pink relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-7xl md:text-9xl font-black serif uppercase tracking-tighter leading-none mb-8">Braids Inspo</h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs max-w-2xl mx-auto">Elite Northern Ghana Artistry Catalogue. Choose Your Signature Look.</p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <span className="text-[200px] font-black serif select-none">BAR</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 mb-20 relative z-10">
        <div className="bg-white border-4 border-black p-4 flex flex-col md:flex-row gap-6 shadow-[20px_20px_0px_0px_rgba(190,24,93,0.1)]">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={24} />
            <input
              type="text"
              placeholder="SEARCH CATALOGUE"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border-2 border-black font-black uppercase text-sm tracking-widest outline-none focus:bg-black focus:text-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-5 font-black text-[10px] uppercase tracking-widest whitespace-nowrap border-2 border-black transition-all ${
                  filter === cat 
                    ? 'bg-brand-pink text-white border-brand-pink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white text-black hover:bg-black hover:text-white'
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
              className="bg-white border-2 border-black overflow-hidden group cursor-pointer hover:border-brand-pink transition-all"
              onClick={() => setSelectedStyle(style)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black">
                <img 
                  src={style.images[0]} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" 
                  alt={style.name} 
                />
                {(style.featured || style.trending) && (
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {style.featured && <span className="bg-brand-pink text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest shadow-lg">Featured</span>}
                    {style.trending && <span className="bg-black text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest border border-white/20">Trending</span>}
                  </div>
                )}
              </div>
              <div className="p-8">
                <span className="text-[10px] font-black text-brand-pink uppercase tracking-[0.4em] mb-2 block">{style.category}</span>
                <h3 className="text-2xl font-black text-black serif uppercase tracking-tighter leading-none mb-6">{style.name}</h3>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-black" />
                    <span>~{style.durationMinutes}M</span>
                  </div>
                  <div className="text-black">
                    {style.priceRange.split('-')[0].trim()}
                  </div>
                </div>
                <button className="w-full flex items-center justify-center space-x-3 bg-black text-white py-4 font-black text-[10px] uppercase tracking-[0.3em] group-hover:bg-brand-pink transition-colors">
                  <span>Details</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStyles.length === 0 && (
          <div className="text-center py-40 border-4 border-dashed border-gray-100">
            <div className="bg-black w-24 h-24 rounded-none flex items-center justify-center mx-auto mb-10 text-brand-pink">
              <Search size={40} />
            </div>
            <h3 className="text-4xl font-black serif text-black uppercase tracking-tighter">Zero Results</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-4">Adjust filters for operations availability</p>
          </div>
        )}
      </div>

      {selectedStyle && <StyleDetailModal style={selectedStyle} onClose={() => setSelectedStyle(null)} />}
    </div>
  );
};

export default CataloguePage;

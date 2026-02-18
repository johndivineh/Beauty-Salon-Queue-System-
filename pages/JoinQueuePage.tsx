
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ShoppingBag, Info, Loader2, AlertCircle, CalendarX } from 'lucide-react';
import { useApp } from '../store';
import { Branch, ExtensionToggle } from '../types';
import { CATEGORIES } from '../constants';

const JoinQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { styles, inventory, addQueueEntry, getBranchStatus } = useApp();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: (searchParams.get('branch') as Branch) || Branch.MADINA,
    customerName: '',
    phoneNumber: '',
    category: CATEGORIES[0],
    styleId: '',
    length: 'Medium',
    bringingOwnExtensions: true,
    selectedExtensions: [] as string[],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredStyles = styles.filter(s => s.category === formData.category);

  const isValidPhone = (phone: string) => {
    const validPrefixes = ['020', '050', '024', '025', '054', '055', '059', '027', '057'];
    const hasValidPrefix = validPrefixes.some(prefix => phone.startsWith(prefix));
    return phone.length === 10 && /^\d+$/.test(phone) && hasValidPrefix;
  };

  useEffect(() => {
    if (filteredStyles.length > 0 && !formData.styleId) {
       setFormData(prev => ({ ...prev, styleId: filteredStyles[0].id }));
    }
  }, [formData.category, filteredStyles]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidPhone(formData.phoneNumber)) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const entry = addQueueEntry({
        branch: formData.branch,
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        styleId: formData.styleId,
        length: formData.length,
        bringingOwnExtensions: formData.bringingOwnExtensions,
        selectedExtensions: formData.selectedExtensions,
        notes: formData.notes
      });
      
      setIsSubmitting(false);
      
      if (entry) {
        navigate(`/track?id=${entry.id}`);
      } else {
        setError("Something went wrong joining the queue. Please try again.");
      }
    }, 1500);
  };

  const selectedStyle = styles.find(s => s.id === formData.styleId);
  const phoneError = formData.phoneNumber.length > 0 && !isValidPhone(formData.phoneNumber);

  return (
    <div className="bg-white min-h-screen py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-black serif text-black uppercase tracking-tighter">Register</h1>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Step {step} / 5</span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-none overflow-hidden">
            <div 
              className="bg-brand-pink h-full transition-all duration-700" 
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-brand-red text-white rounded-none flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle size={24} />
            <p className="font-black text-xs uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-none border-4 border-black p-10 shadow-[20px_20px_0px_0px_rgba(190,24,93,1)]">
          {/* Step 1: Branch */}
          {step === 1 && (
            <div className="space-y-10">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-black">Choose Branch</h2>
              <div className="grid grid-cols-1 gap-6">
                {[Branch.MADINA, Branch.ACCRA].map((b) => {
                  const status = getBranchStatus(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => { setFormData({ ...formData, branch: b }); handleNext(); }}
                      className={`p-8 border-4 text-left transition-all flex justify-between items-center ${
                        formData.branch === b 
                          ? 'border-brand-pink bg-black text-white' 
                          : 'border-black hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="font-black text-xl uppercase tracking-tighter">{b}</p>
                          {!status.isPhysicallyOpen && (
                            <span className="text-[10px] bg-brand-pink text-white px-2 py-1 font-black uppercase tracking-widest">Pre-join</span>
                          )}
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${formData.branch === b ? 'text-brand-pink' : 'text-gray-400'}`}>Professional Northern Braiders</p>
                      </div>
                      {formData.branch === b && <Check className="text-brand-pink" size={24} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Customer Details */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-black">Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-5 bg-white border-2 border-black rounded-none focus:bg-brand-pink focus:text-white transition-colors outline-none text-black font-black text-lg placeholder:text-gray-200"
                    placeholder="ENTER NAME"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phoneNumber: val });
                    }}
                    className={`w-full p-5 bg-white border-2 rounded-none focus:bg-black focus:text-white transition-colors outline-none text-black font-black text-lg placeholder:text-gray-200 ${
                      phoneError ? 'border-brand-red' : 'border-black'
                    }`}
                    placeholder="024XXXXXXX"
                  />
                  {phoneError ? (
                    <p className="mt-3 text-brand-red text-[10px] font-black uppercase tracking-widest flex items-center">
                      <AlertCircle size={12} className="mr-1.5" />
                      Invalid Ghana Network Prefix
                    </p>
                  ) : (
                    <p className="mt-3 text-gray-300 text-[9px] font-black uppercase tracking-widest">MTN / VODA / AIRTEL-TIGO ONLY</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={!formData.customerName || !isValidPhone(formData.phoneNumber)}
                onClick={handleNext}
                className="w-full bg-black text-white py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(190,24,93,1)] disabled:opacity-20 mt-10"
              >
                Proceed
              </button>
            </div>
          )}

          {/* Step 3: Braid Selection */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-black">Service</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, styleId: '' })}
                    className="w-full p-5 bg-white border-2 border-black rounded-none font-black text-black uppercase tracking-widest outline-none appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Style</label>
                  <select
                    value={formData.styleId}
                    onChange={(e) => setFormData({ ...formData, styleId: e.target.value })}
                    className="w-full p-5 bg-white border-2 border-black rounded-none font-black text-black uppercase tracking-widest outline-none appearance-none"
                  >
                    {filteredStyles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Desired Length</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Short', 'Medium', 'Long'].map(len => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setFormData({ ...formData, length: len })}
                        className={`py-4 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                          formData.length === len 
                            ? 'bg-brand-pink text-white border-brand-pink' 
                            : 'bg-white text-black border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border-2 border-black py-6 font-black text-xs uppercase tracking-[0.3em]">Back</button>
                <button type="button" onClick={handleNext} className="flex-[2] bg-black text-white py-6 font-black text-xs uppercase tracking-[0.3em] shadow-[6px_6px_0px_0px_rgba(190,24,93,1)]">Continue</button>
              </div>
            </div>
          )}

          {/* Step 4: Extensions */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-black">Hair Supply</h2>
              <div className="p-6 bg-black text-white flex items-start space-x-4 border-b-8 border-brand-pink">
                <Info size={20} className="shrink-0 text-brand-pink mt-1" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Recommended: {selectedStyle?.recommendedExtensions}
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Self-Hair Supply?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bringingOwnExtensions: true })}
                    className={`py-5 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                      formData.bringingOwnExtensions 
                        ? 'bg-black text-white border-black' 
                        : 'border-black text-black'
                    }`}
                  >
                    YES (I'm bringing)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bringingOwnExtensions: false })}
                    className={`py-5 border-2 font-black text-xs uppercase tracking-widest transition-all ${
                      !formData.bringingOwnExtensions 
                        ? 'bg-brand-pink text-white border-brand-pink' 
                        : 'border-black text-black'
                    }`}
                  >
                    NO (Provide for me)
                  </button>
                </div>

                {!formData.bringingOwnExtensions && (
                  <div className="pt-6 space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Availability</p>
                    <div className="space-y-2">
                      {inventory.map(item => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-5 border-2 border-black group hover:bg-black transition-colors"
                        >
                          <div>
                            <p className="font-black text-xs text-black group-hover:text-white uppercase tracking-widest">{item.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">GHS {item.price} / PACK</p>
                          </div>
                          <ShoppingBag size={18} className="text-brand-pink" />
                        </div>
                      ))}
                      <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest mt-4">* Selection finalized in-chair</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border-2 border-black py-6 font-black text-xs uppercase tracking-[0.3em]">Back</button>
                <button type="button" onClick={handleNext} className="flex-[2] bg-black text-white py-6 font-black text-xs uppercase tracking-[0.3em] shadow-[6px_6px_0px_0px_rgba(190,24,93,1)]">Confirm</button>
              </div>
            </div>
          )}

          {/* Step 5: Notes & Confirm */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-black">Review</h2>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Notes / Special Requests</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-5 bg-white border-2 border-black rounded-none outline-none font-black text-sm uppercase tracking-widest placeholder:text-gray-200"
                  placeholder="SCALP SENSITIVITY, COLOR MIX, ETC."
                />
              </div>

              <div className="bg-black text-white p-8 border-r-8 border-brand-pink">
                <h3 className="text-xs font-black text-brand-pink mb-6 uppercase tracking-[0.4em]">Final Summary</h3>
                <div className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-gray-400">Style</span>
                    <span className="text-white">{selectedStyle?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-gray-400">Branch</span>
                    <span className="text-white">{formData.branch}</span>
                  </div>
                  <div className="flex justify-between text-brand-pink text-sm">
                    <span>Base Fare</span>
                    <span>GHS {selectedStyle?.basePrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border-2 border-black py-6 font-black text-xs uppercase tracking-[0.3em]">Back</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] bg-brand-pink text-white py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Finalize Queue</span>}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-12 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
          By proceeding, you adhere to the <Link to="/policies" className="underline text-black hover:text-brand-pink">Northern Bar Operations Policies</Link>.
        </div>
      </div>
    </div>
  );
};

export default JoinQueuePage;

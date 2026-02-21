
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, ShoppingBag, Info, Loader2, AlertCircle, CalendarX, MapPin, Settings } from 'lucide-react';
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
  const [locationStatus, setLocationStatus] = useState<'checking' | 'prompt' | 'granted' | 'denied'>('checking');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    try {
      // @ts-ignore - permissions API might not be fully typed in all environments
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      const updateStatus = (status: PermissionState) => {
        if (status === 'granted') setLocationStatus('granted');
        else if (status === 'denied') setLocationStatus('denied');
        else setLocationStatus('prompt');
      };

      updateStatus(permission.state);
      permission.onchange = () => updateStatus(permission.state);

      if (permission.state === 'granted') {
        syncLocation();
      }
    } catch (e) {
      // Fallback if permissions API is not supported
      setLocationStatus('prompt');
    }
  };

  const syncLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setError("Failed to sync location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    checkLocationPermission();
  }, []);

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

  if (locationStatus === 'checking') {
    return (
      <div className="bg-brand-secondary/20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Initializing Ops Sync...</p>
        </div>
      </div>
    );
  }

  if (locationStatus === 'prompt' || locationStatus === 'denied') {
    return (
      <div className="bg-brand-secondary/20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-premium border border-brand-secondary text-center">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-10">
            <MapPin className="text-brand-primary" size={40} />
          </div>
          <h2 className="text-3xl font-black serif text-brand-dark uppercase tracking-tighter mb-6">Location Sync Required</h2>
          <p className="text-brand-muted font-medium uppercase tracking-widest text-xs leading-relaxed mb-10">
            {locationStatus === 'denied' 
              ? "Location access is blocked. To join the queue and receive real-time leave prompts, please enable location permissions in your browser settings for this site."
              : "We use your location to calculate exactly when you should leave home based on traffic and queue movement."}
          </p>
          
          {locationStatus === 'denied' ? (
            <div className="space-y-6">
              <div className="bg-brand-secondary/30 p-6 rounded-2xl text-left border border-brand-secondary">
                <p className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-4 flex items-center">
                  <Settings size={14} className="mr-2" /> How to unblock:
                </p>
                <ol className="text-[9px] font-bold text-brand-muted uppercase tracking-widest space-y-2 list-decimal ml-4">
                  <li>Click the lock icon in your browser's address bar</li>
                  <li>Toggle "Location" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-brand-dark text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <button 
              onClick={syncLocation}
              className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1"
            >
              Allow & Sync Location
            </button>
          )}
          
          <Link to="/" className="block mt-8 text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-brand-primary transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-secondary/20 min-h-screen py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter">Register</h1>
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Step {step} / 5</span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden shadow-soft">
            <div 
              className="bg-gradient-premium h-full transition-all duration-700 rounded-full" 
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-brand-primary text-white rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-premium">
            <AlertCircle size={24} />
            <p className="font-bold text-xs uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-brand-secondary relative overflow-hidden">
          {/* Step 1: Branch */}
          {step === 1 && (
            <div className="space-y-10">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-brand-dark">Choose Branch</h2>
              <div className="grid grid-cols-1 gap-6">
                {[Branch.MADINA, Branch.ACCRA].map((b) => {
                  const status = getBranchStatus(b);
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => { setFormData({ ...formData, branch: b }); handleNext(); }}
                      className={`p-8 rounded-2xl border-2 text-left transition-all duration-300 flex justify-between items-center group ${
                        formData.branch === b 
                          ? 'border-brand-primary bg-brand-dark text-white shadow-premium' 
                          : 'border-brand-secondary bg-brand-secondary/30 hover:bg-brand-secondary'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="font-black text-xl uppercase tracking-tighter serif">{b}</p>
                          {!status.isPhysicallyOpen && (
                            <span className="text-[9px] bg-brand-primary text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Pre-join</span>
                          )}
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${formData.branch === b ? 'text-brand-primary' : 'text-brand-muted'}`}>Professional Northern Braiders</p>
                      </div>
                      {formData.branch === b ? (
                        <div className="p-2 bg-brand-primary rounded-full">
                          <Check className="text-white" size={20} />
                        </div>
                      ) : (
                        <ChevronRight className="text-brand-muted group-hover:text-brand-primary transition-colors" size={24} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Customer Details */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-brand-dark">Your Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-brand-dark font-bold text-lg placeholder:text-brand-muted/40"
                    placeholder="ENTER NAME"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phoneNumber: val });
                    }}
                    className={`w-full p-5 bg-brand-secondary/30 border rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-brand-dark font-bold text-lg placeholder:text-brand-muted/40 ${
                      phoneError ? 'border-brand-primary' : 'border-transparent'
                    }`}
                    placeholder="024XXXXXXX"
                  />
                  {phoneError ? (
                    <p className="mt-3 text-brand-primary text-[10px] font-bold uppercase tracking-widest flex items-center">
                      <AlertCircle size={12} className="mr-1.5" />
                      Invalid Ghana Network Prefix
                    </p>
                  ) : (
                    <p className="mt-3 text-brand-muted text-[9px] font-bold uppercase tracking-widest">MTN / VODA / AIRTEL-TIGO ONLY</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={!formData.customerName || !isValidPhone(formData.phoneNumber)}
                onClick={handleNext}
                className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium disabled:opacity-20 mt-10 transition-all duration-300 transform hover:-translate-y-1"
              >
                Proceed
              </button>
            </div>
          )}

          {/* Step 3: Braid Selection */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-brand-dark">Service Selection</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Category</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, styleId: '' })}
                      className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold text-brand-dark uppercase tracking-widest outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-brand-muted pointer-events-none" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Style</label>
                  <div className="relative">
                    <select
                      value={formData.styleId}
                      onChange={(e) => setFormData({ ...formData, styleId: e.target.value })}
                      className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold text-brand-dark uppercase tracking-widest outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    >
                      {filteredStyles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-brand-muted pointer-events-none" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Desired Length</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Short', 'Medium', 'Long'].map(len => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setFormData({ ...formData, length: len })}
                        className={`py-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                          formData.length === len 
                            ? 'bg-brand-primary text-white border-brand-primary shadow-soft' 
                            : 'bg-brand-secondary/30 text-brand-dark border-transparent hover:bg-brand-secondary'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border border-brand-secondary rounded-2xl py-6 font-black text-xs uppercase tracking-[0.3em] text-brand-dark hover:bg-brand-secondary transition-all">Back</button>
                <button type="button" onClick={handleNext} className="flex-[2] bg-brand-dark text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1">Continue</button>
              </div>
            </div>
          )}

          {/* Step 4: Extensions */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-brand-dark">Hair Supply</h2>
              <div className="p-6 bg-brand-secondary/50 rounded-2xl flex items-start space-x-4 border-l-4 border-brand-primary shadow-soft">
                <div className="p-2 bg-white rounded-full shadow-soft">
                  <Info size={18} className="shrink-0 text-brand-primary" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-brand-dark pt-1">
                  Recommended: {selectedStyle?.recommendedExtensions}
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">Self-Hair Supply?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bringingOwnExtensions: true })}
                    className={`py-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      formData.bringingOwnExtensions 
                        ? 'bg-brand-dark text-white border-brand-dark shadow-premium' 
                        : 'border-brand-secondary text-brand-dark hover:bg-brand-secondary/30'
                    }`}
                  >
                    YES (I'm bringing)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bringingOwnExtensions: false })}
                    className={`py-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      !formData.bringingOwnExtensions 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-premium' 
                        : 'border-brand-secondary text-brand-dark hover:bg-brand-secondary/30'
                    }`}
                  >
                    NO (Provide for me)
                  </button>
                </div>

                {!formData.bringingOwnExtensions && (
                  <div className="pt-6 space-y-4">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Inventory Availability</p>
                    <div className="space-y-3">
                      {inventory.map(item => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-5 rounded-2xl bg-brand-secondary/30 border border-transparent hover:border-brand-primary/30 transition-all group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                              <ShoppingBag size={18} className="text-brand-primary" />
                            </div>
                            <div>
                              <p className="font-black text-xs text-brand-dark uppercase tracking-widest">{item.name}</p>
                              <p className="text-[9px] text-brand-muted font-bold uppercase tracking-[0.2em] mt-1">GHS {item.price} / PACK</p>
                            </div>
                          </div>
                          <div className="p-2 bg-white rounded-full shadow-soft">
                            <Check className="text-brand-primary" size={14} />
                          </div>
                        </div>
                      ))}
                      <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-4 italic">* Selection finalized in-chair</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border border-brand-secondary rounded-2xl py-6 font-black text-xs uppercase tracking-[0.3em] text-brand-dark hover:bg-brand-secondary transition-all">Back</button>
                <button type="button" onClick={handleNext} className="flex-[2] bg-brand-dark text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1">Confirm</button>
              </div>
            </div>
          )}

          {/* Step 5: Notes & Confirm */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black serif uppercase tracking-tighter text-brand-dark">Final Review</h2>
              <div>
                <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Notes / Special Requests</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl outline-none font-bold text-sm uppercase tracking-widest placeholder:text-brand-muted/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  placeholder="SCALP SENSITIVITY, COLOR MIX, ETC."
                />
              </div>

              <div className="bg-brand-dark text-white p-8 rounded-3xl border-l-8 border-brand-primary shadow-premium relative overflow-hidden">
                <h3 className="text-xs font-black text-brand-primary mb-6 uppercase tracking-[0.4em]">Service Summary</h3>
                <div className="space-y-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-brand-muted">Style</span>
                    <span className="text-white">{selectedStyle?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-brand-muted">Branch</span>
                    <span className="text-white">{formData.branch}</span>
                  </div>
                  <div className="flex justify-between text-brand-primary text-sm font-black pt-2">
                    <span>Base Fare</span>
                    <span>GHS {selectedStyle?.basePrice}</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              </div>

              <div className="flex space-x-6 pt-10">
                <button type="button" onClick={handleBack} className="flex-1 border border-brand-secondary rounded-2xl py-6 font-black text-xs uppercase tracking-[0.3em] text-brand-dark hover:bg-brand-secondary transition-all">Back</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Finalize Queue</span>}
                </button>
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-secondary/20"></div>
        </form>

        <div className="mt-12 text-center text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-relaxed">
          By proceeding, you adhere to the <Link to="/policies" className="underline text-brand-dark hover:text-brand-primary transition-colors">Northern Bar Operations Policies</Link>.
        </div>
      </div>
    </div>
  );
};

export default JoinQueuePage;


import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  RefreshCw, 
  MapPin, 
  Share2, 
  CheckCircle2,
  CircleDashed,
  Phone,
  Timer,
  Car,
  LocateFixed,
  AlertCircle,
  Clock,
  Navigation2,
  Zap,
  Lock,
  ChevronRight,
  Settings,
  Loader2
} from 'lucide-react';
import { useApp } from '../store';
import { QueueStatus, Branch } from '../types';

const BRANCH_COORDS = {
  [Branch.MADINA]: { lat: 5.6700, lng: -0.1650 },
  [Branch.ACCRA]: { lat: 5.5600, lng: -0.2050 }
};

const TrackQueuePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { queue, styles } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [queueId, setQueueId] = useState(searchParams.get('id') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'prompt' | 'granted' | 'denied' | 'error'>('checking');
  const [travelTimeMinutes, setTravelTimeMinutes] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const entry = queue.find(q => q.id === queueId || (q.phoneNumber === phoneNumber && q.status !== QueueStatus.COMPLETED));
  const style = styles.find(s => s?.id === entry?.styleId);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
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
        handleRequestLocation();
      }
    } catch (e) {
      // Fallback if permissions API is not supported (e.g. Safari)
      setLocationStatus('prompt');
    }
  };

  useEffect(() => {
    if (entry) {
      checkLocationPermission();
    }
  }, [entry]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setLocationStatus('granted');
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus(error.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (userCoords && entry) {
      const branchLoc = BRANCH_COORDS[entry.branch];
      const R = 6371;
      const dLat = (branchLoc.lat - userCoords.lat) * (Math.PI / 180);
      const dLon = (branchLoc.lng - userCoords.lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userCoords.lat * (Math.PI / 180)) * Math.cos(branchLoc.lat * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      const distance = R * c; 
      setDistanceKm(Number(distance.toFixed(1)));
      const baseCommute = distance * 4;
      const trafficBuffer = baseCommute * 0.2;
      const estimatedTime = Math.ceil(baseCommute + trafficBuffer + 10);
      setTravelTimeMinutes(Math.max(15, estimatedTime)); 
    }
  }, [userCoords, entry]);

  const countdown = useMemo(() => {
    if (!entry || !entry.estimatedStartTime) return null;
    const diff = entry.estimatedStartTime.getTime() - currentTime.getTime();
    if (diff <= 0) {
      if (entry.status === QueueStatus.WAITING || entry.status === QueueStatus.ALMOST_TURN) return "READY";
      return null;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  }, [entry, currentTime]);

  const getStatusColor = (status?: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING: return 'text-black bg-gray-100';
      case QueueStatus.ALMOST_TURN: return 'text-brand-pink bg-black';
      case QueueStatus.PLEASE_ARRIVE: return 'text-white bg-brand-pink animate-pulse';
      case QueueStatus.IN_SERVICE: return 'text-white bg-black';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const getPosition = () => {
    if (!entry) return 0;
    const branchQueue = queue.filter(q => q.branch === entry.branch && (q.status === QueueStatus.WAITING || q.status === QueueStatus.ALMOST_TURN || q.status === QueueStatus.PLEASE_ARRIVE));
    const sortedQueue = branchQueue.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
    const idx = sortedQueue.findIndex(q => q.id === entry.id);
    return idx === -1 ? 0 : idx + 1;
  };

  const position = getPosition();
  const leaveTime = entry && travelTimeMinutes ? new Date(entry.estimatedStartTime.getTime() - travelTimeMinutes * 60000) : null;
  const isTimetoLeave = leaveTime && currentTime >= leaveTime;

  if (!entry) {
    return (
      <div className="bg-brand-secondary/20 min-h-screen py-20 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-premium border border-brand-secondary">
          <h1 className="text-4xl font-black serif text-brand-dark mb-4 uppercase tracking-tighter text-center">Track Turn</h1>
          <p className="text-brand-muted text-center mb-10 font-bold uppercase text-[10px] tracking-widest">Northern Bar Operations Live Access</p>
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-brand-muted mb-3 uppercase tracking-[0.3em]">Registered Mobile</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-6 bg-brand-secondary/30 rounded-2xl outline-none text-brand-dark font-black text-2xl text-center focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all border border-transparent focus:border-brand-primary/30"
                placeholder="024XXXXXXX"
              />
            </div>
            <button
              onClick={() => setIsRefreshing(true)}
              className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1"
            >
              Verify Session
            </button>
          </div>
          <p className="mt-10 text-center text-[10px] text-brand-muted font-bold uppercase tracking-widest">
            Not active? <Link to="/join" className="text-brand-primary underline">Register Slot</Link>
          </p>
        </div>
      </div>
    );
  }

  if (locationStatus === 'checking') {
    return (
      <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Syncing Ops Location...</p>
        </div>
      </div>
    );
  }

  if (locationStatus !== 'granted') {
    return (
      <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-premium text-center relative overflow-hidden">
          <div className="w-24 h-24 bg-brand-secondary rounded-full flex items-center justify-center text-brand-primary mx-auto mb-10 shadow-soft relative z-10">
             <LocateFixed size={48} />
          </div>
          <h1 className="text-4xl font-black serif text-brand-dark mb-4 uppercase tracking-tighter relative z-10">GPS Lock Required</h1>
          <p className="text-brand-muted mb-10 font-bold text-xs uppercase tracking-widest leading-relaxed relative z-10">
            {locationStatus === 'denied' 
              ? "Location access is blocked. Northern Bar operations require distance tracking to calculate your Arrival Window and prevent overcrowding."
              : "Northern Bar operations require distance tracking to calculate your Arrival Window and prevent overcrowding."}
          </p>
          
          <div className="space-y-6 relative z-10">
            {locationStatus === 'denied' ? (
              <div className="space-y-6">
                <div className="bg-brand-primary/10 text-brand-primary rounded-2xl p-6 text-left border border-brand-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center">
                    <Settings size={14} className="mr-2" /> How to unblock:
                  </p>
                  <ol className="text-[9px] font-bold uppercase tracking-widest space-y-2 list-decimal ml-4">
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
                onClick={handleRequestLocation}
                className="w-full bg-brand-dark text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium active:scale-[0.98] transition-all flex items-center justify-center"
              >
                <Zap size={18} className="text-brand-primary" />
                <span className="ml-3">Authorize Sync</span>
              </button>
            )}
            
            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest pt-6 border-t border-brand-secondary">
              Session Ticket: {entry.queueNumber}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-secondary/20 min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* Live Status Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-brand-secondary relative overflow-hidden group transition-all duration-500">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary shadow-soft">
                 <Zap size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]">Ticket ID</p>
                <h1 className="text-4xl font-black text-brand-dark tracking-tighter uppercase serif">{entry.queueNumber}</h1>
              </div>
            </div>
            <div className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center space-x-2 shadow-soft ${getStatusColor(entry.status)}`}>
              <CircleDashed size={14} className={entry.status === QueueStatus.WAITING ? 'animate-spin' : ''} />
              <span>{entry.status}</span>
            </div>
          </div>

          <div className="mb-12">
             <div className="bg-brand-dark p-12 rounded-3xl text-white shadow-premium flex flex-col items-center justify-center text-center border-l-8 border-brand-primary relative overflow-hidden">
                <div className="flex items-center space-x-3 text-brand-primary mb-6 relative z-10">
                  <Clock size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ops Countdown</span>
                </div>
                <div className="text-7xl font-black tracking-tighter relative z-10 serif italic">
                  {countdown || "GO"}
                </div>
                <p className="text-white/20 text-[9px] mt-6 font-black uppercase tracking-[0.5em] relative z-10">
                  Server Synced: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-brand-secondary/30 p-8 rounded-2xl text-center border border-transparent hover:border-brand-primary/20 transition-all">
              <p className="text-[10px] text-brand-muted uppercase font-black tracking-widest mb-3">Position</p>
              <p className="text-5xl font-black text-brand-dark serif">{position > 0 ? position : '--'}</p>
            </div>
            <div className="bg-brand-secondary/30 p-8 rounded-2xl text-center border border-transparent hover:border-brand-primary/20 transition-all">
              <p className="text-[10px] text-brand-muted uppercase font-black tracking-widest mb-3">Start Est.</p>
              <p className="text-3xl font-black text-brand-primary serif">
                {entry.estimatedStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Commute Plan Section */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-brand-secondary relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Car className="text-brand-primary" size={28} />
              </div>
              <h2 className="text-2xl font-black serif text-brand-dark uppercase tracking-tighter">Commute Plan</h2>
            </div>
            <div className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center shadow-soft">
               <LocateFixed size={14} className="mr-2" />
               GPS ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${isTimetoLeave ? 'bg-brand-primary text-white border-brand-primary shadow-premium' : 'bg-brand-secondary/30 border-transparent'}`}>
              <p className={`text-[10px] uppercase font-black tracking-widest mb-4 ${isTimetoLeave ? 'text-white/70' : 'text-brand-muted'}`}>Leave House By</p>
              <p className={`text-6xl font-black serif italic ${isTimetoLeave ? 'animate-pulse' : 'text-brand-dark'}`}>
                {leaveTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="mt-6 inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest">
                 {isTimetoLeave ? (
                   <span className="bg-brand-dark text-white px-4 py-1.5 rounded-full shadow-soft">DEPART IMMEDIATELY</span>
                 ) : (
                   <span className="text-brand-muted bg-white/50 px-4 py-1.5 rounded-full">WAITING MODE</span>
                 )}
              </div>
            </div>
            <div className="bg-brand-secondary/10 p-8 flex flex-col justify-center rounded-3xl border border-brand-secondary border-dashed">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Radius</span>
                <span className="text-sm font-black text-brand-dark">{distanceKm} KM</span>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Est. Trip</span>
                <span className="text-sm font-black text-brand-dark">{travelTimeMinutes} MINS</span>
              </div>
              <div className="w-full bg-brand-secondary h-2 rounded-full overflow-hidden shadow-inner">
                <div className="bg-gradient-premium h-full rounded-full" style={{ width: `${Math.min(100, (travelTimeMinutes! / 90) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Confirmation Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-brand-secondary">
          <h2 className="text-xl font-black serif text-brand-dark mb-10 uppercase tracking-tighter">Registered Service</h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-8 p-6 bg-brand-secondary/20 rounded-3xl border-l-4 border-brand-dark">
              <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-premium group">
                 <img src={style?.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">{style?.category}</p>
                <p className="font-black text-brand-dark text-2xl uppercase tracking-tighter leading-none serif">{style?.name}</p>
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-3">{entry.length} Length • {entry.branch}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center pt-10 pb-20">
          <a href={`tel:${entry.branch === Branch.MADINA ? '0598911140' : '0207913529'}`} className="inline-flex items-center space-x-4 bg-brand-dark text-white px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium hover:bg-brand-primary transition-all transform hover:-translate-y-1">
            <Phone size={18} className="text-brand-primary" />
            <span>Support Hotline</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrackQueuePage;

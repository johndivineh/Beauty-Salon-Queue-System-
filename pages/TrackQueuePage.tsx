
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
  ChevronRight
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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');
  const [travelTimeMinutes, setTravelTimeMinutes] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const entry = queue.find(q => q.id === queueId || (q.phoneNumber === phoneNumber && q.status !== QueueStatus.COMPLETED));
  const style = styles.find(s => s?.id === entry?.styleId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (entry && locationStatus === 'idle') {
      handleRequestLocation();
    }
  }, [entry, locationStatus]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        setLocationStatus('success');
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus(error.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
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
      <div className="bg-white min-h-screen py-20 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black serif text-black mb-4 uppercase tracking-tighter text-center">Track Turn</h1>
          <p className="text-gray-400 text-center mb-10 font-black uppercase text-[10px] tracking-widest">Northern Bar Operations Live Access</p>
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.3em]">Registered Mobile</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-6 bg-white border-2 border-black rounded-none outline-none text-black font-black text-2xl text-center focus:bg-black focus:text-white transition-all"
                placeholder="024XXXXXXX"
              />
            </div>
            <button
              onClick={() => setIsRefreshing(true)}
              className="w-full bg-black text-white py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(190,24,93,1)]"
            >
              Verify Session
            </button>
          </div>
          <p className="mt-10 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Not active? <Link to="/join" className="text-brand-pink underline">Register Slot</Link>
          </p>
        </div>
      </div>
    );
  }

  if (locationStatus !== 'success') {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(190,24,93,1)] text-center">
          <div className="w-24 h-24 bg-black rounded-none flex items-center justify-center text-brand-pink mx-auto mb-10 shadow-lg">
             <LocateFixed size={48} className={locationStatus === 'loading' ? 'animate-spin' : ''} />
          </div>
          <h1 className="text-4xl font-black serif text-black mb-4 uppercase tracking-tighter">GPS Lock Required</h1>
          <p className="text-gray-500 mb-10 font-bold text-xs uppercase tracking-widest leading-relaxed">
            Northern Bar operations require distance tracking to calculate your <strong>Arrival Window</strong> and prevent overcrowding.
          </p>
          
          <div className="space-y-6">
            <button 
              onClick={handleRequestLocation}
              disabled={locationStatus === 'loading'}
              className="w-full bg-black text-white py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(190,24,93,1)] active:translate-x-1 active:translate-y-1 transition-all"
            >
              {locationStatus === 'loading' ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
              <span className="ml-2">Authorize Sync</span>
            </button>
            
            {locationStatus === 'denied' && (
              <div className="p-5 bg-brand-red text-white flex items-start space-x-3 text-left border-b-8 border-black">
                <AlertCircle className="shrink-0" size={20} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                  GPS Access Denied. Northern Operations cannot verify your position. Enable in settings.
                </p>
              </div>
            )}
            
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest pt-6 border-t border-gray-100">
              Session Ticket: {entry.queueNumber}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        
        {/* Live Status Card */}
        <div className="bg-white border-4 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-[20px_20px_0px_0px_rgba(190,24,93,1)] transition-all">
          <div className="flex justify-between items-start mb-12">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-black flex items-center justify-center text-brand-pink">
                 <Zap size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Ticket ID</p>
                <h1 className="text-4xl font-black text-black tracking-tighter uppercase">{entry.queueNumber}</h1>
              </div>
            </div>
            <div className={`px-6 py-2 font-black text-[10px] uppercase tracking-[0.2em] flex items-center space-x-2 ${getStatusColor(entry.status)} shadow-sm`}>
              <CircleDashed size={14} className={entry.status === QueueStatus.WAITING ? 'animate-spin' : ''} />
              <span>{entry.status}</span>
            </div>
          </div>

          <div className="mb-12">
             <div className="bg-black p-12 text-white shadow-2xl flex flex-col items-center justify-center text-center border-r-[12px] border-brand-pink">
                <div className="flex items-center space-x-3 text-brand-pink mb-6">
                  <Clock size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ops Countdown</span>
                </div>
                <div className="text-7xl font-black tracking-tighter">
                  {countdown || "GO"}
                </div>
                <p className="text-white/20 text-[9px] mt-6 font-black uppercase tracking-[0.5em]">
                  Server Synced: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-6 border-2 border-black text-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Position</p>
              <p className="text-5xl font-black text-black">{position > 0 ? position : '--'}</p>
            </div>
            <div className="bg-white p-6 border-2 border-black text-center">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Start Est.</p>
              <p className="text-3xl font-black text-brand-pink">
                {entry.estimatedStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Commute Plan Section */}
        <div className="bg-black p-1 shadow-2xl">
          <div className="bg-white p-10 h-full flex flex-col border-4 border-black border-r-brand-pink border-r-[12px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <Car className="text-brand-pink" size={28} />
                <h2 className="text-2xl font-black serif text-black uppercase tracking-tighter">Commute</h2>
              </div>
              <div className="bg-brand-pink/10 text-brand-pink px-4 py-1.5 font-black text-[9px] uppercase tracking-widest flex items-center">
                 <LocateFixed size={14} className="mr-2" />
                 GPS ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className={`p-8 border-4 transition-all ${isTimetoLeave ? 'bg-brand-pink text-white border-brand-pink' : 'bg-white border-black'}`}>
                <p className={`text-[10px] uppercase font-black tracking-widest mb-4 ${isTimetoLeave ? 'text-white/70' : 'text-gray-400'}`}>Leave House By</p>
                <p className={`text-6xl font-black ${isTimetoLeave ? 'animate-pulse' : 'text-black'}`}>
                  {leaveTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-6 inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest">
                   {isTimetoLeave ? (
                     <span className="bg-black text-white px-3 py-1">DEPART IMMEDIATELY</span>
                   ) : (
                     <span className="text-gray-300">WAITING MODE</span>
                   )}
                </div>
              </div>
              <div className="bg-gray-50 p-8 flex flex-col justify-center border-2 border-black border-dashed">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Radius</span>
                  <span className="text-sm font-black text-black">{distanceKm} KM</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Est. Trip</span>
                  <span className="text-sm font-black text-black">{travelTimeMinutes} MINS</span>
                </div>
                <div className="w-full bg-gray-200 h-1 rounded-none overflow-hidden">
                  <div className="bg-brand-pink h-full" style={{ width: `${Math.min(100, (travelTimeMinutes! / 90) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Confirmation Card */}
        <div className="bg-white border-2 border-black p-10 shadow-sm">
          <h2 className="text-xl font-black serif text-black mb-10 uppercase tracking-tighter">Registered Service</h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-8 p-6 bg-gray-50 border-l-8 border-black">
              <div className="w-24 h-24 bg-white border-2 border-black overflow-hidden shadow-lg">
                 <img src={style?.images[0]} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-pink uppercase tracking-[0.3em] mb-2">{style?.category}</p>
                <p className="font-black text-black text-2xl uppercase tracking-tighter leading-none">{style?.name}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-3">{entry.length} Length • {entry.branch}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center pt-10 pb-20">
          <a href={`tel:${entry.branch === Branch.MADINA ? '0598911140' : '0207913529'}`} className="inline-flex items-center space-x-4 bg-black text-white px-10 py-6 font-black text-xs uppercase tracking-[0.4em] shadow-[8px_8px_0px_0px_rgba(190,24,93,1)] hover:bg-brand-pink hover:shadow-none transition-all">
            <Phone size={18} />
            <span>Support Hotline</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrackQueuePage;

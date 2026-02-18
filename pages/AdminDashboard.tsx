
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Scissors, 
  Package, 
  BarChart3, 
  LogOut, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Filter,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../store';
import { Branch, QueueStatus, QueueEntry, Style, InventoryItem } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { queue, updateQueueStatus, styles, inventory, setQueue } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'styles' | 'inventory' | 'insights'>('queue');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.MADINA);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) navigate('/admin/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const filteredQueue = queue
    .filter(q => q.branch === selectedBranch)
    .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());

  const activeQueue = filteredQueue.filter(q => q.status !== QueueStatus.COMPLETED && q.status !== QueueStatus.NO_SHOW);
  const completedQueue = filteredQueue.filter(q => q.status === QueueStatus.COMPLETED || q.status === QueueStatus.NO_SHOW);

  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 24 },
    { name: 'Fri', count: 32 },
    { name: 'Sat', count: 45 },
    { name: 'Sun', count: 28 },
  ];

  return (
    <div className="bg-white min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-80 bg-black text-white flex flex-col fixed inset-y-0 left-0 border-r-8 border-brand-pink">
        <div className="p-10">
          <h1 className="text-2xl font-black serif uppercase tracking-tighter">Ops Center</h1>
          <p className="text-brand-pink text-[10px] font-black uppercase tracking-[0.4em] mt-2">Northern Braids Bar</p>
        </div>

        <nav className="flex-grow px-6 space-y-4">
          {[
            { id: 'queue', label: 'Queue Ops', icon: Users },
            { id: 'styles', label: 'Inspo CMS', icon: Scissors },
            { id: 'inventory', label: 'Supply Stock', icon: Package },
            { id: 'insights', label: 'Revenue & Data', icon: BarChart3 }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-4 px-6 py-5 rounded-none font-black uppercase text-xs tracking-[0.3em] transition-all border-l-4 ${
                activeTab === item.id 
                  ? 'bg-brand-pink text-white border-white shadow-xl' 
                  : 'text-gray-500 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-6 py-5 text-gray-500 hover:text-brand-red transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-80 p-12 bg-[#fafafa]">
        <header className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-5xl font-black text-black serif uppercase tracking-tighter">
              {activeTab === 'queue' && 'Real-time Queue'}
              {activeTab === 'styles' && 'Artistry Management'}
              {activeTab === 'inventory' && 'Inventory Tracking'}
              {activeTab === 'insights' && 'Ops Intelligence'}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="bg-white border-4 border-black p-1 flex">
              {[Branch.MADINA, Branch.ACCRA].map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                    selectedBranch === b ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <div className="w-14 h-14 bg-black border-4 border-brand-pink flex items-center justify-center text-white font-black">OP</div>
          </div>
        </header>

        {activeTab === 'queue' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Active Queue */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border-4 border-black p-8 shadow-[20px_20px_0px_0px_rgba(190,24,93,0.1)]">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black serif text-black uppercase tracking-tighter">Live Session Manifest ({activeQueue.length})</h3>
                    <div className="flex items-center text-[10px] font-black uppercase text-brand-pink tracking-[0.2em] bg-black px-4 py-2">
                       <div className="w-1.5 h-1.5 bg-brand-pink rounded-full mr-3 animate-ping"></div>
                       Operational
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-4 border-black">
                          <th className="pb-6 font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">Ticket</th>
                          <th className="pb-6 font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">Customer</th>
                          <th className="pb-6 font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">Artistry</th>
                          <th className="pb-6 font-black text-gray-400 text-[10px] uppercase tracking-[0.3em]">Status</th>
                          <th className="pb-6 font-black text-gray-400 text-[10px] uppercase tracking-[0.3em] text-right">Ops</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-50">
                        {activeQueue.map((entry) => {
                          const style = styles.find(s => s.id === entry.styleId);
                          return (
                            <tr key={entry.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="py-8">
                                <span className="font-black text-black text-lg tracking-tighter">{entry.queueNumber}</span>
                              </td>
                              <td className="py-8">
                                <p className="font-black text-black text-sm uppercase tracking-widest">{entry.customerName}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">{entry.phoneNumber}</p>
                              </td>
                              <td className="py-8">
                                <p className="text-xs font-black uppercase tracking-widest text-brand-pink">{style?.name}</p>
                                <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{entry.length} | {entry.bringingOwnExtensions ? 'SELF-SUPPLY' : 'SALON-SUPPLY'}</p>
                              </td>
                              <td className="py-8">
                                <span className={`px-4 py-2 font-black text-[9px] uppercase tracking-widest border-2
                                  ${entry.status === QueueStatus.IN_SERVICE ? 'bg-black text-white border-black' : 
                                    entry.status === QueueStatus.ALMOST_TURN ? 'bg-brand-pink text-white border-brand-pink' :
                                    entry.status === QueueStatus.PLEASE_ARRIVE ? 'bg-white text-black border-black animate-pulse' :
                                    'bg-white text-gray-400 border-gray-100'}`}>
                                  {entry.status}
                                </span>
                              </td>
                              <td className="py-8 text-right space-x-2">
                                <button onClick={() => updateQueueStatus(entry.id, QueueStatus.PLEASE_ARRIVE)} className="p-3 bg-black text-white hover:bg-brand-pink transition-colors" title="Signal Arrival"><Clock size={16} /></button>
                                <button onClick={() => updateQueueStatus(entry.id, QueueStatus.IN_SERVICE)} className="p-3 bg-black text-white hover:bg-brand-pink transition-colors" title="Commence Service"><UserCheck size={16} /></button>
                                <button onClick={() => updateQueueStatus(entry.id, QueueStatus.COMPLETED)} className="p-3 bg-black text-white hover:bg-brand-pink transition-colors" title="Complete Ticket"><CheckCircle2 size={16} /></button>
                                <button onClick={() => updateQueueStatus(entry.id, QueueStatus.NO_SHOW)} className="p-3 bg-white text-brand-red border-2 border-brand-red hover:bg-brand-red hover:text-white transition-colors" title="Log No-Show"><XCircle size={16} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stats Block */}
              <div className="space-y-10">
                <div className="bg-black text-white p-10 border-r-[16px] border-brand-pink shadow-2xl">
                  <h3 className="font-black text-brand-pink text-[10px] uppercase tracking-[0.5em] mb-6">Ops Latency</h3>
                  <div className="flex items-baseline space-x-4">
                    <span className="text-7xl font-black tracking-tighter">45</span>
                    <span className="text-xl font-black text-brand-pink uppercase tracking-widest">Mins</span>
                  </div>
                  <div className="mt-12 pt-8 border-t border-white/10 flex justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Head</p>
                      <p className="font-black text-brand-pink mt-1">#MAD-001</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Manifest Count</p>
                      <p className="font-black text-brand-pink mt-1">{activeQueue.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-black p-8 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Protocol History</h3>
                  <div className="space-y-6">
                    {completedQueue.slice(0, 5).map(q => (
                      <div key={q.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                         <div>
                           <p className="text-xs font-black uppercase tracking-widest">{q.customerName}</p>
                           <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{q.queueNumber}</p>
                         </div>
                         <span className={q.status === QueueStatus.COMPLETED ? 'text-black' : 'text-brand-red'}>
                            {q.status === QueueStatus.COMPLETED ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                         </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs... */}
        {activeTab === 'styles' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center bg-black p-6 border-b-[8px] border-brand-pink">
               <div className="relative w-96">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-pink" size={20} />
                 <input type="text" placeholder="SEARCH ARTISTRY..." className="w-full pl-14 pr-6 py-4 bg-black text-white border-2 border-white/20 font-black uppercase text-xs tracking-widest outline-none focus:border-brand-pink transition-all" />
               </div>
               <button className="bg-brand-pink text-white px-10 py-5 font-black uppercase text-xs tracking-[0.3em] flex items-center space-x-3 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                 <Plus size={20} />
                 <span>Deploy New Style</span>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {styles.map(style => (
                <div key={style.id} className="bg-white border-2 border-black group transition-all hover:border-brand-pink">
                   <div className="aspect-square bg-black overflow-hidden relative">
                     <img src={style.images[0]} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                     <div className="absolute top-4 right-4 bg-black/80 p-2 text-white border border-white/20">
                        <MoreVertical size={16} />
                     </div>
                   </div>
                   <div className="p-8">
                     <span className="text-[9px] font-black text-brand-pink uppercase tracking-[0.3em]">{style.category}</span>
                     <h4 className="text-2xl font-black serif uppercase tracking-tighter leading-none mt-2 mb-6">{style.name}</h4>
                     <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">{style.priceRange}</span>
                        <div className="flex items-center space-x-3">
                           <span className={`w-2 h-2 rounded-full ${style.hidden ? 'bg-gray-300' : 'bg-brand-pink'}`}></span>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{style.hidden ? 'HIDDEN' : 'OPERATIONAL'}</span>
                        </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(190,24,93,0.1)]">
             <div className="flex justify-between items-center mb-16">
               <h3 className="text-3xl font-black serif uppercase tracking-tighter">Supply Logistics</h3>
               <button className="bg-black text-white px-8 py-4 font-black text-xs uppercase tracking-[0.2em] flex items-center space-x-3">
                 <Plus size={18} />
                 <span>Restock Supply</span>
               </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {inventory.map(item => (
                  <div key={item.id} className="border-4 border-black p-8 flex flex-col group hover:bg-black transition-colors duration-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-gray-100 group-hover:bg-brand-pink flex items-center justify-center transition-colors">
                        <Package size={24} className="text-black" />
                      </div>
                      <button className="text-gray-300 hover:text-white"><MoreVertical size={20} /></button>
                    </div>
                    <p className="font-black text-black group-hover:text-white uppercase tracking-widest text-sm mb-2">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Col: {item.color} | GHS {item.price}</p>
                    <div className="mt-8 flex items-end space-x-3">
                      <span className={`text-6xl font-black tracking-tighter ${item.stockCount < 10 ? 'text-brand-red' : 'text-brand-pink group-hover:text-white'}`}>{item.stockCount}</span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest pb-3">In Storage</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                 { label: 'Ops Velocity', val: '42', change: '+12%', color: 'brand-pink' },
                 { label: 'Avg Latency', val: '38M', change: '-5%', color: 'black' },
                 { label: 'Rev Projection', val: '4.2K', change: '+18%', color: 'brand-pink' },
                 { label: 'Protocol Fail', val: '4.2%', change: '-1%', color: 'brand-red' }
               ].map((stat, idx) => (
                 <div key={idx} className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">{stat.label}</p>
                   <div className="flex items-baseline justify-between">
                     <span className={`text-4xl font-black tracking-tighter text-${stat.color}`}>{stat.val}</span>
                     <span className={`text-[10px] font-black ${stat.change.startsWith('+') ? 'text-brand-pink' : 'text-brand-red'}`}>{stat.change}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-black text-white p-12 border-b-[16px] border-brand-pink">
                  <h3 className="text-2xl font-black serif uppercase tracking-tighter mb-12">Weekly Demand Volume</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#333" />
                        <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #be185d', color: '#fff'}} />
                        <Bar dataKey="count" fill="#be185d" radius={0} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
                  <h3 className="text-2xl font-black serif uppercase tracking-tighter mb-12">Signature Popularity</h3>
                  <div className="space-y-10">
                    {styles.slice(0, 4).map((s, idx) => (
                      <div key={s.id} className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-black">{s.name}</span>
                          <span className="text-brand-pink">{80 - (idx * 15)}% SHARE</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3 border border-black overflow-hidden">
                           <div className="bg-brand-pink h-full" style={{ width: `${80 - (idx * 15)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

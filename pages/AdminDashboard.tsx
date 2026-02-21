
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
  ChevronDown,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Zap,
  User,
  DollarSign,
  RefreshCw,
  Trash2,
  Edit,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../store';
import { Branch, QueueStatus, QueueEntry, Style, InventoryItem } from '../types';
import { CATEGORIES } from '../constants';
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

const AddStyleModal: React.FC<{ onClose: () => void, onAdd: (style: Omit<Style, 'id'>) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    description: '',
    priceRange: '',
    basePrice: 0,
    durationMinutes: 120,
    images: [] as string[],
    featured: false,
    trending: false,
    recommendedExtensions: '',
    hidden: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border border-brand-secondary overflow-hidden relative max-h-[90vh] overflow-y-auto shadow-premium">
        <button onClick={onClose} className="absolute top-8 right-8 z-10 p-3 bg-brand-secondary/50 text-brand-dark hover:bg-brand-primary hover:text-white rounded-full transition-all duration-300">
          <X size={24} />
        </button>
        <div className="p-12 lg:p-16">
          <h2 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter mb-10">Deploy New Artistry</h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Style Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" placeholder="STYLE NAME" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Category</label>
                <div className="relative">
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={18} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none h-32 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" placeholder="STYLE DESCRIPTION" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Price Range</label>
                <input required value={formData.priceRange} onChange={e => setFormData({...formData, priceRange: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" placeholder="GHS 400-800" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Base Price (GHS)</label>
                <input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Duration (Mins)</label>
                <input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Supply Requirements</label>
              <input required value={formData.recommendedExtensions} onChange={e => setFormData({...formData, recommendedExtensions: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" placeholder="e.g. 3 packs of X-pression" />
            </div>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Style Images</label>
              <div className="flex flex-wrap gap-6">
                {formData.images.map((img, i) => (
                  <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-brand-secondary relative group shadow-soft">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute inset-0 bg-brand-primary/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-brand-secondary flex flex-col items-center justify-center cursor-pointer hover:bg-brand-secondary/30 transition-all duration-300">
                  <Upload size={20} className="text-brand-muted mb-2" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-muted">Add Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-10">
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.featured ? 'bg-brand-primary border-brand-primary' : 'border-brand-secondary group-hover:border-brand-primary'}`}>
                  {formData.featured && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="hidden" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Featured</span>
              </label>
              <label className="flex items-center space-x-4 cursor-pointer group">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.trending ? 'bg-brand-dark border-brand-dark' : 'border-brand-secondary group-hover:border-brand-dark'}`}>
                  {formData.trending && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <input type="checkbox" checked={formData.trending} onChange={e => setFormData({...formData, trending: e.target.checked})} className="hidden" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Trending</span>
              </label>
            </div>

            <button type="submit" className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1">
              Deploy Style
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InventoryModal: React.FC<{ 
  onClose: () => void, 
  onSave: (item: Omit<InventoryItem, 'id'>) => void,
  editItem?: InventoryItem | null
}> = ({ onClose, onSave, editItem }) => {
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    price: editItem?.price || 0,
    stockCount: editItem?.stockCount || 0,
    color: editItem?.color || '',
    length: editItem?.length || '',
    image: editItem?.image || ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-brand-secondary overflow-hidden relative max-h-[90vh] overflow-y-auto shadow-premium">
        <button onClick={onClose} className="absolute top-8 right-8 z-10 p-3 bg-brand-secondary/50 text-brand-dark hover:bg-brand-primary hover:text-white rounded-full transition-all duration-300">
          <X size={24} />
        </button>
        <div className="p-12 lg:p-16">
          <h2 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter mb-10">
            {editItem ? 'Edit Supply' : 'Restock Supply'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Item Image</label>
              <div className="flex items-center space-x-8">
                <div className="w-24 h-24 rounded-2xl border border-brand-secondary bg-brand-secondary/30 flex items-center justify-center overflow-hidden shadow-soft">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <ImageIcon size={32} className="text-brand-muted/40" />
                  )}
                </div>
                <label className="bg-brand-dark text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-brand-primary shadow-soft transition-all duration-300">
                  {formData.image ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Item Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" placeholder="e.g. X-pression #1B" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Price (GHS)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Stock Count</label>
                <input type="number" required value={formData.stockCount} onChange={e => setFormData({...formData, stockCount: parseInt(e.target.value)})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Color (Optional)</label>
                <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Length (Optional)</label>
                <input value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} className="w-full p-5 bg-brand-secondary/30 border border-transparent rounded-2xl font-bold uppercase text-xs outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/20 transition-all" />
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-premium text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-soft hover:shadow-premium transition-all transform hover:-translate-y-1">
              {editItem ? 'Update Item' : 'Add to Stock'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { queue, updateQueueStatus, deleteQueueEntry, styles, inventory, setQueue, addStyle, addInventoryItem, updateInventoryItem, getBranchStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'styles' | 'inventory' | 'insights'>('queue');
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.MADINA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showAddStyleModal, setShowAddStyleModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);

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

  const stats = {
    totalToday: filteredQueue.length,
    waiting: activeQueue.length,
    completed: filteredQueue.filter(q => q.status === QueueStatus.COMPLETED).length,
    revenue: filteredQueue
      .filter(q => q.status === QueueStatus.COMPLETED)
      .reduce((acc, curr) => {
        const style = styles.find(s => s.id === curr.styleId);
        return acc + (style?.basePrice || 0);
      }, 0)
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
        activeTab === id 
          ? 'bg-brand-primary text-white shadow-premium transform -translate-y-0.5' 
          : 'text-brand-muted hover:bg-brand-secondary hover:text-brand-dark'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-brand-secondary/20 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-brand-secondary transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center space-x-3 mb-16 px-2">
            <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-brand-primary shadow-soft">
              <Zap size={24} />
            </div>
            <span className="text-xl font-black text-brand-dark tracking-tighter uppercase serif">Ops Center</span>
          </div>

          <nav className="flex-grow space-y-3">
            <NavItem id="queue" label="Queue Ops" icon={Users} />
            <NavItem id="styles" label="Inspo CMS" icon={Scissors} />
            <NavItem id="inventory" label="Supply Stock" icon={Package} />
            <NavItem id="insights" label="Analytics" icon={BarChart3} />
          </nav>

          <div className="mt-auto pt-8 border-t border-brand-secondary">
             <div className="bg-brand-secondary/30 p-6 rounded-2xl border border-brand-secondary">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Logged in as</p>
                <p className="text-xs font-black text-brand-dark uppercase tracking-widest">Administrator</p>
             </div>
             <button 
               onClick={handleLogout}
               className="w-full flex items-center space-x-4 px-6 py-5 mt-4 text-brand-muted hover:text-brand-primary transition-colors font-black uppercase text-[10px] tracking-widest"
             >
               <LogOut size={18} />
               <span>Terminate Session</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white border-b border-brand-secondary flex items-center justify-between px-8 lg:px-12 shrink-0">
          <div className="flex items-center space-x-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-brand-dark hover:bg-brand-secondary rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-4 bg-brand-secondary/30 p-1.5 rounded-2xl border border-brand-secondary">
              {[Branch.MADINA, Branch.ACCRA].map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    selectedBranch === b 
                      ? 'bg-white text-brand-dark shadow-soft' 
                      : 'text-brand-muted hover:text-brand-dark'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="hidden md:flex items-center space-x-3 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-soft">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
                <span>Live Ops Active</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-brand-dark border border-brand-secondary">
                <User size={20} />
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <header className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark serif uppercase tracking-tighter">
              {activeTab === 'queue' && 'Real-time Queue'}
              {activeTab === 'styles' && 'Artistry Management'}
              {activeTab === 'inventory' && 'Inventory Tracking'}
              {activeTab === 'insights' && 'Ops Intelligence'}
            </h2>
          </header>

        {activeTab === 'queue' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Total Today', value: stats.totalToday, icon: Users, color: 'text-brand-dark' },
                { label: 'Waiting', value: stats.waiting, icon: Clock, color: 'text-brand-primary' },
                { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Est. Revenue', value: `GHS ${stats.revenue}`, icon: DollarSign, color: 'text-brand-accent' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-soft border border-brand-secondary group hover:shadow-premium transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-brand-secondary/50 ${s.color} group-hover:scale-110 transition-transform`}>
                      <s.icon size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-3xl font-black serif uppercase tracking-tighter ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Queue Table */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-brand-secondary overflow-hidden">
              <div className="p-8 border-b border-brand-secondary flex justify-between items-center bg-brand-secondary/10">
                <h2 className="text-xl font-black serif text-brand-dark uppercase tracking-tighter">Queue Manifest</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Auto-refresh Active</span>
                  <RefreshCw size={14} className="text-brand-primary animate-spin-slow" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-brand-secondary/20 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Ticket</th>
                      <th className="px-8 py-6">Customer</th>
                      <th className="px-8 py-6">Service</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-secondary">
                    {activeQueue.map(entry => {
                      const style = styles.find(s => s.id === entry.styleId);
                      return (
                        <tr key={entry.id} className="hover:bg-brand-secondary/10 transition-colors group">
                          <td className="px-8 py-6">
                            <span className="font-black text-brand-dark text-lg serif tracking-tighter">{entry.queueNumber}</span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-brand-dark text-sm uppercase tracking-widest">{entry.customerName}</p>
                            <p className="text-[10px] text-brand-muted font-medium tracking-widest mt-1">{entry.phoneNumber}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-brand-dark text-sm uppercase tracking-widest">{style?.name}</p>
                            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">{entry.length}</p>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={entry.status}
                              onChange={(e) => updateQueueStatus(entry.id, e.target.value as QueueStatus)}
                              className={`px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest outline-none border-2 transition-all ${
                                entry.status === QueueStatus.WAITING ? 'bg-brand-secondary text-brand-dark border-brand-secondary' :
                                entry.status === QueueStatus.ALMOST_TURN ? 'bg-brand-dark text-white border-brand-dark' :
                                entry.status === QueueStatus.PLEASE_ARRIVE ? 'bg-brand-primary text-white border-brand-primary animate-pulse' :
                                'bg-emerald-500 text-white border-emerald-500'
                              }`}
                            >
                              {Object.values(QueueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => deleteQueueEntry(entry.id)}
                              className="p-3 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {activeQueue.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="bg-brand-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-muted">
                             <Users size={24} />
                          </div>
                          <p className="text-sm font-black text-brand-muted uppercase tracking-widest">Manifest Empty</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs... */}
        {activeTab === 'styles' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter">Inspo CMS</h2>
                <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-2">Curate the braids artistry catalogue</p>
              </div>
              <button 
                onClick={() => setShowAddStyleModal(true)}
                className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary shadow-soft transition-all transform hover:-translate-y-1 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                New Style
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {styles.map(style => (
                <div key={style.id} className="bg-white rounded-3xl overflow-hidden shadow-soft border border-brand-secondary group hover:shadow-premium transition-all duration-500">
                  <div className="aspect-[4/5] bg-brand-secondary relative overflow-hidden">
                    <img src={style.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {style.featured && <span className="bg-brand-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-soft">Featured</span>}
                      {style.trending && <span className="bg-brand-dark text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Trending</span>}
                    </div>
                  </div>
                  <div className="p-8">
                    <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2 block">{style.category}</span>
                    <h3 className="text-xl font-black serif text-brand-dark uppercase tracking-tighter mb-6">{style.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">GHS {style.basePrice} Base</span>
                      <div className="flex space-x-2">
                        <button className="p-2.5 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all">
                          <Edit size={16} />
                        </button>
                        <button className="p-2.5 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black serif text-brand-dark uppercase tracking-tighter">Hair Supply</h2>
                <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-2">Manage salon extensions inventory</p>
              </div>
              <button 
                onClick={() => {
                  setEditingInventoryItem(null);
                  setShowInventoryModal(true);
                }}
                className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary shadow-soft transition-all transform hover:-translate-y-1 flex items-center"
              >
                <Plus size={18} className="mr-2" />
                Add Supply
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {inventory.map(item => (
                <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-soft border border-brand-secondary group hover:shadow-premium transition-all duration-500">
                  <div className="aspect-square bg-brand-secondary relative overflow-hidden">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted">
                        <ShoppingBag size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest text-brand-dark shadow-soft">
                      {item.stockCount} In Stock
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black serif text-brand-dark uppercase tracking-tighter mb-4">{item.name}</h3>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{item.color} • {item.length}</span>
                      <span className="text-lg font-black text-brand-primary serif">GHS {item.price}</span>
                    </div>
                    <div className="w-full bg-brand-secondary h-1.5 rounded-full overflow-hidden mb-6">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${item.stockCount < 5 ? 'bg-brand-primary' : 'bg-emerald-500'}`}
                         style={{ width: `${Math.min(100, (item.stockCount / 20) * 100)}%` }}
                       ></div>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingInventoryItem(item);
                        setShowInventoryModal(true);
                      }}
                      className="w-full py-4 rounded-xl border border-brand-secondary text-brand-dark font-black text-[10px] uppercase tracking-widest hover:bg-brand-secondary transition-all"
                    >
                      Edit Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-premium border border-brand-secondary">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-black serif text-brand-dark uppercase tracking-tighter">Weekly Traffic</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                       <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Appointments</span>
                    </div>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E5E5" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 900 }}
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: '#FDF8F3' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textTransform: 'uppercase', fontSize: '10px', fontWeight: 900 }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#D44D5C" 
                        radius={[10, 10, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-10">
                <div className="bg-brand-dark text-white p-10 rounded-[2.5rem] shadow-premium relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl group-hover:bg-brand-primary/40 transition-all duration-700"></div>
                  <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-8">Branch Performance</h3>
                  <div className="space-y-8">
                    {[Branch.MADINA, Branch.ACCRA].map(b => {
                      const status = getBranchStatus(b);
                      return (
                        <div key={b} className="flex justify-between items-end border-b border-white/10 pb-6 last:border-0">
                          <div>
                            <p className="text-xl font-black serif uppercase tracking-tighter mb-1">{b}</p>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{status.peopleWaiting} Waiting</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-brand-primary uppercase tracking-widest mb-1">{status.waitTime}m</p>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Est. Wait</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-premium border border-brand-secondary">
                   <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-8">Popular Styles</h3>
                   <div className="space-y-6">
                      {styles.slice(0, 3).map((s, i) => (
                        <div key={s.id} className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-xl overflow-hidden shadow-soft">
                              <img src={s.images[0]} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black text-brand-dark uppercase tracking-widest">{s.name}</p>
                              <div className="w-full bg-brand-secondary h-1 rounded-full mt-2 overflow-hidden">
                                 <div className="bg-brand-primary h-full rounded-full" style={{ width: `${100 - i * 20}%` }}></div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>

      {/* Modals */}
      {showAddStyleModal && <AddStyleModal onClose={() => setShowAddStyleModal(false)} onAdd={addStyle} />}
      {showInventoryModal && (
        <InventoryModal 
          onClose={() => {
            setShowInventoryModal(false);
            setEditingInventoryItem(null);
          }} 
          onSave={(item) => {
            if (editingInventoryItem) {
              updateInventoryItem(editingInventoryItem.id, item);
            } else {
              addInventoryItem(item);
            }
          }} 
          editItem={editingInventoryItem}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

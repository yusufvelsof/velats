'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  LayoutDashboard, 
  Eye, 
  EyeOff, 
  GripVertical, 
  CheckCircle2, 
  X,
  Users,
  Briefcase,
  Send,
  Clock,
  Activity,
  Calendar,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const AVAILABLE_WIDGETS = [
  { id: 'totalCandidates', name: 'Total Candidates', icon: <Users size={16}/>, color: 'blue' },
  { id: 'openJobs', name: 'Open Job Openings', icon: <Briefcase size={16}/>, color: 'purple' },
  { id: 'applied', name: 'Applied Stats', icon: <Clock size={16}/>, color: 'yellow' },
  { id: 'interviews', name: 'Interviews Count', icon: <Send size={16}/>, color: 'orange' },
  { id: 'totalHired', name: 'Hiring Success', icon: <CheckCircle2 size={16}/>, color: 'green' },
  { id: 'pipelineFunnel', name: 'Visual Pipeline Funnel', icon: <Activity size={16}/>, color: 'indigo' },
  { id: 'upcomingInterviews', name: 'Interview Calendar', icon: <Calendar size={16}/>, color: 'rose' },
  { id: 'quickLaunch', name: 'Quick Action Bar', icon: <Zap size={16}/>, color: 'amber' },
];

export default function CustomizeHomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState({
    visibleWidgets: ['totalCandidates', 'openJobs', 'applied', 'interviews', 'totalHired', 'pipelineFunnel', 'upcomingInterviews', 'quickLaunch'],
    layoutDensity: 'compact',
    showGreetings: true,
    refreshInterval: 'none'
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.dashboardConfig) {
          setConfig(res.data.dashboardConfig);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleWidget = (id: string) => {
    setConfig(prev => {
      const isVisible = prev.visibleWidgets.includes(id);
      return {
        ...prev,
        visibleWidgets: isVisible 
          ? prev.visibleWidgets.filter(w => w !== id)
          : [...prev.visibleWidgets, id]
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { dashboardConfig: config });
      setMessage({ type: 'success', text: 'Dashboard layout updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update layout' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-8 h-4 rounded-full relative transition-all duration-200 focus:outline-none ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <motion.div 
        animate={{ x: active ? 16 : 2 }}
        className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm"
      />
    </button>
  );

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Home Page</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Layout Orchestrator</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Publish Layout'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Widget Visibility List */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><LayoutDashboard size={18}/></div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Dashboard Widgets</h2>
             </div>
             <div className="divide-y divide-gray-50">
                {AVAILABLE_WIDGETS.map((widget) => {
                  const isVisible = config.visibleWidgets.includes(widget.id);
                  return (
                    <div key={widget.id} className="p-4 flex items-center justify-between group hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-center space-x-4">
                         <GripVertical size={16} className="text-gray-200 group-hover:text-gray-400 cursor-grab" />
                         <div className={`p-2 rounded-lg bg-${widget.color}-50 text-${widget.color}-600`}>
                            {widget.icon}
                         </div>
                         <div>
                            <p className="text-sm font-black text-gray-800">{widget.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System Component</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${isVisible ? 'text-blue-600' : 'text-gray-300'}`}>
                            {isVisible ? 'Active' : 'Hidden'}
                         </span>
                         <Toggle active={isVisible} onClick={() => toggleWidget(widget.id)} />
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>
        </div>

        {/* Global UI Preferences */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Zap size={14} className="text-blue-500" />
              <span>UI Preferences</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-800">Show Personal Greetings</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">"Good morning, Sarah!"</p>
                </div>
                <Toggle active={config.showGreetings} onClick={() => setConfig({...config, showGreetings: !config.showGreetings})} />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Layout Density</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['comfortable', 'compact'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setConfig({...config, layoutDensity: d})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          config.layoutDensity === d ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400 border-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Auto-Refresh Stats</label>
                 <select 
                   className="w-full text-[10px] font-black uppercase"
                   value={config.refreshInterval}
                   onChange={(e) => setConfig({...config, refreshInterval: e.target.value})}
                 >
                    <option value="none">Manual Refresh</option>
                    <option value="1min">Every 1 Minute</option>
                    <option value="5min">Every 5 Minutes</option>
                 </select>
              </div>
            </div>
          </section>

          {/* Quick Help */}
          <div className="p-6 bg-gray-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] -mr-16 -mt-16"></div>
             <h3 className="font-black text-sm uppercase tracking-widest mb-2 relative z-10">Pro Tip 💡</h3>
             <p className="text-[11px] font-medium leading-relaxed text-gray-400 relative z-10">Enable only the widgets your team uses most to keep the dashboard fast and focused.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

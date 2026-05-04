'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  LayoutDashboard, 
  Columns, 
  Calendar, 
  Users, 
  Briefcase, 
  History, 
  Settings,
  CheckCircle2,
  X,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const ALL_MODULES = [
  { id: 'dashboard', name: 'Overview Dashboard', icon: <LayoutDashboard size={20}/>, color: 'blue', core: true },
  { id: 'pipeline', name: 'Hiring Pipeline', icon: <Columns size={20}/>, color: 'indigo', core: false },
  { id: 'interviews', name: 'Interviews & Schedule', icon: <Calendar size={20}/>, color: 'orange', core: false },
  { id: 'candidates', name: 'Talent Directory', icon: <Users size={20}/>, color: 'emerald', core: false },
  { id: 'jobs', name: 'Job Openings', icon: <Briefcase size={20}/>, color: 'purple', core: false },
  { id: 'settings', name: 'Setup Hub', icon: <Settings size={20}/>, color: 'slate', core: true },
];

export default function ModulesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [config, setConfig] = useState<Record<string, boolean>>({
    dashboard: true,
    pipeline: true,
    interviews: true,
    candidates: true,
    jobs: true,
    'activity-logs': true,
    settings: true,
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.modulesConfig) {
          setConfig(res.data.modulesConfig);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { modulesConfig: config });
      setMessage({ type: 'success', text: 'Modules configuration saved! Restarting system logic...' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
        window.location.reload(); // Refresh to update sidebar
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ active, onClick, disabled }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`w-10 h-5 rounded-full relative transition-all duration-200 focus:outline-none ${
        disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
      } ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <motion.div 
        animate={{ x: active ? 20 : 2 }}
        className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Modules</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Feature Management</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Deploy Changes'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_MODULES.map((module) => (
          <motion.div 
            key={module.id}
            whileHover={{ y: -2 }}
            className={`bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between h-48 transition-all ${!config[module.id] ? 'grayscale-[0.5] opacity-80' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl bg-${module.color}-50 text-${module.color}-600`}>
                {module.icon}
              </div>
              <Toggle 
                active={config[module.id] || false} 
                disabled={module.core}
                onClick={() => setConfig({...config, [module.id]: !config[module.id]})} 
              />
            </div>
            
            <div>
               <div className="flex items-center space-x-2 mb-1">
                 <h3 className="text-sm font-black text-gray-900">{module.name}</h3>
                 {module.core && <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-blue-100">Core</span>}
               </div>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                 {module.core ? 'Required for system operation' : `Manage ${module.name.toLowerCase()} features`}
               </p>
            </div>
          </motion.div>
        ))}

        {/* Info Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] -mr-16 -mt-16"></div>
            <div className="flex items-center space-x-3 mb-3 relative z-10">
               <Zap className="text-yellow-400" size={20} />
               <h3 className="font-black text-sm uppercase tracking-widest">Instant Sync</h3>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-gray-400 relative z-10">Disabling a module will instantly hide it from the navigation sidebar for all recruiters. Core modules cannot be disabled.</p>
        </div>
      </div>
    </div>
  );
}

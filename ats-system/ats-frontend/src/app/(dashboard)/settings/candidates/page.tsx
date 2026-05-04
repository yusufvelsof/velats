'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  X, 
  CheckCircle2,
  Settings,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSettings } from '@/lib/contexts/SettingsContext';
import { toast } from 'sonner';

export default function CandidateSettingsPage() {
  const router = useRouter();
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(!settings);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState({
    candidateStatuses: [] as string[],
    candidateSources: [] as string[],
    attachmentCategories: [] as string[]
  });

  const [initialConfig, setInitialConfig] = useState('');
  const [addingTo, setAddingTo] = useState<keyof typeof config | null>(null);
  const [newItemValue, setNewItemValue] = useState('');

  useEffect(() => {
    if (settings) {
      const data = {
        candidateStatuses: settings.candidateStatuses || [],
        candidateSources: settings.candidateSources || [],
        attachmentCategories: settings.attachmentCategories || []
      };
      setConfig(data);
      setInitialConfig(JSON.stringify(data));
      setLoading(false);
    }
  }, [settings]);

  const isDirty = initialConfig !== JSON.stringify(config);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/company', config);
      await refreshSettings();
      setInitialConfig(JSON.stringify(config));
      toast.success('Settings synchronized successfully');
    } catch (err) {
      toast.error('Failed to synchronize settings');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: keyof typeof config) => {
    if (!newItemValue.trim()) {
      setAddingTo(null);
      return;
    }
    
    if (config[type].some(item => item.toLowerCase() === newItemValue.trim().toLowerCase())) {
      toast.error('This item already exists');
      return;
    }

    setConfig({ ...config, [type]: [...config[type], newItemValue.trim()] });
    setNewItemValue('');
    setAddingTo(null);
  };

  const removeItem = (type: keyof typeof config, index: number) => {
    const updated = config[type].filter((_, i) => i !== index);
    setConfig({ ...config, [type]: updated });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
         <p className="text-slate-400 font-black tracking-widest uppercase text-[10px]">Retrieving Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-6">
          <button onClick={() => router.back()} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 hover:border-slate-200">
            <ChevronLeft size={22} />
          </button>
          <div className="border-r border-slate-200 pr-8">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Candidate Config</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Recruitment Master Data</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <AnimatePresence>
            {isDirty && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0 }}
                className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100"
              >
                Unsaved Changes
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center justify-center bg-[#0A2540] text-white hover:bg-[#4F46E5] rounded-xl shadow-md transition-all duration-300 active:scale-95 px-8 py-3 space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{saving ? 'Syncing...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Statuses Section */}
         <section className="corporate-card p-10 space-y-8 lg:col-span-2">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Settings size={20}/></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#0F172A]">Candidate Lifecycle Statuses</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stages for the recruitment pipeline</p>
                  </div>
               </div>
               <button 
                 onClick={() => setAddingTo('candidateStatuses')} 
                 className="p-3 bg-[#0A2540] text-white rounded-2xl hover:bg-[#4F46E5] transition-all shadow-xl active:scale-95"
               >
                 <Plus size={20}/>
               </button>
            </div>

            <div className="flex flex-wrap gap-4">
               <AnimatePresence>
                 {config.candidateStatuses.map((s, i) => (
                   <motion.div 
                     key={s} 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] flex items-center space-x-4 group hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all"
                   >
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#0F172A]">{s}</span>
                      <button onClick={() => removeItem('candidateStatuses', i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                        <Trash2 size={14}/>
                      </button>
                   </motion.div>
                 ))}
               </AnimatePresence>

               {addingTo === 'candidateStatuses' && (
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center bg-white border-2 border-indigo-600 rounded-[1.25rem] px-4 py-2 shadow-2xl">
                    <input 
                      autoFocus 
                      className="bg-transparent border-none text-[11px] font-black uppercase outline-none min-w-[150px] p-1" 
                      placeholder="Status Name..." 
                      value={newItemValue}
                      onChange={e => setNewItemValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addItem('candidateStatuses')}
                      onBlur={() => !newItemValue && setAddingTo(null)}
                    />
                    <button onClick={() => addItem('candidateStatuses')} className="text-indigo-600 hover:scale-110 transition-transform ml-2"><CheckCircle2 size={18}/></button>
                 </motion.div>
               )}
            </div>
         </section>

         {/* Sources Section */}
         <section className="corporate-card p-10 space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner"><Target size={20}/></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#0F172A]">Origin Sources</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Where candidates are discovered</p>
                  </div>
               </div>
               <button onClick={() => setAddingTo('candidateSources')} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all active:scale-95"><Plus size={18}/></button>
            </div>
            
            <div className="flex flex-wrap gap-3">
               {config.candidateSources.map((s, i) => (
                 <div key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3 group hover:border-amber-200 transition-all">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{s}</span>
                    <button onClick={() => removeItem('candidateSources', i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={12}/></button>
                 </div>
               ))}
               {addingTo === 'candidateSources' && (
                 <div className="flex items-center bg-white border-2 border-amber-500 rounded-2xl px-3 py-1 shadow-lg">
                    <input autoFocus className="bg-transparent border-none text-[10px] font-black uppercase outline-none min-w-[120px]" placeholder="Source..." value={newItemValue} onChange={e => setNewItemValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem('candidateSources')} />
                    <button onClick={() => addItem('candidateSources')} className="text-amber-500 ml-2"><CheckCircle2 size={16}/></button>
                 </div>
               )}
            </div>
         </section>

         {/* Attachment Categories Section */}
         <section className="corporate-card p-10 space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-inner"><FileText size={20}/></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#0F172A]">Document Vault Taxonomy</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Classification for profile attachments</p>
                  </div>
               </div>
               <button onClick={() => setAddingTo('attachmentCategories')} className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all active:scale-95"><Plus size={18}/></button>
            </div>
            
            <div className="flex flex-wrap gap-3">
               {config.attachmentCategories.map((s, i) => (
                 <div key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3 group hover:border-purple-200 transition-all">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{s}</span>
                    <button onClick={() => removeItem('attachmentCategories', i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X size={12}/></button>
                 </div>
               ))}
               {addingTo === 'attachmentCategories' && (
                 <div className="flex items-center bg-white border-2 border-purple-500 rounded-2xl px-3 py-1 shadow-lg">
                    <input autoFocus className="bg-transparent border-none text-[10px] font-black uppercase outline-none min-w-[120px]" placeholder="Category..." value={newItemValue} onChange={e => setNewItemValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem('attachmentCategories')} />
                    <button onClick={() => addItem('attachmentCategories')} className="text-purple-500 ml-2"><CheckCircle2 size={16}/></button>
                 </div>
               )}
            </div>
         </section>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  X, 
  Layers, 
  Cpu, 
  Target, 
  MessageSquare, 
  CheckCircle2,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useSettings } from '@/lib/contexts/SettingsContext';
import { toast } from 'sonner';

export default function InterviewSettingsPage() {
  const router = useRouter();
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(!settings);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState({
    departments: [] as string[],
    technologies: [] as string[],
    interviewLevels: [] as string[],
    feedbackSchema: [] as { category: string, subCategories: string[] }[]
  });

  const [initialConfig, setInitialConfig] = useState('');
  const [newInput, setNewInput] = useState({ dept: '', tech: '', level: '', cat: '' });

  useEffect(() => {
    if (settings) {
      const data = {
        departments: settings.departments || [],
        technologies: settings.technologies || [],
        interviewLevels: settings.interviewLevels || [],
        feedbackSchema: settings.feedbackSchema || []
      };
      setConfig(data);
      setInitialConfig(JSON.stringify(data));
      setLoading(false);
    }
  }, [settings]);

  const isDirty = initialConfig !== JSON.stringify(config);

  const addItem = (key: 'departments' | 'technologies' | 'interviewLevels', value: string) => {
    if (!value.trim()) return;
    if (config[key].includes(value.trim())) {
      toast.error('Item already exists');
      return;
    }
    setConfig(prev => ({ ...prev, [key]: [...prev[key], value.trim()] }));
    setNewInput(prev => ({ ...prev, [key === 'departments' ? 'dept' : key === 'technologies' ? 'tech' : 'level']: '' }));
  };

  const removeItem = (key: 'departments' | 'technologies' | 'interviewLevels', index: number) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const addFeedbackCategory = () => {
    if (!newInput.cat.trim()) return;
    if (config.feedbackSchema.some(c => c.category.toLowerCase() === newInput.cat.trim().toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    setConfig(prev => ({
      ...prev,
      feedbackSchema: [...prev.feedbackSchema, { category: newInput.cat.trim(), subCategories: [] }]
    }));
    setNewInput(prev => ({ ...prev, cat: '' }));
  };

  const addSubCategory = (catIndex: number, subName: string) => {
    if (!subName.trim()) return;
    const currentSchema = [...config.feedbackSchema];
    if (!currentSchema[catIndex].subCategories.includes(subName.trim())) {
      currentSchema[catIndex].subCategories.push(subName.trim());
      setConfig(prev => ({ ...prev, feedbackSchema: currentSchema }));
    }
  };

  const removeSubCategory = (catIndex: number, subIndex: number) => {
    const currentSchema = [...config.feedbackSchema];
    currentSchema[catIndex].subCategories = currentSchema[catIndex].subCategories.filter((_, i) => i !== subIndex);
    setConfig(prev => ({ ...prev, feedbackSchema: currentSchema }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/company', config);
      await refreshSettings();
      setInitialConfig(JSON.stringify(config));
      toast.success('Interview configuration synchronized');
    } catch (err) {
      toast.error('Failed to update interview configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
         <p className="text-slate-400 font-black tracking-widest uppercase text-[10px]">Retrieving Core Logic...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-6">
          <button onClick={() => router.back()} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 hover:border-slate-200">
            <ChevronLeft size={22} />
          </button>
          <div className="border-r border-slate-200 pr-8">
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Interview Logic</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Assessment Master Config</p>
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
                Unsaved Logic Changes
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center justify-center bg-[#0A2540] text-white hover:bg-[#4F46E5] rounded-xl shadow-md transition-all duration-300 active:scale-95 px-8 py-3 space-x-3 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">Deploy Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Departments & Positions Group */}
        <div className="space-y-8">
           {/* Departments */}
           <section className="corporate-card p-10 space-y-6">
              <div className="flex items-center space-x-4 mb-2">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Layers size={20}/></div>
                 <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Organization Departments</h2>
              </div>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="e.g. Engineering"
                  className="flex-1 text-[11px] font-bold uppercase tracking-tight"
                  value={newInput.dept}
                  onChange={(e) => setNewInput(prev => ({ ...prev, dept: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('departments', newInput.dept)}
                />
                <button onClick={() => addItem('departments', newInput.dept)} className="p-3 bg-[#0A2540] text-white rounded-xl hover:bg-[#4F46E5] transition-all"><Plus size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-3">
                {config.departments.map((d, i) => (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} key={i} className="flex items-center space-x-3 bg-slate-50 text-slate-700 px-5 py-2.5 rounded-2xl border border-slate-200 group hover:border-indigo-200 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-tight">{d}</span>
                    <button onClick={() => removeItem('departments', i)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={12}/></button>
                  </motion.div>
                ))}
              </div>
           </section>

           {/* Positions */}
           <section className="corporate-card p-10 space-y-6">
              <div className="flex items-center space-x-4 mb-2">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-inner"><Cpu size={20}/></div>
                 <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Active Technologies / Positions</h2>
              </div>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="e.g. Senior React Developer"
                  className="flex-1 text-[11px] font-bold uppercase tracking-tight"
                  value={newInput.tech}
                  onChange={(e) => setNewInput(prev => ({ ...prev, tech: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('technologies', newInput.tech)}
                />
                <button onClick={() => addItem('technologies', newInput.tech)} className="p-3 bg-[#0A2540] text-white rounded-xl hover:bg-[#4F46E5] transition-all"><Plus size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-3">
                {config.technologies.map((t, i) => (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} key={i} className="flex items-center space-x-3 bg-purple-50/30 text-purple-700 px-5 py-2.5 rounded-2xl border border-purple-100 group hover:border-purple-300 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-tight">{t}</span>
                    <button onClick={() => removeItem('technologies', i)} className="text-purple-300 hover:text-rose-500 transition-colors"><X size={12}/></button>
                  </motion.div>
                ))}
              </div>
           </section>

           {/* Interview Levels */}
           <section className="corporate-card p-10 space-y-6">
              <div className="flex items-center space-x-4 mb-2">
                 <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl shadow-inner"><Target size={20}/></div>
                 <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Structured Interview Rounds</h2>
              </div>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="e.g. L1 - Technical Interview"
                  className="flex-1 text-[11px] font-bold uppercase tracking-tight"
                  value={newInput.level}
                  onChange={(e) => setNewInput(prev => ({ ...prev, level: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('interviewLevels', newInput.level)}
                />
                <button onClick={() => addItem('interviewLevels', newInput.level)} className="p-3 bg-[#0A2540] text-white rounded-xl hover:bg-[#4F46E5] transition-all"><Plus size={20}/></button>
              </div>
              <div className="space-y-3">
                {config.interviewLevels.map((l, i) => (
                  <motion.div key={i} initial={{ x: -10 }} animate={{ x: 0 }} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl group hover:bg-white hover:border-orange-200 transition-all shadow-inner hover:shadow-xl hover:shadow-orange-900/5">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{l}</span>
                    <button onClick={() => removeItem('interviewLevels', i)} className="text-slate-300 hover:text-rose-500 transition-all p-1 group-hover:opacity-100 opacity-0"><Trash2 size={16}/></button>
                  </motion.div>
                ))}
              </div>
           </section>
        </div>

        {/* Feedback Schema Builder */}
        <section className="corporate-card p-10 space-y-8 flex flex-col h-full">
           <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><MessageSquare size={20}/></div>
              <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Evaluation Intelligence Schema</h2>
           </div>
           
           <div className="flex space-x-3">
             <input 
               type="text" 
               placeholder="e.g. Cultural Compatibility"
               className="flex-1 text-[11px] font-bold uppercase tracking-tight"
               value={newInput.cat}
               onChange={(e) => setNewInput(prev => ({ ...prev, cat: e.target.value }))}
               onKeyDown={(e) => e.key === 'Enter' && addFeedbackCategory()}
             />
             <button onClick={addFeedbackCategory} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"><Plus size={20}/></button>
           </div>

           <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
             <AnimatePresence>
               {config.feedbackSchema.map((cat, ci) => (
                 <motion.div 
                   key={cat.category} 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all relative group/card hover:border-emerald-200"
                 >
                   <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div className="flex items-center space-x-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <h4 className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">{cat.category}</h4>
                      </div>
                      <button onClick={() => setConfig(prev => ({ ...prev, feedbackSchema: prev.feedbackSchema.filter((_, i) => i !== ci) }))} className="text-slate-300 hover:text-rose-500 transition-all"><X size={16}/></button>
                   </div>
                   
                   <div className="flex flex-wrap gap-3">
                      {cat.subCategories.map((sub, si) => (
                        <motion.span 
                          layout
                          key={si} 
                          className="flex items-center space-x-2 bg-emerald-50/50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-100 uppercase tracking-tight"
                        >
                           <span>{sub}</span>
                           <button onClick={() => removeSubCategory(ci, si)} className="text-emerald-300 hover:text-rose-500 transition-colors"><X size={10}/></button>
                        </motion.span>
                      ))}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 focus-within:bg-white focus-within:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                        <Plus size={10} className="text-emerald-400 mr-2" />
                        <input 
                          type="text" 
                          placeholder="ADD FEEDBACK METRIC" 
                          className="bg-transparent border-none p-0 text-[9px] w-28 font-black uppercase text-emerald-800 placeholder:text-emerald-300 outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSubCategory(ci, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
             {config.feedbackSchema.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                  <div className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
                     <Plus size={24}/>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Schema Defined</p>
               </div>
             )}
           </div>
        </section>
      </div>
    </div>
  );
}

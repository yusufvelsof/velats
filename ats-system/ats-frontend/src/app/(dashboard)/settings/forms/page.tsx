'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Layout, 
  Plus, 
  X, 
  GripVertical, 
  Settings, 
  CheckCircle2, 
  X as CloseIcon,
  Eye,
  Type,
  FileText,
  MousePointer2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const WALK_IN_FIELDS = [
  // Basic
  { id: 'name', label: 'Full Name', type: 'text', required: true, core: true },
  { id: 'email', label: 'Email Address', type: 'email', required: true, core: true },
  { id: 'mobile', label: 'Mobile Number', type: 'tel', required: true, core: true },
  { id: 'gender', label: 'Gender', type: 'select', required: true, core: true },
  { id: 'currentLocation', label: 'Current Location', type: 'text', required: false, core: false },
  { id: 'hometown', label: 'Hometown', type: 'text', required: false, core: false },
  
  // Education
  { id: 'tenthPercentage', label: '10th Percentage', type: 'text', required: true, core: false },
  { id: 'twelfthPercentage', label: '12th Percentage', type: 'text', required: true, core: false },
  { id: 'graduationDegree', label: 'Graduation Degree', type: 'select', required: true, core: false },
  { id: 'graduationYear', label: 'Graduation Year', type: 'select', required: true, core: false },
  { id: 'graduationPercentage', label: 'Graduation %', type: 'text', required: true, core: false },
  { id: 'graduationCollege', label: 'Graduation College', type: 'text', required: true, core: false },
  
  // Professional
  { id: 'experienceType', label: 'Experience Type', type: 'select', required: true, core: false },
  { id: 'experienceDuration', label: 'Experience Duration', type: 'select', required: true, core: false },
  { id: 'technologies', label: 'Primary Technologies', type: 'text', required: true, core: false },
  { id: 'dbProficiency', label: 'DB Proficiency (1-5)', type: 'number', required: true, core: false },
  
  // Uploads
  { id: 'resume', label: 'Resume (PDF)', type: 'file', required: true, core: true },
  { id: 'photo', label: 'Passport Photo', type: 'file', required: true, core: true },
  { id: 'certificate', label: 'Other Certificate', type: 'file', required: false, core: false },
];

export default function FormBuilderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeForm, setActiveForm] = useState<'walkin' | 'career'>('walkin');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formConfig, setFormConfig] = useState({
    walkin: {
      fields: [...WALK_IN_FIELDS],
      theme: 'classic'
    },
    career: {
      fields: [...WALK_IN_FIELDS.slice(0, 8), WALK_IN_FIELDS[WALK_IN_FIELDS.length-2]],
      theme: 'modern'
    }
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.formConfig) {
          setFormConfig(res.data.formConfig);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { formConfig });
      setMessage({ type: 'success', text: 'Form layout published!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRequired = (id: string) => {
    const newConfig = { ...formConfig };
    const field = newConfig[activeForm].fields.find(f => f.id === id);
    if (field && !field.core) {
      field.required = !field.required;
      setFormConfig(newConfig);
    }
  };

  const Toggle = ({ active, onClick, disabled }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`w-8 h-4 rounded-full relative transition-all duration-200 focus:outline-none ${
        disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
      } ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20 no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Form Builder</h1>
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl">
             <button 
               onClick={() => setActiveForm('walkin')}
               className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeForm === 'walkin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
             >Walk-in Form</button>
             <button 
               onClick={() => setActiveForm('career')}
               className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeForm === 'career' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
             >Career Site Form</button>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Publishing...' : 'Publish Form'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
        {/* Field Orchestrator */}
        <div className="lg:col-span-2 overflow-y-auto no-scrollbar pb-10">
          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Layout size={18}/></div>
                   <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Available Fields</h2>
                </div>
             </div>
             <div className="divide-y divide-gray-50">
                {formConfig[activeForm].fields.map((field) => (
                  <div key={field.id} className="p-4 flex items-center justify-between group hover:bg-gray-50/30 transition-colors">
                    <div className="flex items-center space-x-4">
                       <GripVertical size={16} className="text-gray-200 group-hover:text-gray-400 cursor-grab" />
                       <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          {field.type === 'file' ? <FileText size={16}/> : <Type size={16}/>}
                       </div>
                       <div>
                          <div className="flex items-center space-x-2">
                             <p className="text-sm font-black text-gray-800">{field.label}</p>
                             {field.core && <span className="text-[7px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded uppercase tracking-tighter border border-blue-100">System Core</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{field.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-6">
                       <div className="flex items-center space-x-3">
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${field.required ? 'text-blue-600' : 'text-gray-300'}`}>Mandatory</span>
                          <Toggle active={field.required} onClick={() => toggleRequired(field.id)} disabled={field.core} />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Global Form Settings */}
        <div className="space-y-6 overflow-y-auto no-scrollbar">
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Settings size={14} className="text-blue-500" />
              <span>Form Behavior</span>
            </h2>
            <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Theme</label>
                 <div className="grid grid-cols-2 gap-2">
                    {['classic', 'modern'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFormConfig({...formConfig, [activeForm]: {...formConfig[activeForm], theme: t}})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          formConfig[activeForm].theme === t ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400 border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
                 <MousePointer2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Global Logic</h4>
                    <p className="text-[9px] text-blue-700/70 font-medium leading-relaxed mt-1">Changes made here are instantly deployed to your public registration links.</p>
                 </div>
              </div>
            </div>
          </section>

          {/* Quick Preview Link */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] -mr-16 -mt-16"></div>
            <div className="flex items-center space-x-3 mb-3 relative z-10">
               <Eye className="text-blue-400" size={20} />
               <h3 className="font-black text-sm uppercase tracking-widest">Live Preview</h3>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-gray-400 mb-6 relative z-10">See exactly how your candidates will view this form on mobile and desktop devices.</p>
            <button className="relative z-10 w-full py-3 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
               <span>Launch Preview</span>
               <ExternalLink size={12}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Cpu, 
  Database, 
  Zap, 
  CheckCircle2, 
  X,
  RefreshCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SYSTEM_FIELDS = [
  { id: 'name', label: 'Candidate Name', type: 'Text' },
  { id: 'email', label: 'Email Address', type: 'Email' },
  { id: 'phone', label: 'Phone Number', type: 'Phone' },
  { id: 'skills', label: 'Skills / Tags', type: 'List' },
  { id: 'experience', label: 'Years of Experience', type: 'Number' },
  { id: 'location', label: 'Current City', type: 'Text' },
];

export default function ParserMappingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [parserSettings, setParserSettings] = useState({
    autoParseEnabled: true,
    confidenceThreshold: 85,
    extractSkillsCount: 10,
    requiredFields: ['name', 'email'],
    engine: 'local',
    apiKey: '',
    mapping: {
      name: ['full_name', 'name', 'candidate_name'],
      email: ['email', 'email_address', 'contact_email'],
      phone: ['phone', 'mobile', 'cell'],
      skills: ['skills', 'technologies', 'competencies'],
      experience: ['experience', 'work_history', 'duration'],
      location: ['address', 'city', 'location']
    }
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.parserSettings) {
          setParserSettings(res.data.parserSettings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { parserSettings });
      setMessage({ type: 'success', text: 'Parser mapping updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Parser Mapping</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Extraction Logic</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Mapping'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mapping Table */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Database size={18}/></div>
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Field Mapping</h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50/30 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">System Field</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Extraction Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SYSTEM_FIELDS.map((field) => (
                  <tr key={field.id}>
                    <td className="px-6 py-4">
                       <p className="text-sm font-black text-gray-900">{field.label}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{field.type}</p>
                    </td>
                    <td className="px-6 py-4">
                       <input 
                         type="text"
                         className="w-full text-xs font-mono !bg-gray-50 border-slate-200 focus:!bg-white"
                         value={parserSettings.mapping[field.id as keyof typeof parserSettings.mapping].join(', ')}
                         onChange={(e) => {
                           const val = e.target.value.split(',').map(s => s.trim());
                           setParserSettings({
                             ...parserSettings,
                             mapping: { ...parserSettings.mapping, [field.id]: val }
                           });
                         }}
                       />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="space-y-6">
          {/* AI Controls */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Zap size={14} className="text-blue-500" />
              <span>Extraction Engine</span>
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Engine</label>
                <select 
                  className="w-full text-xs font-bold bg-gray-50 border-slate-200 rounded-xl p-3 outline-none focus:bg-white transition-all"
                  value={parserSettings.engine}
                  onChange={(e) => setParserSettings({...parserSettings, engine: e.target.value})}
                >
                  <option value="local">Local Extraction (Regex)</option>
                  <option value="gemini">Google Gemini (AI)</option>
                  <option value="openai">OpenAI GPT-4 (AI)</option>
                </select>
              </div>

              {parserSettings.engine !== 'local' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AI API Key</label>
                  <input 
                    type="password"
                    placeholder="sk-..."
                    className="w-full text-xs font-mono bg-gray-50 border-slate-200 rounded-xl p-3 outline-none focus:bg-white transition-all"
                    value={parserSettings.apiKey}
                    onChange={(e) => setParserSettings({...parserSettings, apiKey: e.target.value})}
                  />
                  <p className="text-[9px] text-gray-400 font-medium px-1 leading-tight">Your key is stored securely and never shared. Requires a valid subscription.</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div>
                  <p className="text-sm font-black text-gray-800">Auto-Parse Resumes</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Run AI on every upload</p>
                </div>
                <Toggle active={parserSettings.autoParseEnabled} onClick={() => setParserSettings({...parserSettings, autoParseEnabled: !parserSettings.autoParseEnabled})} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence Threshold</label>
                  <span className="text-xs font-black text-blue-600">{parserSettings.confidenceThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="100" 
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={parserSettings.confidenceThreshold}
                  onChange={(e) => setParserSettings({...parserSettings, confidenceThreshold: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-50">
                 <div className="flex items-center space-x-2 text-orange-500 mb-2">
                    <AlertCircle size={14}/>
                    <span className="text-[10px] font-black uppercase">Validation Rules</span>
                 </div>
                 {['name', 'email'].map(field => (
                   <div key={field} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-bold text-gray-600 capitalize">{field} is mandatory</span>
                   </div>
                 ))}
              </div>
            </div>
          </section>

          {/* Refresh Action */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] -mr-16 -mt-16"></div>
            <h3 className="text-lg font-bold mb-2">Re-index Data ⚡</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6 font-medium">Changed your labels? Run the parser across your existing talent pool to update mappings.</p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20">
              <RefreshCcw size={14}/>
              <span>Run Mass Parse</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

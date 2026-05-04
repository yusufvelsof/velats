'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Inbox, 
  Mail, 
  Shield, 
  Zap, 
  CheckCircle2, 
  X,
  Copy,
  RefreshCw,
  HardDrive,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumeInboxPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [inboxSettings, setInboxSettings] = useState({
    systemEmail: 'intake_vsoft_921@velocity-ats.com',
    autoSyncEnabled: true,
    forwardingActive: false,
    defaultJobId: '',
    autoTag: 'Inbox-Upload',
    imap: {
      host: '',
      port: 993,
      username: '',
      password: '',
      secure: true
    },
    retentionDays: 30
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.resumeInboxSettings) {
          setInboxSettings(res.data.resumeInboxSettings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { resumeInboxSettings: inboxSettings });
      setMessage({ type: 'success', text: 'Inbox configuration saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(inboxSettings.systemEmail);
    alert('System email copied to clipboard!');
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Resume Inbox</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Automated Intake</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Config'}</span>
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
          {/* Direct System Email */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Inbox size={120} />
            </div>
            <div className="space-y-2 relative z-10">
               <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Direct Intake Address</h2>
               <p className="text-sm text-gray-400 font-medium">Forward resumes to this address to automatically add them as candidates.</p>
            </div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className="flex-1 bg-gray-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between group hover:border-blue-200 transition-all">
                <code className="text-sm font-black text-gray-700">{inboxSettings.systemEmail}</code>
                <button onClick={copyEmail} className="text-gray-300 hover:text-blue-600 p-1"><Copy size={18}/></button>
              </div>
              <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm border border-slate-200">
                <RefreshCw size={20} />
              </button>
            </div>
          </section>

          {/* Custom Integration */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Mail size={18}/></div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Custom Email Integration</h2>
               </div>
               <Toggle 
                 active={inboxSettings.forwardingActive} 
                 onClick={() => setInboxSettings({...inboxSettings, forwardingActive: !inboxSettings.forwardingActive})} 
               />
            </div>
            <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${!inboxSettings.forwardingActive ? 'opacity-40 pointer-events-none' : ''}`}>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IMAP Host</label>
                  <input 
                    type="text" 
                    placeholder="imap.gmail.com"
                    value={inboxSettings.imap.host}
                    onChange={(e) => setInboxSettings({...inboxSettings, imap: {...inboxSettings.imap, host: e.target.value}})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Port</label>
                  <input 
                    type="number" 
                    value={inboxSettings.imap.port}
                    onChange={(e) => setInboxSettings({...inboxSettings, imap: {...inboxSettings.imap, port: parseInt(e.target.value)}})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    type="text" 
                    placeholder="recruiter@company.com"
                    value={inboxSettings.imap.username}
                    onChange={(e) => setInboxSettings({...inboxSettings, imap: {...inboxSettings.imap, username: e.target.value}})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password / App Key</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={inboxSettings.imap.password}
                    onChange={(e) => setInboxSettings({...inboxSettings, imap: {...inboxSettings.imap, password: e.target.value}})}
                  />
               </div>
            </div>
            {inboxSettings.forwardingActive && (
              <div className="px-8 pb-8 flex justify-end">
                <button className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                  <RefreshCw size={14} className="mr-2" />
                  <span>Test Connection</span>
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Rules & Automation */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Zap size={14} className="text-blue-500" />
              <span>Intake Rules</span>
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Auto-Tag Incoming</label>
                <input 
                  type="text" 
                  className="w-full text-xs font-bold text-blue-600"
                  value={inboxSettings.autoTag}
                  onChange={(e) => setInboxSettings({...inboxSettings, autoTag: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default Job Assignment</label>
                <select 
                  className="w-full text-[10px] font-black uppercase"
                  value={inboxSettings.defaultJobId}
                  onChange={(e) => setInboxSettings({...inboxSettings, defaultJobId: e.target.value})}
                >
                  <option value="">General Talent Pool</option>
                  <option value="1">Open Pipeline</option>
                </select>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <HardDrive size={14} className="text-blue-500" />
              <span>Storage Policy</span>
            </h2>
            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inbox Retention</label>
                  <span className="text-xs font-black text-blue-600">{inboxSettings.retentionDays} Days</span>
               </div>
               <input 
                 type="range" 
                 min="1" max="90" 
                 className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 value={inboxSettings.retentionDays}
                 onChange={(e) => setInboxSettings({...inboxSettings, retentionDays: parseInt(e.target.value)})}
               />
               <p className="text-[9px] text-gray-400 italic">Emails are automatically purged after this period to save space.</p>
            </div>
          </section>

          {/* Help/Status */}
          <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-200">
             <div className="flex items-center space-x-3 mb-3">
                <Shield size={20} />
                <h3 className="font-black text-sm uppercase tracking-widest">System Health</h3>
             </div>
             <p className="text-[11px] font-medium leading-relaxed mb-4">Intake engine is monitored 24/7. All incoming data is encrypted and parsed in real-time.</p>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-tighter">Engine: Online</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

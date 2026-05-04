'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Code2, 
  Webhook, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Copy,
  Plus,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeveloperSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    apiKeys: [
      { id: '1', name: 'Production Key', key: 'vlt_pk_live_823192x...', created: '2026-04-20' },
      { id: '2', name: 'Staging Environment', key: 'vlt_pk_test_992102y...', created: '2026-04-22' }
    ],
    webhooks: [
      { id: '1', url: 'https://hooks.velocity.com/intake', event: 'candidate.created' }
    ]
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.developerSettings) {
          setSettings(res.data.developerSettings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { developerSettings: settings });
      setMessage({ type: 'success', text: 'Developer settings deployed!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to deploy settings' });
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Developer Space</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">API & Integration</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* API Keys */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Key size={18}/></div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">API Access Tokens</h2>
             </div>
             <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                <Plus size={14}/>
                <span>Generate New</span>
             </button>
          </div>
          <div className="divide-y divide-gray-50">
             {settings.apiKeys.map(key => (
               <div key={key.id} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center space-x-6">
                     <div>
                        <p className="text-sm font-black text-gray-900">{key.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Created {key.created}</p>
                     </div>
                     <div className="bg-gray-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-3">
                        <code className="text-[10px] font-mono font-bold text-gray-500">{key.key}</code>
                        <button className="text-gray-300 hover:text-blue-600"><Copy size={14}/></button>
                     </div>
                  </div>
                  <button className="text-gray-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                    <Trash2 size={16}/>
                  </button>
               </div>
             ))}
          </div>
        </section>

        {/* Webhooks */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Webhook size={18}/></div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Incoming Webhooks</h2>
             </div>
             <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                <Plus size={14}/>
                <span>Add Endpoint</span>
             </button>
          </div>
          <div className="p-8">
             {settings.webhooks.map(hook => (
               <div key={hook.id} className="flex items-center space-x-4 bg-gray-50 border border-slate-200 p-4 rounded-2xl group hover:border-blue-200 transition-all">
                  <div className="flex-1">
                     <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mb-1">Payload URL</p>
                     <p className="text-xs font-black text-gray-700">{hook.url}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Event Trigger</p>
                     <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">{hook.event}</span>
                  </div>
                  <button className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
               </div>
             ))}
          </div>
        </section>

        {/* Documentation Link */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-20 -mt-20"></div>
           <div className="relative z-10 flex items-center space-x-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                 <Code2 size={32} />
              </div>
              <div>
                 <h3 className="text-2xl font-black tracking-tight">System Documentation</h3>
                 <p className="text-blue-100 text-sm font-medium">Learn how to build powerful integrations using the Velocity API.</p>
              </div>
           </div>
           <button className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 flex items-center space-x-2">
              <span>View API Docs</span>
              <ExternalLink size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}

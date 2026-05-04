'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Zap, 
  Mail, 
  Calendar, 
  RefreshCcw, 
  CheckCircle2, 
  X,
  Clock,
  Settings,
  ArrowRight,
  BellRing,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AutomationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [automation, setAutomation] = useState({
    interviewInvitation: { enabled: true, templateId: '1', delay: 'immediate' },
    rescheduleNotice: { enabled: true, templateId: '3', delay: 'immediate' },
    cancellationNotice: { enabled: true, templateId: '4', delay: 'immediate' },
    autoMoveToInterview: true,
    reminder24h: true,
    reminder1h: false,
    feedbackRequest: { enabled: true, afterHours: 2 }
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.automationConfig) {
          setAutomation(res.data.automationConfig);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { automationConfig: automation });
      setMessage({ type: 'success', text: 'Automation rules deployed!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to deploy rules' });
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Automation</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workflow Engine</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={16} />}
          <span>{saving ? 'Deploying...' : 'Save Workflows'}</span>
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
          {/* Interview Communication */}
          <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
               <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Mail size={18}/></div>
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Candidate Comms Triggers</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {/* Invitation */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-sm font-black text-gray-800">Interview Invitation</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Send when a new round is scheduled</p>
                   </div>
                   <Toggle active={automation.interviewInvitation.enabled} onClick={() => setAutomation({...automation, interviewInvitation: {...automation.interviewInvitation, enabled: !automation.interviewInvitation.enabled}})} />
                </div>
                {automation.interviewInvitation.enabled && (
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                     <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Selected Template</label>
                        <select className="w-full bg-transparent border-none p-0 text-xs font-black text-blue-600 outline-none focus:ring-0">
                           <option>Standard Interview Invitation</option>
                           <option>Technical Assessment Request</option>
                        </select>
                     </div>
                     <ArrowRight size={14} className="text-gray-300" />
                     <div className="w-32 space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Delivery Delay</label>
                        <select className="w-full bg-transparent border-none p-0 text-xs font-black text-gray-700 outline-none focus:ring-0">
                           <option>Immediate</option>
                           <option>After 1 hour</option>
                        </select>
                     </div>
                  </div>
                )}
              </div>

              {/* Reschedule */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-sm font-black text-gray-800">Reschedule Notice</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Send when interview date/time changes</p>
                   </div>
                   <Toggle active={automation.rescheduleNotice.enabled} onClick={() => setAutomation({...automation, rescheduleNotice: {...automation.rescheduleNotice, enabled: !automation.rescheduleNotice.enabled}})} />
                </div>
              </div>

              {/* Cancellation */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-sm font-black text-gray-800">Cancellation Notice</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Send when an interview is removed</p>
                   </div>
                   <Toggle active={automation.cancellationNotice.enabled} onClick={() => setAutomation({...automation, cancellationNotice: {...automation.cancellationNotice, enabled: !automation.cancellationNotice.enabled}})} />
                </div>
              </div>
            </div>
          </section>

          {/* Workflow Sync */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <RefreshCcw size={14} className="text-blue-500" />
              <span>Pipeline Synchronization</span>
            </h2>
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><Calendar size={20} className="text-blue-600"/></div>
                  <div>
                     <p className="text-sm font-black text-blue-900">Auto-Move to Interview Stage</p>
                     <p className="text-[10px] text-blue-700/60 font-bold">Instantly update candidate status when an assessment is scheduled.</p>
                  </div>
               </div>
               <Toggle active={automation.autoMoveToInterview} onClick={() => setAutomation({...automation, autoMoveToInterview: !automation.autoMoveToInterview})} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Reminders */}
          <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <BellRing size={14} className="text-blue-500" />
              <span>Reminder Protocol</span>
            </h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs font-black text-gray-700">24h Before Reminder</span>
                  <Toggle active={automation.reminder24h} onClick={() => setAutomation({...automation, reminder24h: !automation.reminder24h})} />
               </div>
               <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-xs font-black text-gray-700">1h Before Reminder</span>
                  <Toggle active={automation.reminder1h} onClick={() => setAutomation({...automation, reminder1h: !automation.reminder1h})} />
               </div>
            </div>
          </section>

          {/* Warning Card */}
          <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100">
             <div className="flex items-center space-x-3 mb-3 text-orange-600">
                <AlertTriangle size={20} />
                <h3 className="font-black text-sm uppercase tracking-widest">Automation Guard</h3>
             </div>
             <p className="text-[10px] font-medium leading-relaxed text-orange-800/70">
                Ensure your Email Templates contain valid placeholders. Failed automations are logged in the <b>Audit Trail</b>.
             </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 text-center">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Automations Active</p>
                <p className="text-4xl font-black text-white tracking-tighter">08</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

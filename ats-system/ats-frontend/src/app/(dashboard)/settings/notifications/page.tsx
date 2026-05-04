'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  X,
  Smartphone,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    emailAlerts: true,
    newCandidate: true,
    newApplication: true,
    interviewReminders: '30min',
    systemUpdates: true,
    desktopPush: false,
    dailyDigest: false,
  });

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        if (res.data.notificationSettings) {
          setSettings(res.data.notificationSettings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/users/profile', { notificationSettings: settings });
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Notifications</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alert Preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Email Notifications */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Mail size={18}/></div>
             <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Email Notifications</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="p-6 flex items-center justify-between group">
              <div>
                <p className="text-sm font-black text-gray-800">Master Email Switch</p>
                <p className="text-xs text-gray-400 font-medium">Enable or disable all outgoing email alerts from the system.</p>
              </div>
              <Toggle active={settings.emailAlerts} onClick={() => toggleSetting('emailAlerts')} />
            </div>
            <div className={`p-6 flex items-center justify-between transition-opacity ${!settings.emailAlerts ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <p className="text-sm font-black text-gray-800">New Candidate Registered</p>
                <p className="text-xs text-gray-400 font-medium">Get notified when a new talent enters your pool.</p>
              </div>
              <Toggle active={settings.newCandidate} onClick={() => toggleSetting('newCandidate')} />
            </div>
            <div className={`p-6 flex items-center justify-between transition-opacity ${!settings.emailAlerts ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <p className="text-sm font-black text-gray-800">New Job Application</p>
                <p className="text-xs text-gray-400 font-medium">Receive an email whenever a candidate applies for a role.</p>
              </div>
              <Toggle active={settings.newApplication} onClick={() => toggleSetting('newApplication')} />
            </div>
            <div className={`p-6 flex items-center justify-between transition-opacity ${!settings.emailAlerts ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <p className="text-sm font-black text-gray-800">Daily Activity Digest</p>
                <p className="text-xs text-gray-400 font-medium">A summary email of all recruitment activity at the end of the day.</p>
              </div>
              <Toggle active={settings.dailyDigest} onClick={() => toggleSetting('dailyDigest')} />
            </div>
          </div>
        </section>

        {/* System & Push */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
             <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Smartphone size={18}/></div>
             <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">In-App & Push Alerts</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-800">Browser Push Notifications</p>
                <p className="text-xs text-gray-400 font-medium">Receive real-time alerts even when the tab is not focused.</p>
              </div>
              <Toggle active={settings.desktopPush} onClick={() => toggleSetting('desktopPush')} />
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-gray-800">System Updates & Maintenance</p>
                <p className="text-xs text-gray-400 font-medium">Get notified about new features and scheduled downtime.</p>
              </div>
              <Toggle active={settings.systemUpdates} onClick={() => toggleSetting('systemUpdates')} />
            </div>
          </div>
        </section>

        {/* Interviews */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center space-x-3">
             <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Clock size={18}/></div>
             <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assessment Reminders</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-gray-800">Interview Lead Time</p>
              <p className="text-xs text-gray-400 font-medium">When should we send you the first reminder for an upcoming assessment?</p>
            </div>
            <select 
              className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-slate-200 py-2 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.interviewReminders}
              onChange={(e) => setSettings(prev => ({ ...prev, interviewReminders: e.target.value }))}
            >
              <option value="5min">5 Minutes before</option>
              <option value="15min">15 Minutes before</option>
              <option value="30min">30 Minutes before</option>
              <option value="1hour">1 Hour before</option>
              <option value="none">Disabled</option>
            </select>
          </div>
        </section>
      </div>
    </div>
  );
}

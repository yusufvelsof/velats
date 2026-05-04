'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Globe, 
  Layout, 
  Palette, 
  Share2, 
  CheckCircle2, 
  X,
  ExternalLink,
  Eye,
  Monitor
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PortalSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [portalSettings, setPortalSettings] = useState({
    siteTitle: 'Join Our Team',
    tagline: 'Building the future of software, together.',
    brandColor: '#2563eb',
    showSalary: true,
    showPostedDate: true,
    allowQuickApply: true,
    portalStatus: 'online',
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        if (res.data.portalSettings) {
          setPortalSettings(res.data.portalSettings);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/company', { portalSettings });
      setMessage({ type: 'success', text: 'Career portal updated!' });
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Portal Settings</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Career Site Config</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Site'}</span>
          </button>
        </div>
      </div>

      {message.text && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Branding */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Globe size={14} className="text-blue-500" />
              <span>Public Identity</span>
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Portal Main Title</label>
                <input 
                  type="text" 
                  className="w-full text-sm font-bold"
                  value={portalSettings.siteTitle}
                  onChange={(e) => setPortalSettings({...portalSettings, siteTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Welcome Tagline</label>
                <textarea 
                  rows={2}
                  className="w-full text-sm"
                  value={portalSettings.tagline}
                  onChange={(e) => setPortalSettings({...portalSettings, tagline: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Layout size={14} className="text-blue-500" />
              <span>Layout & Experience</span>
            </h2>
            <div className="divide-y divide-gray-50">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-800">Display Salary Range</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Show pay scales directly on job listings</p>
                </div>
                <Toggle active={portalSettings.showSalary} onClick={() => setPortalSettings({...portalSettings, showSalary: !portalSettings.showSalary})} />
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-800">Show Posted Date</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Display how long ago the job was listed</p>
                </div>
                <Toggle active={portalSettings.showPostedDate} onClick={() => setPortalSettings({...portalSettings, showPostedDate: !portalSettings.showPostedDate})} />
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-800">Enable Quick Apply</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Allow candidates to apply without a full account</p>
                </div>
                <Toggle active={portalSettings.allowQuickApply} onClick={() => setPortalSettings({...portalSettings, allowQuickApply: !portalSettings.allowQuickApply})} />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Palette size={14} className="text-blue-500" />
              <span>Theme</span>
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand Accent Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                    value={portalSettings.brandColor}
                    onChange={(e) => setPortalSettings({...portalSettings, brandColor: e.target.value})}
                  />
                  <input 
                    type="text"
                    className="flex-1 text-[10px] font-mono font-black"
                    value={portalSettings.brandColor}
                    onChange={(e) => setPortalSettings({...portalSettings, brandColor: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <Share2 size={14} className="text-blue-500" />
              <span>Social & Links</span>
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn Profile</label>
                <input 
                  type="text" 
                  className="w-full text-xs"
                  placeholder="linkedin.com/company/..."
                  value={portalSettings.socialLinks.linkedin}
                  onChange={(e) => setPortalSettings({...portalSettings, socialLinks: {...portalSettings.socialLinks, linkedin: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Twitter / X</label>
                <input 
                  type="text" 
                  className="w-full text-xs"
                  placeholder="@company"
                  value={portalSettings.socialLinks.twitter}
                  onChange={(e) => setPortalSettings({...portalSettings, socialLinks: {...portalSettings.socialLinks, twitter: e.target.value}})}
                />
              </div>
            </div>
          </section>

          {/* Status */}
          <div className={`p-6 rounded-3xl border shadow-sm transition-all ${portalSettings.portalStatus === 'online' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
             <div className="flex items-center justify-between">
                <div>
                   <p className={`text-[10px] font-black uppercase tracking-widest ${portalSettings.portalStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>Portal Status</p>
                   <p className="text-sm font-black text-gray-900 capitalize">{portalSettings.portalStatus}</p>
                </div>
                <Toggle 
                  active={portalSettings.portalStatus === 'online'} 
                  onClick={() => setPortalSettings({...portalSettings, portalStatus: portalSettings.portalStatus === 'online' ? 'offline' : 'online'})} 
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2,
  X,
  Type,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompanySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    primaryContact: '',
    description: '',
    alias: '',
    landline: '',
    mobile: '',
    address: ''
  });

  useEffect(() => {
    api.get('/company')
      .then(res => {
        setFormData({
          name: res.data.name || '',
          website: res.data.website || '',
          primaryContact: res.data.primaryContact || '',
          description: res.data.description || '',
          alias: res.data.alias || '',
          landline: res.data.landline || '',
          mobile: res.data.mobile || '',
          address: res.data.address || ''
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.patch('/company', formData);
      setMessage({ type: 'success', text: 'Company details updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update details' });
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Company Details</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organization Profile</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Details'}</span>
        </button>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Identity */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <Building size={14} className="text-blue-500" />
            <span>Core Identity</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
              <input
                type="text"
                required
                className="w-full text-sm font-bold"
                placeholder="e.g. Velocity Software Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alias / Brand Name</label>
              <input
                type="text"
                className="w-full text-sm"
                placeholder="e.g. Velocity"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <Mail size={14} className="text-blue-500" />
            <span>Contact & Web</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Contact (Email/Phone)</label>
              <input
                type="text"
                className="w-full text-sm"
                placeholder="hr@company.com"
                value={formData.primaryContact}
                onChange={(e) => setFormData({ ...formData, primaryContact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Corporate Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="url"
                  className="w-full pl-10 text-sm"
                  placeholder="https://www.velocity.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landline</label>
                <input
                  type="text"
                  className="w-full text-sm"
                  value={formData.landline}
                  onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                <input
                  type="text"
                  className="w-full text-sm"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Address & Profile */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <MapPin size={14} className="text-blue-500" />
            <span>Location & Description</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Physical Address</label>
              <textarea
                rows={3}
                className="w-full text-sm"
                placeholder="Enter full office address..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Description</label>
              <textarea
                rows={4}
                className="w-full text-sm"
                placeholder="Write a brief about your company..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

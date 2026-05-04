'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  MapPin, 
  Type,
  CheckCircle2,
  Shield,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PersonalSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    alias: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    dob: '',
    address: '',
    signature: '',
    role: ''
  });

  useEffect(() => {
    api.get('/users/profile')
      .then(res => {
        const data = res.data;
        // Format date for input field if exists
        if (data.dob) data.dob = new Date(data.dob).toISOString().split('T')[0];
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          alias: data.alias || '',
          email: data.email || '',
          phone: data.phone || '',
          mobile: data.mobile || '',
          website: data.website || '',
          dob: data.dob || '',
          address: data.address || '',
          signature: data.signature || '',
          role: data.role || ''
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
      const payload = { ...formData };
      if (payload.dob) {
        payload.dob = new Date(payload.dob).toISOString();
      } else {
        payload.dob = null as any;
      }
      
      await api.patch('/users/profile', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Personal Settings</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Profile</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
        >
          {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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
        {/* Name Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <User size={14} className="text-blue-500" />
            <span>Identity Details</span>
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text"
                  className="w-full text-sm"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text"
                  className="w-full text-sm"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alias / Display Name</label>
              <input
                type="text"
                className="w-full text-sm font-bold text-blue-600"
                placeholder="e.g. J.Doe"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                <span>Access Role</span>
                <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">System Managed</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="text"
                  readOnly
                  className="w-full pl-10 bg-gray-50 border-slate-200 text-gray-500 text-xs font-black uppercase"
                  value={formData.role}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <Mail size={14} className="text-blue-500" />
            <span>Contact Information</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                required
                className="w-full text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                <input
                  type="text"
                  className="w-full text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personal Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input
                  type="url"
                  className="w-full pl-10 text-sm"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <Calendar size={14} className="text-blue-500" />
            <span>Additional Details</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
              <input
                type="date"
                className="w-full text-sm"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-300" size={16} />
                <textarea
                  className="w-full pl-10 text-sm h-24 pt-2"
                  placeholder="Enter full office address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
            <Type size={14} className="text-blue-500" />
            <span>Professional Branding</span>
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Signature</label>
              <textarea
                className="w-full text-sm h-40 pt-4 font-mono bg-gray-50 border-gray-200"
                placeholder="Best Regards,\nJohn Doe"
                value={formData.signature}
                onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 italic">This signature will be appended to all outgoing candidate emails.</p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Plus, 
  X, 
  Search, 
  ChevronRight, 
  Zap, 
  Users, 
  QrCode, 
  Copy, 
  ExternalLink,
  CheckCircle2,
  Trash2,
  Calendar,
  Building
} from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  source: string;
  profile: string;
  description: string;
  createdAt: string;
  _count: { registrations: number };
}

export default function WalkinsAdminPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    source: 'LinkedIn',
    profile: '',
    description: '',
    notes: ''
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const fetchCampaigns = () => {
    setLoading(true);
    api.get('/walkins/campaigns')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/walkins/campaign', formData);
      setIsModalOpen(false);
      setFormData({ title: '', source: 'LinkedIn', profile: '', description: '', notes: '' });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Campaign',
      description: 'Are you sure you want to delete this campaign? All registrations and data will be permanently removed.',
      onConfirm: async () => {
        try {
          await api.delete(`/walkins/campaign/${id}`);
          toast.success('Campaign deleted successfully');
          fetchCampaigns();
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete campaign');
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Walk-in Management</h1>
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <input type="text" placeholder="Search campaigns..." className="w-full pl-9 pr-4 py-2 rounded-xl border-slate-200 bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-slate-200 text-[10px] font-black text-gray-400 uppercase">
            <tr>
              <th className="px-8 py-4">Campaign Event</th>
              <th className="px-8 py-4">Source / Profile</th>
              <th className="px-8 py-4 text-center">Registrations</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold animate-pulse">Loading events...</td></tr>
            ) : campaigns.map((c) => (
              <tr 
                key={c.id} 
                onClick={() => router.push(`/walkins/${c.id}`)}
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-8 py-4">
                   <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><Zap size={16}/></div>
                      <div>
                         <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{c.title}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Created {new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-4">
                   <p className="text-xs font-black text-gray-700">{c.profile}</p>
                   <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">{c.source}</p>
                </td>
                <td className="px-8 py-4 text-center">
                   <div className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg border border-slate-200">
                      <Users size={12} className="text-gray-400" />
                      <span className="text-xs font-black text-gray-900">{c._count.registrations}</span>
                   </div>
                </td>
                <td className="px-8 py-4 text-right">
                   <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/walkin/poster/${c.id}`, '_blank');
                        }} 
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all"
                        title="Open QR Poster"
                      >
                         <QrCode size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCampaign(c.id);
                        }} 
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-xl hover:bg-red-50 transition-all"
                        title="Delete Campaign"
                      >
                         <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-300 hover:text-gray-600">
                         <ChevronRight size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">New Walk-in Event</h2>
                    <p className="text-gray-400 text-sm font-medium">Create a campaign to generate a registration QR code.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                    <X size={20} />
                  </button>
               </div>
               <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Event Title *</label>
                     <input required type="text" className="w-full" placeholder="e.g. Mega Walk-in Drive - May 2026" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source</label>
                       <select className="w-full text-xs font-bold" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})}>
                          <option>LinkedIn</option>
                          <option>Direct Walk-in</option>
                          <option>Campus Drive</option>
                          <option>Referral</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Profile</label>
                       <input required type="text" className="w-full" placeholder="e.g. Node.js Developer" value={formData.profile} onChange={(e) => setFormData({...formData, profile: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                     <textarea rows={3} className="w-full" placeholder="Internal event details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <button disabled={submitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
                     {submitting ? 'Creating...' : 'Launch Campaign'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
      />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Briefcase, 
  ChevronRight, 
  Plus, 
  X, 
  Clock, 
  MapPin, 
  Video, 
  MoreHorizontal,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface Interview {
  id: number;
  applicationId: number;
  round: string;
  date: string;
  endTime: string;
  feedback: string;
  status: string;
  interviewerId: number | null;
  ownerId: number | null;
  location: string | null;
  notes: string | null;
  reminder: string | null;
  application: {
    id: number;
    status: string;
    candidate: { id: number; name: string; email: string };
    job: { title: string };
  };
}

interface Application {
  id: number;
  candidate: { id: number; name: string };
  job: { title: string };
  status: string;
}

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

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

  const [formData, setFormData] = useState({
    applicationId: '',
    round: 'TECH',
    date: '',
    feedback: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    endTime: '',
    interviewerId: '',
    ownerId: '',
    location: '',
    notes: '',
    reminder: '15_MIN'
  });

  const fetchData = async () => {
    try {
      const [intRes, appRes, usersRes] = await Promise.all([
        api.get('/interviews'),
        api.get('/applications'),
        api.get('/users')
      ]);
      setInterviews(intRes.data);
      setApplications(appRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Interview',
      description: 'Are you sure you want to delete this scheduled interview? This will also notify the candidate if an email was sent.',
      onConfirm: async () => {
        try {
          await api.delete(`/interviews/${id}`);
          fetchData();
        } catch (err) {
          console.error(err);
          alert('Failed to delete interview.');
        }
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/interviews', {
        ...formData,
        applicationId: parseInt(formData.applicationId)
      });
      setIsModalOpen(false);
      setFormData({ applicationId: '', round: 'TECH', date: '', feedback: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    setSubmitting(true);
    try {
      await api.patch(`/interviews/${selectedInterview.id}`, {
        date: rescheduleData.date,
        endTime: rescheduleData.endTime,
        interviewerId: parseInt(rescheduleData.interviewerId),
        ownerId: parseInt(rescheduleData.ownerId),
        location: rescheduleData.location,
        notes: rescheduleData.notes,
        reminder: rescheduleData.reminder
      });
      setIsRescheduleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to reschedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Interviews</h1>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total:</span>
              <span className="text-sm font-black text-gray-900">{interviews.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today:</span>
              <span className="text-sm font-black text-blue-600">{interviews.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).length}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={16} />
          <span>Schedule</span>
        </button>
      </div>

      {/* Interviews List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search interviews..." className="pl-10 pr-4 py-2 rounded-xl border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm" />
             </div>
             <button className="p-2 bg-white rounded-xl border border-slate-200 text-gray-400 hover:text-gray-600 shadow-sm">
                <Filter size={18} />
             </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {interviews.length === 0 ? (
            <div className="py-20 text-center">
               <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No interviews found</p>
            </div>
          ) : (
            interviews.map((interview) => (
              <div key={interview.id} className="px-8 py-3 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 w-24 border-r border-slate-200">
                      <span className="text-[10px] font-black uppercase text-blue-600">{new Date(interview.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-sm font-black text-gray-900">{new Date(interview.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/candidates/${interview.application.candidate.id}`);
                        }}
                        className="text-sm font-black text-gray-900 hover:text-blue-600 transition-colors inline-block mr-4 cursor-pointer"
                      >
                        {interview.application.candidate.name}
                      </h3>
                      <div className="inline-flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                        <Briefcase size={12} className="text-gray-300" />
                        <span>{interview.application.job.title}</span>
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setSelectedInterview(interview);
                      setRescheduleData({
                        date: new Date(interview.date).toISOString().slice(0, 16),
                        endTime: interview.endTime ? new Date(interview.endTime).toISOString().slice(0, 16) : '',
                        interviewerId: interview.interviewerId?.toString() || '',
                        ownerId: interview.ownerId?.toString() || '',
                        location: interview.location || '',
                        notes: interview.notes || '',
                        reminder: interview.reminder || '15_MIN'
                      });
                      setIsRescheduleModalOpen(true);
                    }}
                    className="flex items-center space-x-4 cursor-pointer flex-1 justify-end"
                  >
                    <div className="text-right flex items-center space-x-2">
                       <p className="text-xs font-black text-gray-900">{new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                         interview.round === 'TECH' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                         interview.round === 'HR' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                         'bg-purple-50 text-purple-600 border-purple-100'
                       }`}>
                         {interview.round}
                       </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedInterview(interview);
                          setRescheduleData({
                            date: new Date(interview.date).toISOString().slice(0, 16),
                            endTime: interview.endTime ? new Date(interview.endTime).toISOString().slice(0, 16) : '',
                            interviewerId: interview.interviewerId?.toString() || '',
                            ownerId: interview.ownerId?.toString() || '',
                            location: interview.location || '',
                            notes: interview.notes || '',
                            reminder: interview.reminder || '15_MIN'
                          });
                          setIsRescheduleModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-orange-600 p-2 transition-colors"
                        title="Reschedule Interview"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(interview.id)}
                        className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                        title="Delete Interview"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <button className="text-gray-300 hover:text-blue-600 p-1">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
      />

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Schedule Assessment</h2>
                  <p className="text-gray-400 text-sm font-medium">Set up a new interview round for a candidate.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Candidate</label>
                  <select
                    required
                    className="w-full"
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                  >
                    <option value="">-- Choose from active pipeline --</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.candidate.name} - {app.job.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Round Type</label>
                    <select
                      className="w-full"
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    >
                      <option value="HR">HR Round</option>
                      <option value="TECH">Technical Round</option>
                      <option value="MANAGER">Managerial Round</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Internal Instructions</label>
                  <textarea
                    rows={3}
                    className="w-full"
                    placeholder="Provide context for the interviewer..."
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400 active:scale-95"
                  >
                    {submitting ? 'Creating Schedule...' : 'Confirm & Notify'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && selectedInterview && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Reschedule: {selectedInterview.round}</h2>
                  <p className="text-gray-400 text-sm font-medium">
                    Updating interview for{' '}
                    <span 
                      onClick={() => router.push(`/candidates/${selectedInterview.application.candidate.id}`)}
                      className="text-blue-600 font-black cursor-pointer hover:underline"
                    >
                      {selectedInterview.application.candidate.name}
                    </span>
                  </p>
                </div>
                <button onClick={() => setIsRescheduleModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full"
                      value={rescheduleData.endTime}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interviewer</label>
                    <select
                      required
                      className="w-full"
                      value={rescheduleData.interviewerId}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, interviewerId: e.target.value })}
                    >
                      <option value="">Select Interviewer...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interview Owner</label>
                    <select
                      required
                      className="w-full"
                      value={rescheduleData.ownerId}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, ownerId: e.target.value })}
                    >
                      <option value="">Select Owner...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Location / Meeting URL</label>
                  <input
                    type="text"
                    className="w-full"
                    placeholder="Zoom, G-Meet or Office Address"
                    value={rescheduleData.location}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    className="w-full"
                    placeholder="Preparation notes..."
                    value={rescheduleData.notes}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Reminder</label>
                  <select
                    className="w-full"
                    value={rescheduleData.reminder}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, reminder: e.target.value })}
                  >
                    <option value="5_MIN">5 Minutes before</option>
                    <option value="15_MIN">15 Minutes before</option>
                    <option value="30_MIN">30 Minutes before</option>
                    <option value="1_HOUR">1 Hour before</option>
                    <option value="1_DAY">1 Day before</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 disabled:bg-orange-300 active:scale-95 flex items-center justify-center space-x-2"
                  >
                    {submitting ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{submitting ? 'Updating...' : 'Update & Notify'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

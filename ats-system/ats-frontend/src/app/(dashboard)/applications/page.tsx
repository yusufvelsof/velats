'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Briefcase, 
  User, 
  Clock, 
  ChevronRight, 
  Plus, 
  X, 
  Search,
  CheckCircle2,
  Send,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: number;
  status: string;
  candidateId: number;
  jobId: number;
  createdAt: string;
  candidate: { name: string; email: string };
  job: { title: string };
}

interface Job {
  id: number;
  title: string;
}

interface Candidate {
  id: number;
  name: string;
}

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
  });

  const fetchData = async () => {
    try {
      const [jobsRes, candsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/candidates')
      ]);
      setJobs(jobsRes.data);
      setCandidates(candsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (statusFilter) query.append('status', statusFilter);
    if (jobFilter) query.append('jobId', jobFilter);

    api.get(`/applications?${query.toString()}`)
      .then(res => setApplications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, jobFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', {
        candidateId: parseInt(formData.candidateId),
        jobId: parseInt(formData.jobId)
      });
      setIsModalOpen(false);
      setFormData({ candidateId: '', jobId: '' });
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to create application.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'HIRED': return 'text-green-700 bg-green-50 border-green-100';
      case 'OFFER': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'INTERVIEW': return 'text-orange-700 bg-orange-50 border-orange-100';
      case 'SHORTLISTED': return 'text-purple-700 bg-purple-50 border-purple-100';
      default: return 'text-blue-700 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Applications</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Filter size={14} className="text-gray-400 mr-2" />
              <select 
                className="text-xs outline-none bg-transparent text-gray-900 font-bold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1.5 border border-slate-200 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Briefcase size={14} className="text-gray-400 mr-2" />
              <select 
                className="text-xs outline-none bg-transparent text-gray-900 font-bold max-w-[140px]"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="">All Jobs</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={16} />
          <span>Apply</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Candidate</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Job Position</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Applied</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold animate-pulse">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-bold">No applications found</td></tr>
            ) : applications.map((app) => (
              <motion.tr variants={item} key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">{app.candidate.name.charAt(0)}</div>
                    <div>
                      <div className="font-black text-gray-900 group-hover:text-blue-600 text-sm">{app.candidate.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 leading-none">{app.candidate.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                    <Briefcase size={12} className="text-gray-300" />
                    <span>{app.job.title}</span>
                  </div>
                </td>
                <td className="px-8 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-8 py-3 text-xs font-black text-gray-400 uppercase">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-8 py-3 text-right">
                  <Link href={`/candidates/${app.candidateId}`} className="inline-flex p-1.5 text-gray-300 hover:text-blue-600 transition-colors">
                    <ChevronRight size={14} />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* New Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">New Application</h2>
                  <p className="text-gray-400 text-sm font-medium">Link a candidate to an active job opening.</p>
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
                    value={formData.candidateId}
                    onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidates.map((cand) => (
                      <option key={cand.id} value={cand.id}>{cand.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Job</label>
                  <select
                    required
                    className="w-full"
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  >
                    <option value="">-- Choose Job Opening --</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400 active:scale-95"
                  >
                    {submitting ? 'Linking...' : 'Create Application'}
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

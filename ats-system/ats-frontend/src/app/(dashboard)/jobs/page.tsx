'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Calendar, 
  Briefcase, 
  Plus, 
  X, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Search,
  Users,
  ChevronRight,
  ExternalLink,
  Edit2,
  Save,
  Trash2,
  Building2,
  User,
  MapPin,
  Banknote,
  GraduationCap,
  Layers,
  LayoutTemplate
} from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Job {
  id: number;
  title: string;
  position?: string;
  department?: string;
  hiringManager?: string;
  assignedRecruiter?: string;
  postedBy?: string;
  numPositions: number;
  status: string;
  jobType?: string;
  experience?: string;
  salaryRange?: string;
  requiredSkills?: string;
  location?: string;
  interviewMode?: string;
  description: string;
  requirements?: string;
  benefits?: string;
  createdAt: string;
  _count?: { applications: number };
}

interface UserMember {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface CompanySettings {
  departments: string[];
  technologies: string[];
  templatesConfig?: {
    job?: any[];
  }
}

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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserMember[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({ departments: [], technologies: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    position: '',
    department: '',
    hiringManager: '',
    assignedRecruiter: '',
    postedBy: '',
    numPositions: 1,
    status: 'IN_PROGRESS',
    jobType: 'Full Time',
    experience: '',
    salaryRange: '',
    requiredSkills: '',
    location: '',
    interviewMode: 'Virtual',
    description: '',
    requirements: '',
    benefits: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchJobs = () => {
    setLoading(true);
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchData = async () => {
    try {
      const [usersRes, settingsRes] = await Promise.all([
        api.get('/users'),
        api.get('/company')
      ]);
      setTeamMembers(usersRes.data);
      setCompanySettings(settingsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchData();
  }, []);

  const jobTemplates = useMemo(() => companySettings.templatesConfig?.job || [], [companySettings]);

  const hiringManagers = teamMembers.filter(u => u.role === 'HIRING_MANAGER' || u.role === 'ADMIN');
  const recruiters = teamMembers.filter(u => u.role === 'RECRUITER' || u.role === 'ADMIN');
  const allUsers = teamMembers;

  const applyTemplate = (templateId: string) => {
    const template = jobTemplates.find((t: any) => t.id === templateId);
    if (template) {
      const { id, name, ...templateData } = template;
      setFormData(prev => ({ ...prev, ...templateData }));
    }
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData(job);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job',
      description: 'Are you sure you want to delete this job? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/jobs/${id}`);
          fetchJobs();
          if (editingJob?.id === id) setIsModalOpen(false);
        } catch (err) {
          console.error(err);
          alert('Failed to delete job');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const allowedFields = [
        'title', 'position', 'department', 'hiringManager', 'assignedRecruiter',
        'postedBy', 'numPositions', 'status', 'jobType', 'experience',
        'salaryRange', 'requiredSkills', 'location', 'interviewMode',
        'description', 'requirements', 'benefits'
      ];
      
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([key]) => allowedFields.includes(key))
      );

      if (editingJob) {
        await api.patch(`/jobs/${editingJob.id}`, cleanData);
      } else {
        await api.post('/jobs', cleanData);
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      console.error(err);
      alert('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Jobs</h1>
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <input 
               type="text" 
               placeholder="Search roles..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 rounded-xl border-slate-200 bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" 
             />
          </div>
          <button 
            onClick={() => window.open('/careers', '_blank')}
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-all shadow-sm"
          >
            <ExternalLink size={12} />
            <span>Public Career Page</span>
          </button>
        </div>
        <button 
          onClick={() => { setEditingJob(null); setFormData({ title: '', status: 'OPEN', numPositions: 1 }); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={16} />
          <span>Post Job</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-slate-200">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-8 py-4">Role & Department</th>
              <th className="px-8 py-4 text-center">Status</th>
              <th className="px-8 py-4 text-center">Openings</th>
              <th className="px-8 py-4 text-center">Applicants</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold animate-pulse">Analyzing workforce requirements...</td></tr>
            ) : filteredJobs.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-24 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No active job campaigns</td></tr>
            ) : filteredJobs.map((job) => (
              <motion.tr variants={item} key={job.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                <td className="px-8 py-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${job.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Briefcase size={20} />
                    </div>
                    <div className="flex flex-col">
                      <Link href={`/candidates?jobId=${job.id}`} className="block group/link">
                        <div className="font-black text-gray-900 group-hover/link:text-blue-600 text-sm leading-none mb-1.5 transition-colors">{job.title}</div>
                      </Link>
                      <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-black text-gray-400 uppercase">{job.department || 'General'}</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full" />
                         <span className="text-[10px] font-bold text-gray-300">ID: #{job.id}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                    job.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' : 
                    job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {job.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-8 py-4 text-center font-black text-gray-900 text-sm">{job.numPositions}</td>
                <td className="px-8 py-4 text-center">
                   <Link href={`/candidates?jobId=${job.id}`} className="flex items-center justify-center space-x-1.5 hover:text-blue-600 transition-colors">
                      <Users size={14} className="text-blue-600/50" />
                      <span className="text-sm font-black text-gray-600">{job._count?.applications || 0}</span>
                   </Link>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditModal(job); }} 
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {/* Expanded Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div className="flex items-center space-x-4">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><Briefcase size={24}/></div>
                   <div className="space-y-0.5">
                     <h2 className="text-xl font-bold tracking-tight text-gray-900">{editingJob ? 'Edit Job Role' : 'Create New Job Listing'}</h2>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Job Configuration & Intelligence</p>
                   </div>
                </div>
                <div className="flex items-center space-x-3">
                   <div className="relative group">
                      <select 
                        className="appearance-none bg-white px-10 py-3 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-widest outline-none focus:border-blue-600 shadow-sm cursor-pointer"
                        onChange={(e) => applyTemplate(e.target.value)}
                        defaultValue=""
                      >
                         <option value="" disabled>Select Template...</option>
                         {jobTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <LayoutTemplate className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm border border-slate-200 transition-all">
                     <X size={20} />
                   </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar flex-1 bg-white">
                {/* Section 1: Basic Classification */}
                <div className="space-y-6">
                   <div className="flex items-center space-x-2 text-blue-600">
                      <Building2 size={16} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">Core Identity</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Title</label>
                        <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full font-bold" placeholder="e.g. Lead Technical Architect" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                        <select value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full font-bold">
                           <option value="">Select...</option>
                           {companySettings.departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Position</label>
                        <select value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full font-bold">
                           <option value="">Select...</option>
                           {companySettings.technologies.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                   </div>
                </div>

                {/* Section 2: Workforce Details */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                   <div className="flex items-center space-x-2 text-orange-600">
                      <User size={16} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">Ownership & Capacity</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hiring Manager</label>
                        <select value={formData.hiringManager || ''} onChange={e => setFormData({...formData, hiringManager: e.target.value})} className="w-full font-bold">
                           <option value="">Select...</option>
                           {hiringManagers.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Recruiter</label>
                        <select value={formData.assignedRecruiter || ''} onChange={e => setFormData({...formData, assignedRecruiter: e.target.value})} className="w-full font-bold">
                           <option value="">Select...</option>
                           { recruiters.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>) }
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Posted By</label>
                        <select value={formData.postedBy || ''} onChange={e => setFormData({...formData, postedBy: e.target.value})} className="w-full font-bold">
                           <option value="">Select...</option>
                           { allUsers.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>) }
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Positions Count</label>
                        <input type="number" min="1" value={formData.numPositions || 1} onChange={e => setFormData({...formData, numPositions: parseInt(e.target.value) || 1})} className="w-full font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Status</label>
                        <select value={formData.status || 'IN_PROGRESS'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full font-bold">
                           <option value="IN_PROGRESS">In-Progress</option>
                           <option value="WAITING_FOR_APPROVAL">Waiting Approval</option>
                           <option value="OPEN">Open (Active)</option>
                           <option value="ON_HOLD">On-Hold</option>
                           <option value="FILLED">Filled</option>
                           <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                   </div>
                </div>

                {/* Section 3: Professional Requirements */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                   <div className="flex items-center space-x-2 text-purple-600">
                      <GraduationCap size={16} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">Requirement Profile</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Type</label>
                        <select value={formData.jobType || 'Full Time'} onChange={e => setFormData({...formData, jobType: e.target.value})} className="w-full font-bold">
                           <option value="Full Time">Full Time</option>
                           <option value="Part Time">Part Time</option>
                           <option value="Contract">Contract</option>
                           <option value="Internship">Internship</option>
                           <option value="Permanent">Permanent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Needed</label>
                        <input type="text" value={formData.experience || ''} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full font-bold" placeholder="e.g. 3-5 Years" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Salary Range</label>
                        <input type="text" value={formData.salaryRange || ''} onChange={e => setFormData({...formData, salaryRange: e.target.value})} className="w-full font-bold" placeholder="e.g. 15L - 25L" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                        <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full font-bold" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interview Mode</label>
                        <select value={formData.interviewMode || 'Virtual'} onChange={e => setFormData({...formData, interviewMode: e.target.value})} className="w-full font-bold">
                           <option value="Virtual">Virtual</option>
                           <option value="F2F">Face to Face</option>
                           <option value="Telephonic">Telephonic</option>
                           <option value="Any">Any</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Required Skills</label>
                         <input type="text" value={formData.requiredSkills || ''} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} className="w-full font-bold" placeholder="Keywords: React, Node.js, System Design..." />
                      </div>
                   </div>
                </div>

                {/* Section 4: Deep Content */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                   <div className="flex items-center space-x-2 text-indigo-600">
                      <Layers size={16} />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em]">Detailed Content</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                        <div className="quill-compact">
                           <ReactQuill 
                             theme="snow" 
                             value={formData.description || ''} 
                             onChange={val => {
                               if (val !== formData.description) {
                                 setFormData(prev => ({...prev, description: val}));
                               }
                             }}
                           />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requirements</label>
                          <div className="quill-compact">
                             <ReactQuill 
                               theme="snow" 
                               value={formData.requirements || ''} 
                               onChange={val => {
                                 if (val !== formData.requirements) {
                                   setFormData(prev => ({...prev, requirements: val}));
                                 }
                               }}
                             />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Benefits</label>
                          <div className="quill-compact">
                             <ReactQuill 
                               theme="snow" 
                               value={formData.benefits || ''} 
                               onChange={val => {
                                 if (val !== formData.benefits) {
                                   setFormData(prev => ({...prev, benefits: val}));
                                 }
                               }}
                             />
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="pt-8 shrink-0 flex items-center space-x-4">
                  {editingJob && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingJob.id)}
                      className="bg-red-50 text-red-600 px-8 py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 border border-red-100"
                    >
                      <Trash2 size={20} />
                      <span>Delete</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white p-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400 active:scale-[0.98] flex items-center justify-center space-x-3"
                  >
                    <Save size={20} />
                    <span>{submitting ? 'Processing Engine...' : editingJob ? 'Update Workforce Data' : 'Initialize Job Campaign'}</span>
                  </button>
                </div>
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

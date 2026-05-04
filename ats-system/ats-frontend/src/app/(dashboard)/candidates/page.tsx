'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Search, 
  Mail, 
  Phone, 
  FileText, 
  UserPlus, 
  X, 
  ChevronRight,
  User,
  UploadCloud,
  CheckCircle2,
  Filter,
  Briefcase,
  Cpu,
  Calendar,
  Clock,
  Printer as PrinterIcon,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Plus,
  RefreshCw,
  Target,
  Users,
  Download,
  Trash2
} from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  createdAt: string;
  currentState?: string;
  currentCity?: string;
  hometownState?: string;
  hometownCity?: string;
  applications: Array<{
    id: number;
    status: string;
    job: { title: string };
  }>;
}

interface Job {
  id: number;
  title: string;
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

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'];

function CandidatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId');

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  // Update job filter if jobId is in URL
  useEffect(() => {
    if (initialJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === parseInt(initialJobId));
      if (job) setJobFilter(job.title);
    }
  }, [initialJobId, jobs]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // User session state
  const [user, setUser] = useState<any>(null);

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

  // Quick Parse States
  const [isQuickParseOpen, setIsQuickParseOpen] = useState(false);
  const [parseStep, setParseStep] = useState<'upload' | 'parsing' | 'review'>('upload');
  const [parsedData, setParsedData] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [parseFile, setParseFile] = useState<File | null>(null);
  const [quickParseFormData, setQuickParseFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobId: '',
    source: 'Quick Parse'
  });
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [parseError, setParseError] = useState('');

  // New Action & Bulk States
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isLinkJobModalOpen, setIsLinkJobModalOpen] = useState(false);
  const [isSlotBookingModalOpen, setIsSlotBookingModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);

  const [lastAutoEndTime, setLastAutoEndTime] = useState<string>('');
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    round: '',
    date: '',
    endTime: '',
    interviewerId: '',
    ownerId: '',
    location: '',
    notes: '',
    reminder: '15_MIN'
  });

  const handleFromDateChange = (value: string) => {
    const fromDate = new Date(value);
    const newScheduleForm = { ...scheduleForm, date: value };

    if (!scheduleForm.endTime || scheduleForm.endTime === lastAutoEndTime) {
      if (!isNaN(fromDate.getTime())) {
        const toDate = new Date(fromDate);
        toDate.setHours(toDate.getHours() + 1);
        const year = toDate.getFullYear();
        const month = String(toDate.getMonth() + 1).padStart(2, '0');
        const day = String(toDate.getDate()).padStart(2, '0');
        const hours = String(toDate.getHours()).padStart(2, '0');
        const minutes = String(toDate.getMinutes()).padStart(2, '0');
        const formattedEndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        newScheduleForm.endTime = formattedEndTime;
        setLastAutoEndTime(formattedEndTime);
      }
    }
    setScheduleForm(newScheduleForm);
  };

  const resetQuickParse = () => {
    setParseStep('upload');
    setParsedData(null);
    setConfidence(0);
    setParseFile(null);
    setQuickParseFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobId: '',
      source: 'Quick Parse'
    });
    setParseError('');
  };

  const handleQuickParse = async (file: File) => {
    setParseFile(file);
    setParseStep('parsing');
    setParseError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/candidates/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setParsedData(res.data.data);
        setConfidence(res.data.confidence);
        setQuickParseFormData({
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          email: res.data.data.email,
          phone: res.data.data.phone,
          jobId: '',
          source: 'Quick Parse'
        });
        setParseStep('review');
      } else {
        setParseError('Failed to parse resume. Please try again or enter manually.');
        setParseStep('upload');
      }
    } catch (err) {
      setParseError('Error connecting to parsing engine.');
      setParseStep('upload');
    }
  };

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuickSaving(true);
    setParseError('');

    try {
      // 1. Create Candidate
      const res = await api.post('/candidates', {
        ...quickParseFormData,
        resumeUrl: parsedData?.resumeUrl
      });
      
      const candidateId = res.data.id;

      // 2. Link to Job if selected
      if (quickParseFormData.jobId) {
        await api.post('/applications', {
          candidateId,
          jobId: parseInt(quickParseFormData.jobId),
          status: 'APPLIED'
        });
      }

      setIsQuickParseOpen(false);
      toast.success('Candidate parsed and saved');
      fetchCandidates();
      resetQuickParse();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save candidate.';
      setParseError(msg);
      toast.error(msg);
    } finally {
      setIsQuickSaving(false);
    }
  };

  const fetchData = async () => {
    try {
      const [jobsRes, drivesRes, usersRes, companyRes, userRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/slots/drives'),
        api.get('/users'),
        api.get('/company'),
        api.get('/users/me')
      ]);
      setJobs(jobsRes.data);
      setDrives(drivesRes.data);
      setUsers(usersRes.data);
      setCompany(companyRes.data);
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = () => {
    setLoading(true);
    api.get(`/candidates?search=${encodeURIComponent(search)}`)
      .then(res => setCandidates(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleLinkJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickParseFormData.jobId) return;
    const jobId = parseInt(quickParseFormData.jobId);
    setSubmitting(true);
    try {
      const idsToProcess = activeCandidate ? [activeCandidate.id] : selectedIds;
      await Promise.all(idsToProcess.map(id => 
        api.post('/applications', { candidateId: id, jobId, status: 'APPLIED' })
      ));
      setIsLinkJobModalOpen(false);
      setSelectedIds([]);
      setActiveCandidate(null);
      toast.success('Candidate(s) linked to job');
      fetchCandidates();
    } catch (err) {
      toast.error('Failed to link candidate(s)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendSlotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriveId) return;
    setSubmitting(true);
    try {
      const idsToProcess = activeCandidate ? [activeCandidate.id] : selectedIds;
      await Promise.all(idsToProcess.map(id => 
        api.post('/slots/send-booking-email', { candidateId: id, driveId: parseInt(selectedDriveId) })
      ));
      setIsSlotBookingModalOpen(false);
      setSelectedIds([]);
      setActiveCandidate(null);
      toast.success('Slot booking email(s) sent successfully!');
    } catch (err) {
      toast.error('Failed to send slot booking email(s)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const idsToProcess = activeCandidate ? [activeCandidate.id] : selectedIds;
      await Promise.all(idsToProcess.map(async id => {
        const cand = candidates.find(c => c.id === id);
        const appId = cand?.applications[0]?.id;
        if (appId) {
          return api.post('/interviews', {
            ...scheduleForm,
            applicationId: appId,
            interviewerId: parseInt(scheduleForm.interviewerId),
            ownerId: parseInt(scheduleForm.ownerId)
          });
        }
      }));
      setIsScheduleModalOpen(false);
      setSelectedIds([]);
      setActiveCandidate(null);
      toast.success('Interviews scheduled successfully!');
      fetchCandidates();
    } catch (err) {
      toast.error('Failed to schedule interview(s)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Candidate',
      description: 'Are you sure you want to delete this candidate? This will remove all their applications and history. This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/candidates/${id}`);
          toast.success('Candidate deleted');
          fetchCandidates();
        } catch (err) {
          toast.error('Failed to delete candidate');
        }
      }
    });
  };

  const exportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    const exportData = filteredCandidates.map(c => ({
      'Name': c.name,
      'Email': c.email,
      'Phone': c.phone,
      'Current State': c.currentState || '-',
      'Current City': c.currentCity || '-',
      'Hometown State': c.hometownState || '-',
      'Hometown City': c.hometownCity || '-',
      'Latest Application': c.applications[0]?.job?.title || 'None',
      'Status': c.applications[0]?.status || 'None',
      'Joined Date': new Date(c.createdAt).toLocaleDateString()
    }));
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Candidates");
    writeFile(wb, `Candidates_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) setSelectedIds([]);
    else setSelectedIds(filteredCandidates.map(c => c.id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCandidates();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (resumeFile) formData.append('resume', resumeFile);

    try {
      await api.post('/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Candidate added successfully!');
      setName(''); setEmail(''); setPhone(''); setResumeFile(null);
      setTimeout(() => {
        setIsModalOpen(false);
        fetchCandidates();
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCandidates = (Array.isArray(candidates) ? candidates : []).filter(c => {
    // If job filter is active, candidate must have at least one application matching that job title
    if (jobFilter) {
      const hasMatchingJob = c.applications.some(app => app.job.title === jobFilter);
      if (!hasMatchingJob) return false;
    }

    // Apply status filter. If jobFilter is also active, check status of the matching job application.
    // Otherwise, check status of the latest application.
    if (statusFilter) {
      if (jobFilter) {
        const matchingApp = c.applications.find(app => app.job.title === jobFilter);
        if (matchingApp?.status !== statusFilter) return false;
      } else {
        const latestApp = c.applications[0];
        if (latestApp?.status !== statusFilter) return false;
      }
    }

    return true;
  });

  const getCandidateDisplayApp = (c: Candidate) => {
    if (jobFilter) {
      return c.applications.find(app => app.job.title === jobFilter) || c.applications[0];
    }
    return c.applications[0];
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Candidates</h1>

          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <input
               type="text"
               placeholder="Search candidates..."
               className="w-full pl-9 pr-4 py-2 rounded-xl border-slate-200 bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 pl-4">
            <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1">
              <Filter size={12} className="text-gray-400 mr-2" />
              <select 
                className="text-[10px] outline-none bg-transparent text-gray-900 font-bold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1">
              <Briefcase size={12} className="text-gray-400 mr-2" />
              <select 
                className="text-[10px] outline-none bg-transparent text-gray-900 font-bold max-w-[120px]"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="">All Jobs</option>
                {Array.isArray(jobs) && jobs.map(j => (
                  <option key={j.id} value={j.title}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
          >
            <Download size={16}/>
            <span>Export Excel</span>
          </button>
          <button 
            onClick={() => {
              resetQuickParse();
              setIsQuickParseOpen(true);
            }}
            className="p-2.5 bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm active:scale-95 group"
            title="Quick Resume Parse"
          >
            <UploadCloud size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => router.push('/candidates/new')}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={16} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-blue-600 p-4 flex items-center justify-between text-white"
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-black uppercase tracking-widest">{selectedIds.length} Selected</span>
              <div className="h-4 w-px bg-blue-400" />
              <button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center space-x-2 text-xs font-bold hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all">
                <Calendar size={14} /> <span>Schedule Bulk</span>
              </button>
              <button onClick={() => setIsSlotBookingModalOpen(true)} className="flex items-center space-x-2 text-xs font-bold hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all">
                <Mail size={14} /> <span>Send Slot Link</span>
              </button>
              <button onClick={() => setIsLinkJobModalOpen(true)} className="flex items-center space-x-2 text-xs font-bold hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all">
                <LinkIcon size={14} /> <span>Associate Job</span>
              </button>
            </div>
            <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-blue-700 rounded-full transition-all">
              <X size={18} />
            </button>
          </motion.div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Active Application</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <motion.tbody variants={container} initial="hidden" animate="show" className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-8 text-center text-gray-400 font-bold animate-pulse">Searching candidates...</td></tr>
              ) : filteredCandidates.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No matches found</td></tr>
              ) : filteredCandidates.map((c) => {
                const displayApp = getCandidateDisplayApp(c);
                return (
                  <motion.tr variants={item} key={c.id} className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${selectedIds.includes(c.id) ? 'bg-blue-50/30' : ''}`} onClick={() => window.location.href = `/candidates/${c.id}`}>
                    <td className="px-4 py-3 text-center" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                      <button className={`${selectedIds.includes(c.id) ? 'text-blue-600' : 'text-gray-300'} hover:text-blue-500 transition-colors`}>
                        {selectedIds.includes(c.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </td>
                    <td className="px-8 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">{c.name.charAt(0)}</div>
                        <div>
                          <div className="font-black text-gray-900 group-hover:text-blue-600 text-sm leading-none mb-1">{c.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 leading-none">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-3">
                      {displayApp ? (
                        <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                          <Briefcase size={12} className="text-gray-300" />
                          <span>{displayApp.job.title}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-3 text-center">
                      {displayApp ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(displayApp.status)}`}>
                          {displayApp.status}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-300 uppercase">None</span>
                      )}
                    </td>
                    <td className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCandidate(c);
                              setIsScheduleModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                            title="Schedule Interview"
                          >
                           <Calendar size={14}/>
                         </button>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCandidate(c);
                              setIsSlotBookingModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" 
                            title="Send Slot Booking Email"
                          >
                           <Mail size={14}/>
                         </button>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/candidates/${c.id}/print-evaluation`, '_blank');
                            }}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" 
                            title="Print Evaluation Sheet"
                          >
                           <PrinterIcon size={14}/>
                         </button>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCandidate(c);
                              setIsLinkJobModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                            title="Associate with Job"
                          >
                           <LinkIcon size={14}/>
                         </button>
                         {user?.role === 'ADMIN' && (
                           <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCandidate(c.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                              title="Delete Candidate"
                            >
                             <Trash2 size={14}/>
                           </button>
                         )}
                         <ChevronRight size={14} className="text-gray-300" />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* New Candidate Modal */}
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
                  <h2 className="text-2xl font-black text-gray-900">Add New Candidate</h2>
                  <p className="text-gray-400 text-sm font-medium">Enter candidate details and upload their resume.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="text"
                      className="w-full"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Upload Resume</label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-gray-50 hover:border-blue-300 transition-colors group cursor-pointer text-center">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center space-y-2 pointer-events-none">
                      <div className={`p-3 rounded-full ${resumeFile ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500'} transition-colors`}>
                        {resumeFile ? <CheckCircle2 size={24} /> : <UploadCloud size={24} />}
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {resumeFile ? resumeFile.name : 'Click to upload'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400 active:scale-95"
                  >
                    {submitting ? 'Registering...' : 'Register Candidate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isQuickParseOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 shrink-0">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quick Intake Intelligence</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Velocity AI Resume Parser v2.0</p>
                  </div>
                  <button onClick={() => setIsQuickParseOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto">
                   {parseStep === 'upload' && (
                      <div className="space-y-6 text-center py-10">
                         <div className="relative border-4 border-dashed border-blue-50 rounded-[40px] p-16 hover:bg-blue-50/30 hover:border-blue-100 transition-all group cursor-pointer">
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleQuickParse(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center space-y-4">
                               <div className="p-6 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform"><UploadCloud size={40} /></div>
                               <div>
                                  <p className="text-lg font-black text-gray-900">Drop Resume Here</p>
                                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">PDF, DOCX supported</p>
                               </div>
                            </div>
                         </div>
                         {parseError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{parseError}</p>}
                      </div>
                   )}

                   {parseStep === 'parsing' && (
                      <div className="space-y-8 py-20 text-center flex flex-col items-center">
                         <div className="relative w-24 h-24">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-full" />
                            <div className="absolute inset-0 flex items-center justify-center text-blue-600"><Cpu size={32} /></div>
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900">Analyzing Architecture...</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Extracting Nodes & Attributes</p>
                         </div>
                      </div>
                   )}

                   {parseStep === 'review' && (
                      <form onSubmit={handleQuickSave} className="space-y-8">
                         <div className="bg-green-50/50 border border-green-100 p-6 rounded-[32px] flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                               <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><CheckCircle2 size={24}/></div>
                               <div>
                                  <p className="text-xs font-black text-green-700 uppercase tracking-widest">Parsing Complete</p>
                                  <p className="text-[10px] font-bold text-green-600 uppercase">Velocity AI Confidence: {confidence}%</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Source File</p>
                               <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{parseFile?.name}</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                               <input required type="text" className="w-full !bg-gray-50 border-slate-200 focus:!bg-white p-4 rounded-2xl text-sm font-bold" value={quickParseFormData.firstName} onChange={e => setQuickParseFormData({...quickParseFormData, firstName: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                               <input required type="text" className="w-full !bg-gray-50 border-slate-200 focus:!bg-white p-4 rounded-2xl text-sm font-bold" value={quickParseFormData.lastName} onChange={e => setQuickParseFormData({...quickParseFormData, lastName: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                               <input required type="email" className="w-full !bg-gray-50 border-slate-200 focus:!bg-white p-4 rounded-2xl text-sm font-bold" value={quickParseFormData.email} onChange={e => setQuickParseFormData({...quickParseFormData, email: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                               <input type="tel" className="w-full !bg-gray-50 border-slate-200 focus:!bg-white p-4 rounded-2xl text-sm font-bold" value={quickParseFormData.phone} onChange={e => setQuickParseFormData({...quickParseFormData, phone: e.target.value})} />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apply to Job</label>
                               <select className="w-full !bg-gray-50 border-slate-200 focus:!bg-white p-4 rounded-2xl text-sm font-bold" value={quickParseFormData.jobId} onChange={e => setQuickParseFormData({...quickParseFormData, jobId: e.target.value})}>
                                  <option value="">Choose Position...</option>
                                  {Array.isArray(jobs) && jobs.map(j => (
                                    <option key={j.id} value={j.id}>{j.title}</option>
                                  ))}
                               </select>
                            </div>
                         </div>

                         <div className="pt-4 flex items-center space-x-3">
                            <button type="button" onClick={() => setParseStep('upload')} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Re-Upload</button>
                            <button disabled={isQuickSaving} type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-blue-400">
                               {isQuickSaving ? 'Saving Intelligence...' : 'Verify & Add Candidate'}
                            </button>
                         </div>
                      </form>
                   )}
                </div>
             </motion.div>
          </div>
        )}

        {/* Link Job Modal */}
        {isLinkJobModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                   <div>
                      <h2 className="text-xl font-black text-gray-900">Associate with Job</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Select position for candidate(s)</p>
                   </div>
                   <button onClick={() => { setIsLinkJobModalOpen(false); setActiveCandidate(null); }} className="bg-white p-2 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200"><X size={18}/></button>
                </div>
                <form onSubmit={handleLinkJob} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Job Opening</label>
                      <select required className="w-full" value={quickParseFormData.jobId} onChange={e => setQuickParseFormData({...quickParseFormData, jobId: e.target.value})}>
                         <option value="">Select Position...</option>
                         {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                      </select>
                   </div>
                   <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400">
                      {submitting ? 'Linking...' : 'Confirm Association'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Schedule Interview</h2>
                  <p className="text-gray-400 text-sm font-medium">Schedule round for {activeCandidate ? activeCandidate.name : `${selectedIds.length} candidates`}</p>
                </div>
                <button onClick={() => { setIsScheduleModalOpen(false); setActiveCandidate(null); }} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90"><X size={20} /></button>
              </div>
              <form onSubmit={handleScheduleBatch} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interview Level</label>
                    <select required className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.round} onChange={e => setScheduleForm({...scheduleForm, round: e.target.value})}>
                        <option value="">Select Level...</option>
                        {(company?.interviewLevels || ['TECH_1', 'TECH_2', 'HR', 'MANAGERIAL']).map((l: string) => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Applied Position</label>
                    <div className="w-full p-4 bg-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500">
                        {activeCandidate ? (activeCandidate.applications[0]?.job?.title || 'Unassigned') : 'Selected Candidates'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">From Date & Time</label>
                    <input required type="datetime-local" className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.date} onChange={e => handleFromDateChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">To Date & Time</label>
                    <input required type="datetime-local" className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.endTime} onChange={e => { setScheduleForm({...scheduleForm, endTime: e.target.value}); setLastAutoEndTime(''); }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interviewer</label>
                    <select required className="w-full" value={scheduleForm.interviewerId} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewerId: e.target.value })}>
                      <option value="">Select Interviewer...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Interview Owner</label>
                    <select required className="w-full" value={scheduleForm.ownerId} onChange={(e) => setScheduleForm({ ...scheduleForm, ownerId: e.target.value })}>
                      <option value="">Select Owner...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Location / Meeting URL</label>
                  <input type="text" className="w-full font-bold text-sm bg-gray-50" placeholder="Zoom, G-Meet or Address" value={scheduleForm.location} onChange={e => setScheduleForm({...scheduleForm, location: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Reminder</label>
                        <select className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.reminder} onChange={e => setScheduleForm({...scheduleForm, reminder: e.target.value})}>
                            <option value="5_MIN">5 Minutes before</option>
                            <option value="15_MIN">15 Minutes before</option>
                            <option value="30_MIN">30 Minutes before</option>
                            <option value="1_HOUR">1 Hour before</option>
                            <option value="1_DAY">1 Day before</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes</label>
                    <textarea rows={2} className="w-full font-bold text-sm bg-gray-50" placeholder="Any preparation notes..." value={scheduleForm.notes} onChange={e => setScheduleForm({...scheduleForm, notes: e.target.value})} />
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-blue-400">
                  {submitting ? 'Scheduling...' : 'Confirm Schedule & Notify'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Slot Booking Modal */}
        {isSlotBookingModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                   <div>
                      <h2 className="text-xl font-black text-gray-900">Send Slot Booking Email</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Invite candidate(s) to pick a slot</p>
                   </div>
                   <button onClick={() => { setIsSlotBookingModalOpen(false); setActiveCandidate(null); }} className="bg-white p-2 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200"><X size={18}/></button>
                </div>
                <form onSubmit={handleSendSlotEmail} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Hiring Drive</label>
                      <select required className="w-full" value={selectedDriveId} onChange={e => setSelectedDriveId(e.target.value)}>
                         <option value="">Choose Drive...</option>
                         {drives.map(d => <option key={d.id} value={d.id}>{d.title} ({d.job.title})</option>)}
                      </select>
                   </div>
                   <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 leading-relaxed uppercase tracking-wider">
                         Candidate will receive an email with a unique link to book their preferred interview slot from the selected drive.
                      </p>
                   </div>
                   <button type="submit" disabled={submitting} className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 disabled:bg-orange-300">
                      {submitting ? 'Sending...' : 'Send Invitation(s)'}
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

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Initializing Candidates Intelligence...</div>}>
      <CandidatesContent />
    </Suspense>
  );
}

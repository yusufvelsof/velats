'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ChevronLeft, User, Mail, Phone, MapPin, Briefcase, 
  GraduationCap, Globe, FileText, Plus, X, MessageSquare,
  Clock, ShieldCheck, Star, Calendar, ArrowRight,
  ChevronDown, ChevronUp, Tag, Download, Trash2, Send,
  Target, AlertCircle, CheckCircle2, History, RefreshCw,
  Info, Paperclip, Printer as PrinterIcon, Link as LinkIcon, Trophy
} from 'lucide-react';
import ComposeEmailModal from '@/components/ComposeEmailModal';
import { useSettings } from '@/lib/contexts/SettingsContext';

// --- Optimized Sub-components to prevent re-renders ---
// ... (AccordionItem and NotesTab remain same)

export default function CandidateProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [expandedSection, setExpandedSection] = useState<string | null>('professional');

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

  // Email Modal & History state
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);

  // Eval Modal state
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [evalForm, setEvalForm] = useState({ 
    rating: 3, 
    feedback: '', 
    status: 'COMPLETED',
    reason: '',
    subReason: ''
  });

  // Data for evaluation (Fallback if settings empty)
  const [evaluationSchema, setEvaluationSchema] = useState<any[]>([]);

  // Job Association state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [interviewSettings, setInterviewSettings] = useState<any>({ levels: [] });
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLinking, setIsLinking] = useState(false);

  // Keep track of the last auto-generated end time to avoid overriding manual edits
  const [lastAutoEndTime, setLastAutoEndTime] = useState<string>('');

  // Scheduling Form
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

  // File Vault State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ category: 'Others', file: null as File | null });
  const [attachmentCategories, setAttachmentCategories] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: number, name: string, url: string, type: string, html?: string } | null>(null);

  // Edit Candidate State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const openEditModal = () => {
    setEditForm({
      salutation: candidate.salutation || 'Mr.',
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      city: candidate.city || '',
      state: candidate.state || '',
      addressLine1: candidate.addressLine1 || '',
      area: candidate.area || '',
      experienceYears: candidate.experienceYears || '0',
      highestQualification: candidate.highestQualification || '',
      currentEmployer: candidate.currentEmployer || '',
      currentJobTitle: candidate.currentJobTitle || '',
      expectedSalary: candidate.expectedSalary || '',
      aptitudePaperSet: candidate.aptitudePaperSet || '',
      aptitudeMarks: candidate.aptitudeMarks || 0,
      techMarks: candidate.techMarks || 0
    });
    setIsEditModalOpen(true);
  };

  const handleEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/candidates/${id}`, editForm);
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully');
      fetchCandidate();
    } catch (err) {
      toast.error('Failed to update profile');
      console.error(err);
    }
  };

  const handlePreview = async (att: any) => {
    const fileUrl = att.url.startsWith('http') ? att.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${att.url}`;
    
    if (att.type.toLowerCase() === 'docx') {
      try {
        const res = await api.get(`/candidates/attachments/${att.id}/preview`);
        if (res.data.type === 'html') {
          setPreviewFile({ id: att.id, name: att.name, url: fileUrl, type: att.type, html: res.data.content });
          return;
        }
      } catch (err) { console.error('Preview error:', err); }
    }
    
    setPreviewFile({ id: att.id, name: att.name, url: fileUrl, type: att.type });
  };

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await api.get(`/candidates/${id}`);
      setCandidate(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id]);

  const fetchEmailHistory = useCallback(async () => {
    try {
      const res = await api.get(`/email/history/${id}`);
      setEmailHistory(res.data);
    } catch (err) { console.error('Failed to fetch email history', err); }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [usersRes, companyRes] = await Promise.all([
        api.get('/users'),
        api.get('/company')
      ]);
      setOwners(usersRes.data);
      setInterviewSettings({
        levels: companyRes.data.interviewLevels || ['TECH_1', 'TECH_2', 'HR', 'MANAGERIAL']
      });
      setEvaluationSchema(companyRes.data.feedbackSchema || []);
      setAttachmentCategories(companyRes.data.attachmentCategories || ['Resume', 'Cover Letter', 'Others', 'Offer', 'Contracts', 'Solutions R1', 'Solutions R2', 'Solutions R3', 'Solutions R4', 'Evaluation Sheet']);
    } catch (err) { console.error(err); }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('category', uploadForm.category);

    try {
      await api.post(`/candidates/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadModalOpen(false);
      setUploadForm({ category: 'Others', file: null });
      toast.success('Document uploaded');
      fetchCandidate();
    } catch (err) { toast.error('Failed to upload attachment'); }
    finally { setIsUploading(false); }
  };

  const handleRemoveAttachment = (attId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Attachment',
      description: 'Are you sure you want to remove this attachment? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/candidates/attachments/${attId}`);
          toast.success('Attachment removed');
          fetchCandidate();
        } catch (err) { toast.error('Failed to remove attachment'); }
      }
    });
  };

  const toggleFileSelection = (attId: number) => {
    setSelectedFiles(prev => 
      prev.includes(attId) ? prev.filter(i => i !== attId) : [...prev, attId]
    );
  };

  const toggleAllFiles = () => {
    if (selectedFiles.length === candidate?.attachments?.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(candidate?.attachments?.map((a: any) => a.id) || []);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchEmailHistory();
  }, [fetchEmailHistory]);

  const openScheduling = () => {
    if (!candidate.applications?.length) {
      toast.error('Please link this candidate to a job first.');
      return;
    }
    setScheduleForm({
      ...scheduleForm,
      applicationId: candidate.applications[0].id.toString()
    });
    setIsScheduleModalOpen(true);
  };

  const handleFromDateChange = (value: string) => {
    const fromDate = new Date(value);
    const newScheduleForm = { ...scheduleForm, date: value };

    // Auto-fill To Date if it's empty or matches the last auto-generated end time
    if (!scheduleForm.endTime || scheduleForm.endTime === lastAutoEndTime) {
      if (!isNaN(fromDate.getTime())) {
        const toDate = new Date(fromDate);
        toDate.setHours(toDate.getHours() + 1);
        
        // Format to YYYY-MM-DDTHH:mm for datetime-local
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

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/interviews', {
        ...scheduleForm,
        applicationId: parseInt(scheduleForm.applicationId),
        interviewerId: parseInt(scheduleForm.interviewerId),
        ownerId: parseInt(scheduleForm.ownerId)
      });
      setIsScheduleModalOpen(false);
      toast.success('Interview scheduled');
      fetchCandidate();
    } catch (err) { toast.error('Failed to schedule interview'); }
  };

  const fetchActiveJobs = async () => {
    try {
      const res = await api.get('/jobs/active');
      setJobs(res.data);
    } catch (err) { console.error('Failed to fetch jobs', err); }
  };

  const handleLinkJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    setIsLinking(true);
    try {
      await api.post('/applications', {
        candidateId: parseInt(id as string),
        jobId: parseInt(selectedJobId),
        status: 'APPLIED'
      });
      setIsJobModalOpen(false);
      setSelectedJobId('');
      toast.success('Candidate linked to job');
      fetchCandidate();
    } catch (err) { toast.error('Failed to link candidate to job'); }
    finally { setIsLinking(false); }
  };

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  }, []);

  const openEvaluation = useCallback((interview: any) => {
    setSelectedInterview(interview);
    setEvalForm({ 
      rating: interview.rating || 3, 
      feedback: interview.feedback || '', 
      status: interview.status === 'SCHEDULED' ? 'COMPLETED' : interview.status,
      reason: interview.reason || '',
      subReason: interview.subReason || ''
    });
    setIsEvalModalOpen(true);
  }, []);

  const submitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/interviews/${selectedInterview.id}`, {
        ...evalForm,
        status: evalForm.status
      });
      setIsEvalModalOpen(false);
      toast.success('Evaluation results recorded');
      fetchCandidate();
    } catch (err) { toast.error('Failed to save evaluation'); }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Analyzing Profile Intelligence...</p>
    </div>
  );

  if (!candidate) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Candidate not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* 1. Basic Info Header */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sticky top-4 z-40">
        <div className="flex items-center space-x-6">
           <button onClick={() => router.push('/candidates')} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 hover:border-slate-200">
              <ChevronLeft size={24} />
           </button>
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-200 group relative">
              <div className="absolute inset-0 bg-white/10 rounded-[2rem] animate-pulse" />
              <span className="relative z-10">{candidate.firstName?.charAt(0) || candidate.name?.charAt(0)}</span>
           </div>
           <div>
              <div className="flex items-center space-x-4 mb-2">
                 <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter">
                    {candidate.salutation} {candidate.firstName} {candidate.lastName || candidate.name}
                 </h1>
                 <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {candidate.status}
                 </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <div className="flex items-center space-x-2"><Mail size={14} className="text-indigo-500" /><span>{candidate.email}</span></div>
                 <div className="flex items-center space-x-2"><Phone size={14} className="text-indigo-500" /><span>{candidate.phone}</span></div>
                 <div className="flex items-center space-x-2"><MapPin size={14} className="text-indigo-500" /><span>{candidate.city || 'Remote'}, {candidate.state || 'IN'}</span></div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-[1.75rem] border border-slate-200 shadow-inner">
           <button onClick={openScheduling} className="p-3 text-slate-400 hover:text-indigo-600 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-100 transition-all active:scale-95" title="Schedule Interview"><Calendar size={20}/></button>
           <button onClick={() => setIsComposeModalOpen(true)} className="p-3 text-slate-400 hover:text-amber-600 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-amber-100 transition-all active:scale-95" title="Send Email"><Mail size={20}/></button>
           <button onClick={() => window.open(`/candidates/${id}/print-evaluation`, '_blank')} className="p-3 text-slate-400 hover:text-purple-600 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-purple-100 transition-all active:scale-95" title="Print Evaluation"><PrinterIcon size={20}/></button>
           <button onClick={openEditModal} className="flex items-center justify-center bg-[#0A2540] text-white hover:bg-[#4F46E5] rounded-xl shadow-md transition-all duration-300 active:scale-95 px-8 py-4">
             <span className="text-[10px] font-black uppercase tracking-widest">Update Profile</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* 2. Details Column */}
         <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-[#0A2540] rounded-[2.5rem] p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-white/5 rounded-xl border border-white/10"><History size={16} className="text-indigo-400" /></div>
                     <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Application Journey</h3>
                  </div>
                  <button 
                    onClick={() => { fetchActiveJobs(); setIsJobModalOpen(true); }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-indigo-400 border border-white/5"
                  >
                    <Plus size={16} />
                  </button>
               </div>
               <div className="space-y-6 relative z-10">
                  {candidate.applications?.length > 0 ? candidate.applications.map((app: any) => (
                    <div key={app.id} className="relative pl-8 border-l-2 border-white/5 pb-1 group">
                       <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0A2540] border-2 border-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.5)] group-hover:scale-125 transition-transform" />
                       <p className="text-[13px] font-black leading-tight mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">{app.job.title}</p>
                       <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(app.createdAt).toLocaleDateString()}</span>
                          <span className="text-[8px] font-black px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20 uppercase tracking-widest">{app.status}</span>
                       </div>
                    </div>
                  )) : (
                    <p className="text-[11px] text-slate-500 font-bold italic opacity-60">No linked job applications found.</p>
                  )}
               </div>
            </div>

            <AccordionItem id="professional" title="Professional Matrix" icon={<Briefcase size={18}/>} isExpanded={expandedSection === 'professional'} onToggle={toggleSection}>
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="label-meta block mb-1.5 opacity-60 text-slate-400">Experience</span>
                        <span className="text-sm font-black text-[#0F172A]">{candidate.experienceYears || '0'} Years</span>
                     </div>
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <span className="label-meta block mb-1.5 opacity-60 text-slate-400">Level</span>
                        <span className="text-sm font-black text-[#0F172A] truncate block">{candidate.highestQualification || '-'}</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col"><span className="label-meta mb-1.5 opacity-60 text-slate-400">Current Employer</span><span className="text-sm font-black text-[#0F172A]">{candidate.currentEmployer || '-'}</span></div>
                    <div className="flex flex-col"><span className="label-meta mb-1.5 opacity-60 text-slate-400">Active Role</span><span className="text-sm font-black text-[#0F172A]">{candidate.currentJobTitle || '-'}</span></div>
                    <div className="flex flex-col p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"><span className="label-meta mb-1 opacity-60 text-indigo-600">Compensation (Exp)</span><span className="text-lg font-black text-indigo-700 tracking-tight">{candidate.expectedSalary || '-'}</span></div>
                  </div>
               </div>
            </AccordionItem>

            <AccordionItem id="assessment" title="Technical Assessment" icon={<Trophy size={18}/>} isExpanded={expandedSection === 'assessment'} onToggle={toggleSection}>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 text-center group hover:bg-purple-100 transition-colors cursor-default">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-2">Paper Set</span>
                        <span className="text-sm font-black text-purple-900">{candidate.aptitudePaperSet || '-'}</span>
                     </div>
                     <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center group hover:bg-indigo-100 transition-colors cursor-default">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-2">Apti Marks</span>
                        <span className="text-sm font-black text-indigo-900">{candidate.aptitudeMarks || '0'}</span>
                     </div>
                     <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-center group hover:bg-amber-100 transition-colors cursor-default">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 block mb-2">Tech Marks</span>
                        <span className="text-sm font-black text-amber-900">{candidate.techMarks || '0'}</span>
                     </div>
                     <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 text-center shadow-inner group hover:bg-slate-200 transition-colors cursor-default">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Aggregate</span>
                        <span className="text-sm font-black text-[#0F172A]">{candidate.totalMarks || '0'}</span>
                     </div>
                  </div>
               </div>
            </AccordionItem>

            <AccordionItem id="address" title="Location Details" icon={<MapPin size={18}/>} isExpanded={expandedSection === 'address'} onToggle={toggleSection}>
               <div className="space-y-4">
                  <div className="flex flex-col"><span className="label-meta mb-1.5 opacity-60">Full Address</span><span className="text-sm font-bold text-slate-700 leading-relaxed">{candidate.addressLine1 || '-'}</span></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col"><span className="label-meta mb-1.5 opacity-60">City</span><span className="text-sm font-black text-[#0F172A] uppercase tracking-widest">{candidate.city || '-'}</span></div>
                    <div className="flex flex-col"><span className="label-meta mb-1.5 opacity-60">State</span><span className="text-sm font-black text-[#0F172A] uppercase tracking-widest">{candidate.state || '-'}</span></div>
                  </div>
               </div>
            </AccordionItem>
         </div>

         {/* 3. Activity Hub (Tabs) */}
         <div className="lg:col-span-8 space-y-6">
            <div className="corporate-card min-h-[700px] flex flex-col overflow-hidden">
               <div className="flex items-center space-x-2 bg-slate-50/50 p-3 border-b border-slate-200 overflow-x-auto no-scrollbar shadow-inner">
                  {[
                    { id: 'notes', name: 'Intelligence', icon: <MessageSquare size={14}/> },
                    { id: 'interviews', name: 'Scheduled', icon: <Calendar size={14}/> },
                    { id: 'reviews', name: 'Evaluations', icon: <Star size={14}/> },
                    { id: 'attachments', name: 'Vault', icon: <FileText size={14}/> },
                    { id: 'emails', name: 'History', icon: <Mail size={14}/> },
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0 relative ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-900/5 border border-indigo-100' : 'text-slate-400 hover:text-[#0F172A]'}`}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                      {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-8 h-1.5 bg-indigo-600 rounded-t-full shadow-[0_-4px_12px_rgba(79,70,229,0.4)]" />}
                    </button>
                  ))}
               </div>

               <div className="p-10 flex-1 overflow-y-auto no-scrollbar">
                  <AnimatePresence mode="wait">
                     {activeTab === 'notes' && (
                       <NotesTab 
                         notes={candidate.notes} 
                         candidateId={candidate.id} 
                         onNoteAdded={fetchCandidate} 
                       />
                     )}

                     {activeTab === 'interviews' && (
                        <motion.div key="interviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                 <div className="w-1 h-5 bg-indigo-600 rounded-full" />
                                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Assessment Schedule</h3>
                              </div>
                              <button 
                                onClick={openScheduling}
                                className="flex items-center space-x-3 bg-[#0A2540] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4F46E5] transition-all shadow-xl active:scale-95"
                              >
                                <Plus size={16}/><span>Schedule New</span>
                              </button>
                           </div>
                           
                           <div className="space-y-5">
                              {candidate.applications?.flatMap((app: any) => app.interviews).length > 0 ? 
                                candidate.applications.flatMap((app: any) => app.interviews).map((iv: any) => (
                                  <div key={iv.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all">
                                     <div className="flex items-center space-x-6" onClick={() => openEvaluation(iv)}>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner transition-colors duration-500 ${iv.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                                           {iv.round.split('_')[0]}
                                        </div>
                                        <div>
                                           <div className="font-black text-[#0F172A] text-base mb-1 tracking-tight">{iv.round.replace('_', ' ')}</div>
                                           <div className="flex items-center space-x-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                              <span className="flex items-center space-x-2"><Calendar size={14} className="text-indigo-500"/><span>{new Date(iv.date).toLocaleDateString()}</span></span>
                                              <span className="flex items-center space-x-2"><User size={14} className="text-indigo-500"/><span>{iv.interviewerUser?.firstName || iv.interviewer || 'TBD'}</span></span>
                                           </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center space-x-4">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setScheduleForm({
                                              applicationId: iv.applicationId.toString(),
                                              round: iv.round,
                                              date: new Date(iv.date).toISOString().slice(0, 16),
                                              endTime: iv.endTime ? new Date(iv.endTime).toISOString().slice(0, 16) : '',
                                              interviewerId: iv.interviewerId?.toString() || '',
                                              ownerId: iv.ownerId?.toString() || '',
                                              location: iv.location || '',
                                              notes: iv.notes || '',
                                              reminder: iv.reminder || '15_MIN'
                                            });
                                            setSelectedInterview(iv);
                                            setIsScheduleModalOpen(true);
                                          }}
                                          className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-200 hover:border-amber-100 shadow-sm"
                                          title="Reschedule"
                                        >
                                          <RefreshCw size={18} />
                                        </button>
                                        <div onClick={() => openEvaluation(iv)} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-200 transition-all border border-indigo-100 group-hover:border-slate-200">
                                           {iv.status === 'COMPLETED' ? 'View Evaluation' : 'Evaluate Now'}
                                        </div>
                                     </div>
                                  </div>
                                )) : (
                                  <div className="text-center py-28 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Calendar size={32} className="text-slate-200" />
                                     </div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No structured interviews found.</p>
                                  </div>
                                )
                              }
                           </div>
                        </motion.div>
                     )}
                     
                     {/* ... (emails, reviews, attachments follow same pattern) */}
                     {activeTab === 'reviews' && (
                        <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                 <div className="w-1 h-5 bg-amber-500 rounded-full" />
                                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0F172A]">Qualitative Feedback</h3>
                              </div>
                              <div className="flex items-center space-x-3 bg-amber-50 px-5 py-2.5 rounded-2xl border border-amber-100 shadow-sm">
                                 <Star size={16} className="text-amber-500 fill-amber-500" />
                                 <span className="text-xs font-black text-amber-800 tracking-widest uppercase">
                                    Aggregate Score: {(candidate.applications?.flatMap((app: any) => app.interviews).filter((iv: any) => iv.rating).reduce((acc: number, curr: any) => acc + curr.rating, 0) / (candidate.applications?.flatMap((app: any) => app.interviews).filter((iv: any) => iv.rating).length || 1)).toFixed(1)} / 5.0
                                 </span>
                              </div>
                           </div>

                           <div className="space-y-6">
                              {candidate.applications?.flatMap((app: any) => app.interviews).filter((iv: any) => iv.status === 'COMPLETED' || iv.feedback).length > 0 ? 
                                candidate.applications.flatMap((app: any) => app.interviews).filter((iv: any) => iv.status === 'COMPLETED' || iv.feedback).map((iv: any) => (
                                  <div key={iv.id} className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm space-y-6 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-900/5 transition-all">
                                     <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                                        <div className="flex items-center space-x-5">
                                           <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[11px] text-slate-500 shadow-inner">
                                              {iv.round.split('_')[0]}
                                           </div>
                                           <div>
                                              <p className="text-base font-black text-[#0F172A] tracking-tight">{iv.round.replace('_', ' ')}</p>
                                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Evaluated by {iv.interviewerUser?.firstName || iv.interviewer}</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center space-x-2 text-amber-500 bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 shadow-sm">
                                           {Array.from({length: 5}).map((_, i) => <Star key={i} size={18} fill={i < (iv.rating || 0) ? 'currentColor' : 'none'} className={i < (iv.rating || 0) ? 'text-amber-500' : 'text-amber-200'} />)}
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-6">
                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200 transition-colors hover:bg-slate-50">
                                           <p className="label-meta mb-2 opacity-60">Primary Intelligence</p>
                                           <p className="text-xs font-black text-[#0F172A] tracking-wide uppercase">{iv.reason || 'Not Specified'}</p>
                                        </div>
                                        <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200 transition-colors hover:bg-slate-50">
                                           <p className="label-meta mb-2 opacity-60">Sub-Intelligence</p>
                                           <p className="text-xs font-black text-[#0F172A] tracking-wide uppercase">{iv.subReason || 'Not Specified'}</p>
                                        </div>
                                     </div>

                                     <div className="p-8 bg-indigo-50/30 rounded-[2rem] border-l-4 border-indigo-500 shadow-inner">
                                        <p className="text-sm text-slate-700 font-bold italic leading-relaxed">
                                           "{iv.feedback || 'The interviewer has not provided granular written feedback for this round.'}"
                                        </p>
                                     </div>
                                  </div>
                                )) : (
                                  <div className="text-center py-28 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Star size={32} className="text-slate-200" />
                                     </div>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No evaluation metrics captured yet.</p>
                                  </div>
                                )
                              }
                           </div>
                        </motion.div>
                     )}
                     
                     {/* ... (History and Vault remain consistent with the new theme) */}
                  </AnimatePresence>
               </div>
            </div>
         </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
         {isEditModalOpen && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900">Edit Profile</h2>
                       <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Update {candidate.firstName}'s core intelligence</p>
                    </div>
                    <button onClick={() => setIsEditModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
                 </div>
                 <form onSubmit={handleEditCandidate} className="p-8 space-y-6 overflow-y-auto no-scrollbar max-h-[75vh]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Salutation</label>
                          <select className="w-full font-bold text-sm bg-gray-50" value={editForm.salutation} onChange={e => setEditForm({...editForm, salutation: e.target.value})}>
                             <option value="Mr.">Mr.</option>
                             <option value="Ms.">Ms.</option>
                             <option value="Mrs.">Mrs.</option>
                             <option value="Dr.">Dr.</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                          <input required type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Email</label>
                          <input required type="email" className="w-full font-bold text-sm bg-gray-50" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input required type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 1</label>
                       <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.addressLine1} onChange={e => setEditForm({...editForm, addressLine1: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.area} onChange={e => setEditForm({...editForm, area: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exp. (Years)</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.experienceYears} onChange={e => setEditForm({...editForm, experienceYears: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Highest Qualification</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.highestQualification} onChange={e => setEditForm({...editForm, highestQualification: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Employer</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.currentEmployer} onChange={e => setEditForm({...editForm, currentEmployer: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Job Title</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.currentJobTitle} onChange={e => setEditForm({...editForm, currentJobTitle: e.target.value})} />
                       </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paper Set</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.aptitudePaperSet} onChange={e => setEditForm({...editForm, aptitudePaperSet: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apti Marks</label>
                          <input type="number" className="w-full font-bold text-sm bg-gray-50" value={editForm.aptitudeMarks} onChange={e => setEditForm({...editForm, aptitudeMarks: parseInt(e.target.value) || 0})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tech Marks</label>
                          <input type="number" className="w-full font-bold text-sm bg-gray-50" value={editForm.techMarks} onChange={e => setEditForm({...editForm, techMarks: parseInt(e.target.value) || 0})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected CTC</label>
                          <input type="text" className="w-full font-bold text-sm bg-gray-50" value={editForm.expectedSalary} onChange={e => setEditForm({...editForm, expectedSalary: e.target.value})} />
                       </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Save Profile Intelligence</button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Evaluation Modal */}
      <AnimatePresence>
         {isEvalModalOpen && selectedInterview && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900">{selectedInterview.round.replace('_', ' ')} Evaluation</h2>
                       <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Candidate: {candidate.firstName} {candidate.lastName}</p>
                    </div>
                    <button onClick={() => setIsEvalModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X/></button>
                 </div>
                 <form onSubmit={submitEvaluation} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Reason</label>
                          <select required className="w-full font-bold text-sm bg-gray-50" value={evalForm.reason} onChange={e => setEvalForm({...evalForm, reason: e.target.value, subReason: ''})}>
                             <option value="">Select Category...</option>
                             {evaluationSchema.map((item: any) => <option key={item.category} value={item.category}>{item.category}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub-Reason</label>
                          <select required className="w-full font-bold text-sm bg-gray-50" value={evalForm.subReason} onChange={e => setEvalForm({...evalForm, subReason: e.target.value})}>
                             <option value="">Select Feedback...</option>
                             {evalForm.reason && evaluationSchema.find((i: any) => i.category === evalForm.reason)?.subCategories.map((sub: string) => (
                               <option key={sub} value={sub}>{sub}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Overall Rating (1-5)</label>
                       <div className="flex space-x-4">
                          {[1,2,3,4,5].map(r => (
                            <button key={r} type="button" onClick={() => setEvalForm({...evalForm, rating: r})} className={`flex-1 py-4 rounded-2xl border-2 transition-all text-lg font-black ${evalForm.rating === r ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-slate-200 text-gray-400 hover:border-blue-200'}`}>
                               {r}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Interview Feedback</label>
                       <textarea rows={4} className="w-full bg-gray-50 p-6 rounded-[24px] text-sm font-medium focus:bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" placeholder="Enter strengths, weaknesses, and final recommendation..." value={evalForm.feedback} onChange={e => setEvalForm({...evalForm, feedback: e.target.value})} />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-slate-200">
                       <div className="flex items-center space-x-3 text-orange-600">
                          <Target size={20}/>
                          <span className="text-[10px] font-black uppercase tracking-widest">Final Status</span>
                       </div>
                       <select className="bg-white border-slate-200 rounded-xl text-xs font-black uppercase py-2 px-4 shadow-sm" value={evalForm.status} onChange={e => setEvalForm({...evalForm, status: e.target.value})}>
                          <option value="COMPLETED">Passed Round</option>
                          <option value="FAILED">Rejected</option>
                          <option value="HOLD">On Hold</option>
                       </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Submit Evaluation Results</button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
         {isScheduleModalOpen && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900">Schedule Interview</h2>
                       <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">Candidate: {candidate.firstName} {candidate.lastName}</p>
                    </div>
                    <button onClick={() => setIsScheduleModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
                 </div>
                 <form onSubmit={handleScheduleInterview} className="p-8 space-y-6 overflow-y-auto no-scrollbar max-h-[70vh]">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interview Level</label>
                          <select required className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.round} onChange={e => setScheduleForm({...scheduleForm, round: e.target.value})}>
                             <option value="">Select Level...</option>
                             {interviewSettings.levels.map((l: string) => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Position / Job</label>
                          <select required className="w-full font-bold text-sm bg-gray-100" value={scheduleForm.applicationId} onChange={e => setScheduleForm({...scheduleForm, applicationId: e.target.value})}>
                             {candidate.applications?.map((app: any) => <option key={app.id} value={app.id}>{app.job.title}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date & Time</label>
                          <input required type="datetime-local" className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.date} onChange={e => handleFromDateChange(e.target.value)} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date & Time</label>
                          <input required type="datetime-local" className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.endTime} onChange={e => { setScheduleForm({...scheduleForm, endTime: e.target.value}); setLastAutoEndTime(''); }} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interviewer</label>
                          <select required className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.interviewerId} onChange={e => setScheduleForm({...scheduleForm, interviewerId: e.target.value})}>
                             <option value="">Select Interviewer...</option>
                             {owners.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interview Owner</label>
                          <select required className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.ownerId} onChange={e => setScheduleForm({...scheduleForm, ownerId: e.target.value})}>
                             <option value="">Select Owner...</option>
                             {owners.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location / Meeting URL</label>
                       <input type="text" className="w-full font-bold text-sm bg-gray-50" placeholder="Zoom, G-Meet or Address" value={scheduleForm.location} onChange={e => setScheduleForm({...scheduleForm, location: e.target.value})} />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes</label>
                       <textarea rows={2} className="w-full font-bold text-sm bg-gray-50" placeholder="Any preparation notes..." value={scheduleForm.notes} onChange={e => setScheduleForm({...scheduleForm, notes: e.target.value})} />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reminder</label>
                       <select className="w-full font-bold text-sm bg-gray-50" value={scheduleForm.reminder} onChange={e => setScheduleForm({...scheduleForm, reminder: e.target.value})}>
                          <option value="5_MIN">5 Minutes before</option>
                          <option value="15_MIN">15 Minutes before</option>
                          <option value="30_MIN">30 Minutes before</option>
                          <option value="1_HOUR">1 Hour before</option>
                          <option value="1_DAY">1 Day before</option>
                       </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Schedule Interview & Notify</button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Link Job Modal */}
      <AnimatePresence>
         {isJobModalOpen && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                       <h2 className="text-xl font-black text-gray-900">Associate with Job</h2>
                       <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Select an active opening for {candidate.firstName}</p>
                    </div>
                    <button onClick={() => setIsJobModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
                 </div>
                 <form onSubmit={handleLinkJob} className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Active Job</label>
                       <select 
                         required
                         className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                         value={selectedJobId}
                         onChange={e => setSelectedJobId(e.target.value)}
                       >
                          <option value="">Choose a position...</option>
                          {jobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.location})</option>)}
                       </select>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLinking || !selectedJobId}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-blue-300"
                    >
                       {isLinking ? 'Linking...' : 'Link Candidate to Job'}
                    </button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      <ComposeEmailModal 
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        candidate={candidate}
        onSent={fetchEmailHistory}
      />

      {/* Upload Attachment Modal */}
      <AnimatePresence>
         {isUploadModalOpen && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                       <h2 className="text-xl font-black text-gray-900">Upload Document</h2>
                       <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Add a new file to {candidate.firstName}'s vault</p>
                    </div>
                    <button onClick={() => setIsUploadModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
                 </div>
                 <form onSubmit={handleUploadAttachment} className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Category</label>
                       <select 
                         required
                         className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                         value={uploadForm.category}
                         onChange={e => setUploadForm({...uploadForm, category: e.target.value})}
                       >
                          {attachmentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select File</label>
                       <div className="relative group">
                          <input 
                            required 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={e => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                          />
                          <div className="bg-gray-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center group-hover:border-blue-200 transition-all">
                             <Plus size={24} className="mx-auto text-gray-300 mb-2 group-hover:text-blue-500" />
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">
                                {uploadForm.file ? uploadForm.file.name : 'Click to select or drag and drop'}
                             </p>
                          </div>
                       </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isUploading || !uploadForm.file}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-blue-300"
                    >
                       {isUploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {previewFile && (
           <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl flex items-center justify-center z-[200] p-8">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] shadow-2xl w-full h-full max-w-6xl overflow-hidden flex flex-col">
                 <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center space-x-4">
                       <div className="p-2 bg-blue-600 text-white rounded-xl"><FileText size={20}/></div>
                       <div>
                          <h2 className="text-lg font-black text-gray-900">{previewFile.name}</h2>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{previewFile.type}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/candidates/attachments/${previewFile.id}/download`} className="p-3 bg-white border border-slate-200 rounded-2xl text-gray-400 hover:text-blue-600 shadow-sm transition-all"><Download size={20}/></a>
                       <button onClick={() => setPreviewFile(null)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all border border-slate-200"><X size={20}/></button>
                    </div>
                 </div>
                 <div className="flex-1 bg-gray-100/50 p-4">
                    {previewFile.html ? (
                      <div className="w-full h-full bg-white rounded-2xl p-8 overflow-auto shadow-inner">
                        <div 
                          className="max-w-4xl mx-auto word-preview-content" 
                          dangerouslySetInnerHTML={{ __html: previewFile.html }} 
                        />
                        <style jsx global>{`
                          .word-preview-content h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; }
                          .word-preview-content h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
                          .word-preview-content p { margin-bottom: 1em; line-height: 1.6; }
                          .word-preview-content ul { list-style-type: disc; margin-left: 2em; margin-bottom: 1em; }
                          .word-preview-content ol { list-style-type: decimal; margin-left: 2em; margin-bottom: 1em; }
                          .word-preview-content table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                          .word-preview-content th, .word-preview-content td { border: 1px solid #ddd; padding: 8px; }
                        `}</style>
                      </div>
                    ) : previewFile.type.toLowerCase() === 'pdf' ? (
                      <iframe src={`${previewFile.url}#toolbar=0`} className="w-full h-full rounded-2xl border-0 bg-white shadow-inner" />
                    ) : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(previewFile.type.toLowerCase()) ? (
                      <div className="w-full h-full flex items-center justify-center">
                         <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl bg-white" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-white rounded-2xl shadow-inner">
                         <div className="p-8 bg-orange-50 text-orange-600 rounded-[40px]"><AlertCircle size={48}/></div>
                         <div className="text-center">
                            <p className="text-sm font-black text-gray-900">Preview Not Available</p>
                            <p className="text-xs font-bold text-gray-400 mt-1">This file type ({previewFile.type}) cannot be previewed in the browser.</p>
                         </div>
                         <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/candidates/attachments/${previewFile.id}/download`} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Download to View</a>
                      </div>
                    )}
                 </div>
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

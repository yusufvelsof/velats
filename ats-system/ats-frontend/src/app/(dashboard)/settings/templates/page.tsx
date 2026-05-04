'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ChevronLeft, 
  Save, 
  Mail, 
  CheckSquare, 
  Plus, 
  X, 
  Type, 
  Code,
  CheckCircle2,
  Trash2,
  Settings,
  ChevronRight,
  Info,
  Briefcase,
  History,
  Eye,
  Paperclip,
  Upload,
  UserCheck,
  Braces,
  Building2,
  GraduationCap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const PLACEHOLDERS = [
  { label: 'Candidate Full Name', value: '{{candidate_name}}' },
  { label: 'Job Title', value: '{{job_title}}' },
  { label: 'Interview Level', value: '{{interview_level}}' },
  { label: 'Interview Date & Time', value: '{{interview_date_time}}' },
  { label: 'Location / Link', value: '{{location}}' },
  { label: 'Interviewer Name', value: '{{interviewer_name}}' },
  { label: 'Company Name', value: '{{company_name}}' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const quillRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeType, setActiveTab] = useState<'email' | 'task' | 'job'>('email');
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateReason, setUpdateReason] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
  
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [otherTemplates, setTemplates] = useState<any>({
    task: [],
    job: []
  });

  const insertPlaceholder = (value: string) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertText(range.index, value);
    quill.setSelection(range.index + value.length);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setCurrentUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await api.get('/users');
      setTeamMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const res = await api.get('/email-templates');
      setEmailTemplates(res.data);
      if (res.data.length > 0 && !selectedId && activeType === 'email') {
        setSelectedId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOtherTemplates = async () => {
    try {
      const res = await api.get('/company');
      setCompanySettings(res.data);
      if (res.data.templatesConfig) {
        const config = res.data.templatesConfig;
        setTemplates({
          task: config.task || [],
          job: config.job || []
        });
        if (config[activeType]?.length > 0 && !selectedId && activeType !== 'email') {
          setSelectedId(config[activeType][0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchEmailTemplates(), fetchOtherTemplates(), fetchUserProfile(), fetchTeamMembers()])
      .finally(() => setLoading(false));
  }, []);

  const hiringManagers = teamMembers.filter(u => u.role === 'HIRING_MANAGER' || u.role === 'ADMIN');
  const recruiters = teamMembers.filter(u => u.role === 'RECRUITER' || u.role === 'ADMIN');
  const allUsers = teamMembers;

  const activeTemplate = activeType === 'email' 
    ? emailTemplates.find((t: any) => t.id === selectedId)
    : otherTemplates[activeType].find((t: any) => t.id === selectedId);

  const handleSave = async () => {
    if (activeType === 'email') {
      setIsUpdateModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      await api.patch('/company', { templatesConfig: { ...otherTemplates } });
      toast.success('Templates synchronized');
    } catch (err) {
      toast.error('Failed to sync templates');
    } finally {
      setSaving(false);
    }
  };

  const executeEmailUpdate = async () => {
    if (!updateReason.trim()) {
      toast.error('Please provide a reason for the update.');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/email-templates/${selectedId}`, {
        ...activeTemplate,
        reason: updateReason
      });
      setIsUpdateModalOpen(false);
      setUpdateReason('');
      toast.success('Template updated (New version created)');
      await fetchEmailTemplates();
    } catch (err) {
      toast.error('Failed to update template');
    } finally {
      setSaving(false);
    }
  };

  const updateActiveTemplate = (field: string, value: any) => {
    if (activeType === 'email') {
      setEmailTemplates(prev => prev.map((t: any) => 
        t.id === selectedId ? { ...t, [field]: value } : t
      ));
    } else {
      setTemplates({
        ...otherTemplates,
        [activeType]: otherTemplates[activeType].map((t: any) => 
          t.id === selectedId ? { ...t, [field]: value } : t
        )
      });
    }
  };

  const addNew = async () => {
    if (activeType === 'email') {
      const slug = `new-template-${Date.now()}`;
      try {
        const res = await api.post('/email-templates', {
          name: 'New Email Template',
          slug,
          subject: 'New Subject',
          body: '<p>Start typing...</p>',
          module: 'INTERVIEW',
          addSignature: true
        });
        await fetchEmailTemplates();
        setSelectedId(res.data.id);
        toast.success('New template created');
      } catch (err) {
        toast.error('Failed to create new template');
      }
      return;
    }

    const id = Date.now().toString();
    const newItem = activeType === 'job' 
      ? { 
          id, 
          name: 'New Job Template', 
          title: '', 
          position: '',
          department: '', 
          description: '',
          hiringManager: '',
          assignedRecruiter: '',
          postedBy: '',
          jobType: 'Full Time',
          experience: '',
          salaryRange: '',
          location: '',
          interviewMode: 'Virtual',
          requiredSkills: '',
          requirements: '',
          benefits: ''
        }
      : { id, name: 'New Task', steps: [] };
    
    setTemplates({
      ...otherTemplates,
      [activeType]: [...otherTemplates[activeType], newItem]
    });
    setSelectedId(id);
    toast.success(`New ${activeType} preset added`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/email-templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const currentAttachments = Array.isArray(activeTemplate.attachments) ? activeTemplate.attachments : [];
      updateActiveTemplate('attachments', [...currentAttachments, res.data]);
      toast.success('File uploaded');
    } catch (err) {
      toast.error('Failed to upload file');
    }
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = Array.isArray(activeTemplate.attachments) ? [...activeTemplate.attachments] : [];
    currentAttachments.splice(index, 1);
    updateActiveTemplate('attachments', currentAttachments);
    toast.info('File removed from template');
  };

  const handleCancel = async () => {
    if (activeType === 'email') {
      await fetchEmailTemplates();
    } else {
      await fetchOtherTemplates();
    }
    toast.info('Changes discarded');
  };

  const deleteTemplate = async (id: string | number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Template',
      description: 'Are you sure you want to delete this template? This action cannot be undone.',
      onConfirm: async () => {
        if (activeType === 'email') {
          try {
            await api.delete(`/email-templates/${id}`);
            await fetchEmailTemplates();
            setSelectedId(null);
            toast.success('Template deleted');
          } catch (err) { toast.error('Failed to delete'); }
          return;
        }

        setTemplates({
          ...otherTemplates,
          [activeType]: otherTemplates[activeType].filter((t: any) => t.id !== id)
        });
        if (selectedId === id) setSelectedId(null);
        toast.success(`${activeType} preset removed`);
      }
    });
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Master Templates</h1>
          
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl">
             {['email', 'task', 'job'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => { setActiveTab(tab as any); setSelectedId(null); }}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeType === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
               >{tab}</button>
             ))}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSave}
            disabled={saving || !selectedId}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
          >
            {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left List */}
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{activeType} Presets</h2>
              <button 
                onClick={addNew}
                className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
              >
                <Plus size={14}/>
              </button>
           </div>
           <div className="space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar">
              {(activeType === 'email' ? emailTemplates : otherTemplates[activeType]).map((t: any) => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedId(t.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${selectedId === t.id ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200 shadow-sm hover:border-blue-200'}`}
                >
                   <div className="flex items-center space-x-3 overflow-hidden text-left">
                      {activeType === 'email' && <Mail size={14} className={selectedId === t.id ? 'text-white' : 'text-blue-500'}/>}
                      {activeType === 'task' && <CheckSquare size={14} className={selectedId === t.id ? 'text-white' : 'text-indigo-500'}/>}
                      {activeType === 'job' && <Briefcase size={14} className={selectedId === t.id ? 'text-white' : 'text-orange-500'}/>}
                      <div className="overflow-hidden">
                        <p className={`text-xs font-black truncate ${selectedId === t.id ? 'text-white' : 'text-gray-700'}`}>{t.name}</p>
                        {activeType === 'email' && t.version && (
                          <span className={`text-[8px] font-black uppercase ${selectedId === t.id ? 'text-blue-200' : 'text-gray-400'}`}>v{t.version}</span>
                        )}
                      </div>
                   </div>
                   <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}
                        className={`opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md ${selectedId === t.id ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-gray-300 hover:text-red-500'}`}
                      >
                         <Trash2 size={12}/>
                      </button>
                      <ChevronRight size={14} className={selectedId === t.id ? 'text-white/50' : 'text-gray-200 group-hover:text-blue-600'} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Dynamic Editor Pane */}
        <div className="lg:col-span-3">
          {activeTemplate ? (
             <AnimatePresence mode="wait">
               {activeType === 'job' && (
                  <motion.div key="job-pane" initial={{opacity: 0}} animate={{opacity:1}} className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-10 max-h-[80vh] overflow-y-auto no-scrollbar">
                     {/* Template Identity */}
                     <div className="space-y-6">
                        <div className="flex items-center space-x-2 text-blue-600">
                           <Settings size={16} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Template Identity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Template Name</label>
                              <input type="text" value={activeTemplate.name} onChange={e => updateActiveTemplate('name', e.target.value)} className="w-full font-bold" placeholder="e.g. Senior Dev Template" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Title</label>
                              <input type="text" value={activeTemplate.title} onChange={e => updateActiveTemplate('title', e.target.value)} className="w-full font-black text-blue-600" placeholder="e.g. Lead Technical Architect" />
                           </div>
                        </div>
                     </div>

                     {/* Core Identity Alignment */}
                     <div className="space-y-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-blue-600">
                           <Building2 size={16} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Core Identity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                              <select value={activeTemplate.department || ''} onChange={e => updateActiveTemplate('department', e.target.value)} className="w-full font-bold">
                                 <option value="">Select...</option>
                                 {companySettings?.departments?.map((d: string) => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Position / Tech</label>
                              <select value={activeTemplate.position || ''} onChange={e => updateActiveTemplate('position', e.target.value)} className="w-full font-bold">
                                 <option value="">Select...</option>
                                 {companySettings?.technologies?.map((p: string) => <option key={p} value={p}>{p}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* Ownership Defaults */}
                     <div className="space-y-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-orange-600">
                           <UserCheck size={16} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Ownership Defaults</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hiring Manager</label>
                              <select value={activeTemplate.hiringManager || ''} onChange={e => updateActiveTemplate('hiringManager', e.target.value)} className="w-full font-bold">
                                 <option value="">Select...</option>
                                 {hiringManagers.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Recruiter</label>
                              <select value={activeTemplate.assignedRecruiter || ''} onChange={e => updateActiveTemplate('assignedRecruiter', e.target.value)} className="w-full font-bold">
                                 <option value="">Select...</option>
                                 { recruiters.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>) }
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Posted By</label>
                              <select value={activeTemplate.postedBy || ''} onChange={e => updateActiveTemplate('postedBy', e.target.value)} className="w-full font-bold">
                                 <option value="">Select...</option>
                                 { allUsers.map(u => <option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>) }
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* Profile & Requirements */}
                     <div className="space-y-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-purple-600">
                           <GraduationCap size={16} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Profile & Requirements</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Type</label>
                              <select value={activeTemplate.jobType || 'Full Time'} onChange={e => updateActiveTemplate('jobType', e.target.value)} className="w-full font-bold">
                                 <option value="Full Time">Full Time</option>
                                 <option value="Part Time">Part Time</option>
                                 <option value="Contract">Contract</option>
                                 <option value="Internship">Internship</option>
                                 <option value="Permanent">Permanent</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Needed</label>
                              <input type="text" value={activeTemplate.experience || ''} onChange={e => updateActiveTemplate('experience', e.target.value)} className="w-full font-bold" placeholder="e.g. 3-5 Years" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Salary Range</label>
                              <input type="text" value={activeTemplate.salaryRange || ''} onChange={e => updateActiveTemplate('salaryRange', e.target.value)} className="w-full font-bold" placeholder="e.g. 15L - 25L" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                              <input type="text" value={activeTemplate.location || ''} onChange={e => updateActiveTemplate('location', e.target.value)} className="w-full font-bold" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interview Mode</label>
                              <select value={activeTemplate.interviewMode || 'Virtual'} onChange={e => updateActiveTemplate('interviewMode', e.target.value)} className="w-full font-bold">
                                 <option value="Virtual">Virtual</option>
                                 <option value="F2F">Face to Face</option>
                                 <option value="Telephonic">Telephonic</option>
                                 <option value="Any">Any</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Required Skills</label>
                              <input type="text" value={activeTemplate.requiredSkills || ''} onChange={e => updateActiveTemplate('requiredSkills', e.target.value)} className="w-full font-bold" placeholder="Keywords: React, Node.js..." />
                           </div>
                        </div>
                     </div>

                     {/* Detailed Content */}
                     <div className="space-y-8 pt-6 border-t border-gray-50">
                        <div className="flex items-center space-x-2 text-indigo-600">
                           <Braces size={16} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Detailed Content</h3>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Description</label>
                           <ReactQuill theme="snow" value={activeTemplate.description || ''} onChange={val => updateActiveTemplate('description', val)} />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requirements</label>
                           <ReactQuill theme="snow" value={activeTemplate.requirements || ''} onChange={val => updateActiveTemplate('requirements', val)} />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Benefits</label>
                           <ReactQuill theme="snow" value={activeTemplate.benefits || ''} onChange={val => updateActiveTemplate('benefits', val)} />
                        </div>
                     </div>
                  </motion.div>
               )}
               
               {activeType === 'email' && (
                 <motion.div key="email-pane" initial={{opacity: 0}} animate={{opacity:1}} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="bg-gray-50/50 p-6 border-b border-slate-200 flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Mail size={20}/></div>
                          <div>
                             <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{activeTemplate.name}</h2>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Version {activeTemplate.version} • Last updated {new Date(activeTemplate.updatedAt).toLocaleString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-2">
                          <button onClick={() => setIsPreviewOpen(true)} className="p-2.5 bg-white text-gray-400 hover:text-blue-600 rounded-xl shadow-sm border border-slate-200 transition-all"><Eye size={18}/></button>
                       </div>
                    </div>

                    <div className="p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Module Category</label>
                             <select className="w-full font-bold text-sm bg-gray-50" value={activeTemplate.module} onChange={e => updateActiveTemplate('module', e.target.value)}>
                                <option value="CANDIDATE">Candidate Module</option>
                                <option value="INTERVIEW">Interview Module</option>
                                <option value="WALKIN">Walk-in Drive</option>
                                <option value="OFFER">Offers & Onboarding</option>
                             </select>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Template Name</label>
                             <input type="text" value={activeTemplate.name} onChange={e => updateActiveTemplate('name', e.target.value)} className="w-full font-bold" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Default From Email</label>
                             <input type="email" placeholder="hr@yourcompany.com" value={activeTemplate.defaultFromEmail || ''} onChange={e => updateActiveTemplate('defaultFromEmail', e.target.value)} className="w-full font-bold" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Line</label>
                             <input type="text" value={activeTemplate.subject} onChange={e => updateActiveTemplate('subject', e.target.value)} className="w-full font-black text-blue-600" />
                          </div>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center space-x-3">
                             <UserCheck size={18} className="text-gray-400" />
                             <div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Append Signature</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Include user's predefined email signature</p>
                             </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={activeTemplate.addSignature} onChange={e => updateActiveTemplate('addSignature', e.target.checked)} />
                             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                       </div>

                       <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Body Content</label>
                             <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                                   <Braces size={12} className="text-blue-600" />
                                   <select 
                                     className="bg-transparent text-[10px] font-black text-blue-600 uppercase tracking-widest outline-none cursor-pointer"
                                     onChange={(e) => {
                                       if (e.target.value) {
                                         insertPlaceholder(e.target.value);
                                         e.target.value = "";
                                       }
                                     }}
                                   >
                                      <option value="">Insert Placeholder</option>
                                      {PLACEHOLDERS.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                      ))}
                                   </select>
                                </div>
                                <span className="text-[8px] font-black text-gray-300 uppercase">Use {"{{variable_name}}"} for dynamic data</span>
                             </div>
                          </div>
                          <ReactQuill 
                            // @ts-ignore
                            ref={quillRef}
                            theme="snow" 
                            className="bg-white rounded-2xl overflow-hidden min-h-[300px]" 
                            value={activeTemplate.body} 
                            onChange={val => updateActiveTemplate('body', val)} 
                          />
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attachments</label>
                          <div className="grid grid-cols-2 gap-4">
                             <label className="border-2 border-dashed border-gray-200 rounded-[24px] p-6 flex flex-col items-center justify-center space-y-2 hover:border-blue-400 transition-all cursor-pointer group">
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-600 transition-all"><Upload size={20}/></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload files</p>
                             </label>
                             <div className="bg-gray-50 rounded-[24px] p-6 border border-slate-200 flex flex-col items-center justify-center">
                                {Array.isArray(activeTemplate.attachments) && activeTemplate.attachments.length > 0 ? (
                                  <div className="w-full space-y-2">
                                    {activeTemplate.attachments.map((file: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                        <div className="flex items-center space-x-2 overflow-hidden">
                                          <Paperclip size={12} className="text-blue-500 flex-shrink-0" />
                                          <span className="text-[10px] font-bold truncate">{file.name}</span>
                                        </div>
                                        <button onClick={() => removeAttachment(idx)} className="text-gray-300 hover:text-red-500 p-1">
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    <Paperclip size={20} className="text-gray-300 mb-2"/>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No files attached</p>
                                  </>
                                )}
                             </div>
                          </div>
                       </div>

                       <div className="pt-8 flex items-center justify-end space-x-4">
                          <button 
                            onClick={handleCancel}
                            className="px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 border border-slate-200 hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => setIsPreviewOpen(true)}
                            className="px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all flex items-center space-x-2"
                          >
                            <Eye size={16} />
                            <span>Preview</span>
                          </button>
                          <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-blue-300 flex items-center space-x-2"
                          >
                            {saving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                            <span>{saving ? 'Saving...' : 'Save Template'}</span>
                          </button>
                       </div>

                       {activeTemplate.history?.length > 0 && (
                         <div className="pt-6 border-t border-slate-200 space-y-4">
                            <div className="flex items-center space-x-2 text-gray-400">
                               <History size={14}/>
                               <span className="text-[10px] font-black uppercase tracking-widest">Revision History</span>
                            </div>
                            <div className="space-y-3">
                               {activeTemplate.history.map((h: any) => (
                                 <div key={h.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start justify-between shadow-sm">
                                    <div>
                                       <div className="flex items-center space-x-2 mb-1">
                                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black">V{h.version}</span>
                                          <span className="text-[9px] font-black text-gray-900 uppercase">{h.reason}</span>
                                       </div>
                                       <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(h.createdAt).toLocaleString()}</p>
                                    </div>
                                    <button className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline">Restore</button>
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                 </motion.div>
               )}

               {activeType === 'task' && (
                 <motion.div key="task-pane" initial={{opacity: 0}} animate={{opacity:1}} className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Workflow Name</label>
                       <input type="text" value={activeTemplate.name} onChange={e => updateActiveTemplate('name', e.target.value)} className="w-full text-sm font-bold" />
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200 py-32 text-center">
               <div className="p-4 bg-white rounded-2xl shadow-sm mb-4"><Plus className="text-gray-300" /></div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Template Selected</p>
               <button onClick={addNew} className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Create First Preset</button>
            </div>
          )}
        </div>
      </div>

      {/* Update Reason Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
                   <div>
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Save New Version</h2>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Briefly explain why this template is being updated</p>
                   </div>
                   <button onClick={() => setIsUpdateModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Reason</label>
                      <textarea 
                        rows={4} 
                        className="w-full bg-gray-50 p-6 rounded-[24px] text-sm font-medium border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                        placeholder="e.g. Updated interview location variables, corrected spelling, added logo branding..."
                        value={updateReason}
                        onChange={e => setUpdateReason(e.target.value)}
                      />
                   </div>
                   <div className="flex items-center space-x-4">
                      <button onClick={() => setIsUpdateModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 border border-slate-200 hover:bg-gray-50 transition-all">Cancel</button>
                      <button 
                        onClick={executeEmailUpdate}
                        disabled={saving || !updateReason.trim()}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-blue-300"
                      >
                         {saving ? 'Processing...' : 'Confirm & Save'}
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && activeTemplate && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-white">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                         <Mail size={24} />
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Email Preview</h2>
                         <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Template: {activeTemplate.name}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setIsPreviewOpen(false)} 
                     className="bg-gray-50 p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all hover:bg-red-50"
                   >
                     <X size={20}/>
                   </button>
                </div>
                
                <div className="overflow-y-auto no-scrollbar flex-1 bg-gray-50/50 p-8 lg:p-12">
                      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden mx-auto max-w-4xl">
                         {/* LOCKED Branded Header */}
                         <div className="p-4 px-10 text-left bg-white">
                            <img src="/logo.png" alt="Velocity Logo" className="h-[65px] block" />
                         </div>
                         <div className="h-1.5 bg-[#2b7dfb]" />

                         {/* Header Meta */}
                         <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                            <div className="grid gap-4">
                               <div className="flex items-start">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 pt-1">Subject</span>
                                  <p className="text-sm font-black text-[#0F172A] flex-1">{activeTemplate.subject}</p>
                               </div>
                               <div className="flex items-start">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 pt-1">From</span>
                                  <p className="text-sm font-bold text-indigo-600 flex-1">{activeTemplate.defaultFromEmail || 'hr@velsof.com'}</p>
                               </div>
                            </div>
                         </div>

                         {/* Branded Body */}
                         <div className="p-10 lg:p-14">
                            <div 
                              className="ql-editor !p-0 prose prose-slate max-w-none text-slate-700 leading-relaxed min-h-[200px] text-base" 
                              dangerouslySetInnerHTML={{ __html: activeTemplate.body }} 
                            />
                            
                            {/* Early Arrival Mandate Note */}
                            <div className="my-8 p-6 bg-slate-50 border-l-4 border-slate-200 rounded-lg">
                               <p className="m-0 text-sm font-bold text-slate-600">
                                 Note: We kindly request you to arrive at the venue or join the virtual meeting 15 minutes prior to your scheduled time.
                               </p>
                            </div>

                            {activeTemplate.attachments?.length > 0 && (
                              <div className="mt-12 pt-8 border-t border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Secured Attachments ({activeTemplate.attachments.length})</p>
                                <div className="flex flex-wrap gap-3">
                                  {activeTemplate.attachments.map((file: any, idx: number) => (
                                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                      <Paperclip size={14} className="text-indigo-500" />
                                      <span className="text-[11px] font-black text-slate-700">{file.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeTemplate.addSignature && (
                              <div className="mt-12 pt-10 border-t border-slate-200">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recruitment Signature</p>
                                 <div className="space-y-1">
                                    <p className="text-xs font-black text-[#0F172A]">Talent Acquisition Team</p>
                                    <p className="text-[11px] font-bold text-slate-500">Velocity Software Solutions Pvt. Ltd.</p>
                                    <p className="text-[10px] font-black text-indigo-600 mt-3">Visit our Careers Page</p>
                                 </div>
                              </div>
                            )}
                         </div>

                         {/* Footer Disclaimer */}
                         <div className="bg-slate-50/50 p-6 text-center border-t border-slate-200">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Velocity ATS • Secure Recruitment Portal</p>
                         </div>
                      </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-200 flex justify-center">
                   <button 
                     onClick={() => setIsPreviewOpen(false)}
                     className="px-12 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
                   >
                     Close Preview
                   </button>
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

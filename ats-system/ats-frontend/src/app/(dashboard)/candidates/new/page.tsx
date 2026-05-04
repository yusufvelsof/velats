'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, User, Mail, Phone, MapPin, Briefcase, 
  GraduationCap, Globe, UploadCloud, Plus, X, Save, 
  Search, ShieldCheck, AlertCircle, CheckCircle2,
  Trash2, PlusCircle, Link as LinkIcon, FileText,
  AlertTriangle, Eye, RefreshCw, GitMerge, Trophy
} from 'lucide-react';

const SECTIONS = [
  { id: 'basic', name: 'Basic Info', icon: <User size={16} /> },
  { id: 'address', name: 'Address Info', icon: <MapPin size={16} /> },
  { id: 'professional', name: 'Professional', icon: <Briefcase size={16} /> },
  { id: 'assessment', name: 'Assessment', icon: <Trophy size={16} /> },
  { id: 'education', name: 'Education', icon: <GraduationCap size={16} /> },
  { id: 'experience', name: 'Experience', icon: <Briefcase size={16} /> },
  { id: 'social', name: 'Social Profiles', icon: <Globe size={16} /> },
  { id: 'attachments', name: 'Attachments', icon: <FileText size={16} /> },
  { id: 'other', name: 'Other Info', icon: <ShieldCheck size={16} /> },
];

export default function AddCandidatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState('');
  const [duplicateFound, setDuplicateFound] = useState<any>(null);
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());
  
  // Job Association state after creation
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCandidateId, setNewCandidateId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLinking, setIsLinking] = useState(false);

  // Dynamic Lists
  const [statuses, setStatuses] = useState(['NEW', 'SHORTLISTED', 'REJECTED']);
  const [sources, setSources] = useState(['LinkedIn', 'Indeed', 'Employee Referral', 'Walk-in', 'Direct Application']);
  const [owners, setOwners] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    salutation: 'Mr.', firstName: '', lastName: '', email: '', mobile: '',
    addressLine1: '', area: '', city: '', state: '', zipCode: '',
    experienceYears: '', highestQualification: '', expectedSalary: '', currentEmployer: '', currentJobTitle: '', currentSalary: '', skillSet: '', additionalInfo: '',
    status: 'NEW', source: 'Direct Application', ownerId: '',
    linkedin: '', facebook: '', instagram: '', otherSocial: '',
    aptitudePaperSet: '', aptitudeMarks: 0, techMarks: 0, totalMarks: 0,
    education: [{ institute: '', degree: '', major: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', isCurrent: false }],
    experience: [{ title: '', company: '', summary: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', isCurrent: false }],
  });

  useEffect(() => {
    const apti = parseInt(formData.aptitudeMarks) || 0;
    const tech = parseInt(formData.techMarks) || 0;
    const total = apti + tech;
    if (total !== formData.totalMarks) {
      setFormData((prev: any) => ({ ...prev, totalMarks: total }));
    }
  }, [formData.aptitudeMarks, formData.techMarks]);

  const [attachments, setAttachments] = useState<any[]>([
    { type: 'RESUME', file: null, name: '' },
  ]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS = Array.from({ length: 40 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchInitialData();
    handlePrefill();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [usersRes, companyRes] = await Promise.all([
        api.get('/users'),
        api.get('/company')
      ]);
      setOwners(usersRes.data);
      if (companyRes.data.candidateStatuses) setStatuses(companyRes.data.candidateStatuses);
      if (companyRes.data.candidateSources) setSources(companyRes.data.candidateSources);
    } catch (err) { console.error(err); }
  };

  const handlePrefill = async () => {
    const source = searchParams.get('prefill');
    const id = searchParams.get('id');
    if (!source || !id) return;

    setLoading(true);
    try {
      const res = await api.get(`/candidates/prefill?source=${source}&id=${id}`);
      const mappedData = res.data;
      
      const newPrefilled = new Set<string>();
      Object.keys(mappedData).forEach(key => {
        if (mappedData[key]) newPrefilled.add(key);
      });
      setPrefilledFields(newPrefilled);

      setFormData((prev: any) => ({
        ...prev,
        ...mappedData,
        education: mappedData.education?.length > 0 ? mappedData.education : prev.education,
        experience: mappedData.experience?.length > 0 ? mappedData.experience : prev.experience,
      }));

      if (mappedData.email) {
        const dupRes = await api.get(`/candidates/check-duplicate?email=${encodeURIComponent(mappedData.email)}`);
        if (dupRes.data) setDuplicateFound(dupRes.data);
      }
    } catch (err) { console.error('Prefill failed', err); }
    finally { setLoading(false); }
  };

  const checkDuplicate = async () => {
    if (!formData.email) return;
    try {
      const res = await api.get(`/candidates/check-duplicate?email=${encodeURIComponent(formData.email)}&mobile=${encodeURIComponent(formData.mobile)}`);
      if (res.data) setDuplicateFound(res.data);
      else setDuplicateFound(null);
    } catch (err) { console.error(err); }
  };

  const handleMerge = async () => {
    if (!duplicateFound) return;
    setMerging(true);
    try {
      const submissionData = { ...formData };
      if (!submissionData.ownerId) {
        delete submissionData.ownerId;
      } else {
        submissionData.ownerId = parseInt(submissionData.ownerId, 10);
      }
      // 1. Update existing profile with new data
      await api.patch(`/candidates/${duplicateFound.id}`, submissionData);
      // 2. Refresh and Redirect
      router.push(`/candidates/${duplicateFound.id}`);
    } catch (err) { setError('Merge failed'); }
    finally { setMerging(false); }
  };

  const handleAddField = (type: 'education' | 'experience') => {
    setFormData((prev: any) => ({
      ...prev,
      [type]: [...prev[type], type === 'education' 
        ? { institute: '', degree: '', major: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', isCurrent: false }
        : { title: '', company: '', summary: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', isCurrent: false }
      ]
    }));
  };

  const removeField = (type: 'education' | 'experience', index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [type]: prev[type].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSectionUpdate = (type: 'education' | 'experience', index: number, field: string, value: any) => {
    const updated = [...formData[type]];
    updated[index][field] = value;
    
    // Auto-clear 'To' fields if 'isCurrent' is checked
    if (field === 'isCurrent' && value === true) {
      updated[index]['toMonth'] = '';
      updated[index]['toYear'] = '';
    }
    
    setFormData({ ...formData, [type]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName || !formData.email) {
      setError('Last Name and Email are mandatory.');
      return;
    }
    setSubmitting(true);
    setError('');

    const submissionData = { ...formData };
    if (!submissionData.ownerId) {
      delete submissionData.ownerId;
    } else {
      submissionData.ownerId = parseInt(submissionData.ownerId, 10);
    }

    try {
      const res = await api.post('/candidates', submissionData);
      const candidateId = res.data.id;

      for (const att of attachments) {
        if (att.file) {
          const fd = new FormData();
          fd.append('file', att.file);
          fd.append('type', att.type);
          await api.post(`/candidates/${candidateId}/upload-resume`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
      
      // Instead of immediate redirect, show success & link modal
      setNewCandidateId(candidateId);
      const jobsRes = await api.get('/jobs/active');
      setJobs(jobsRes.data);
      setShowSuccessModal(true);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkJob = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedJobId || !newCandidateId) {
      router.push(`/candidates/${newCandidateId}`);
      return;
    }
    
    setIsLinking(true);
    try {
      await api.post('/applications', {
        candidateId: newCandidateId,
        jobId: parseInt(selectedJobId),
        status: 'APPLIED'
      });
      router.push(`/candidates/${newCandidateId}`);
    } catch (err) {
      alert('Candidate created, but failed to link to job.');
      router.push(`/candidates/${newCandidateId}`);
    } finally {
      setIsLinking(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full" />
       <p className="text-xs font-black uppercase tracking-widest text-gray-400">Mapping Source Data...</p>
    </div>
  );

  const InputLabel = ({ label, required, fieldKey }: { label: string, required?: boolean, fieldKey?: string }) => (
    <div className="flex items-center justify-between mb-1.5 ml-1">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label} {required && '*'}</label>
      {fieldKey && prefilledFields.has(fieldKey) && (
        <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-50 px-1.5 rounded">Prefilled</span>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
             <h1 className="text-xl font-black text-gray-900 tracking-tight">Add New Candidate</h1>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intake Intelligence Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <button onClick={() => router.back()} className="px-6 py-2 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-gray-900 transition-all">Discard</button>
           <button 
             onClick={handleSubmit}
             disabled={submitting || !!duplicateFound}
             className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-blue-400"
           >
             {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
             <span>{submitting ? 'Creating...' : 'Save Candidate'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Navigation */}
         <div className="lg:col-span-1 space-y-2 sticky top-24 h-fit">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all border ${activeSection === s.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-gray-500 hover:bg-gray-50 hover:border-slate-200'}`}
              >
                <span className={activeSection === s.id ? 'text-white' : 'text-blue-500'}>{s.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{s.name}</span>
              </button>
            ))}
         </div>

         {/* Form Area */}
         <div className="lg:col-span-3 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center space-x-2">
                <AlertCircle size={18} />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            {duplicateFound && (
              <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[32px] text-amber-900 flex flex-col space-y-4 shadow-xl shadow-amber-900/10 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-amber-200 rounded-2xl text-amber-700"><AlertTriangle size={24} /></div>
                      <div>
                         <p className="text-xs font-black uppercase tracking-widest">Duplicate Detected</p>
                         <p className="text-sm font-bold opacity-80">{duplicateFound.name} already in system.</p>
                      </div>
                   </div>
                   <button onClick={() => setDuplicateFound(null)} className="p-2 hover:bg-amber-200 rounded-lg text-amber-700 transition-all"><X size={20}/></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => router.push(`/candidates/${duplicateFound.id}`)} className="flex items-center justify-center space-x-2 p-4 bg-white border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"><Eye size={16}/><span>View Existing Profile</span></button>
                   <button onClick={handleMerge} disabled={merging} className="flex items-center justify-center space-x-2 p-4 bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                      {merging ? <RefreshCw size={16} className="animate-spin" /> : <GitMerge size={16}/>}
                      <span>Merge & Update Existing</span>
                   </button>
                </div>
                <p className="text-[10px] text-amber-600 font-bold italic text-center px-4">Merging will append this form's data to the existing profile and redirect you.</p>
              </div>
            )}

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 space-y-10 min-h-[600px]">
               
               {activeSection === 'basic' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <User size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-6 gap-6">
                       <div className="col-span-1 space-y-2">
                          <InputLabel label="Salutation" />
                          <select className="w-full font-bold text-gray-900" value={formData.salutation} onChange={e => setFormData({...formData, salutation: e.target.value})}>
                             <option>Mr.</option><option>Ms.</option><option>Dr.</option><option>Mrs.</option>
                          </select>
                       </div>
                       <div className="col-span-2 space-y-2">
                          <InputLabel label="First Name" fieldKey="firstName" />
                          <input type="text" className={`w-full font-bold text-gray-900 ${prefilledFields.has('firstName') ? 'bg-blue-50/30' : ''}`} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                       </div>
                       <div className="col-span-3 space-y-2">
                          <InputLabel label="Last Name" required fieldKey="lastName" />
                          <input required type="text" className={`w-full font-bold text-gray-900 border-blue-100 focus:border-blue-600 ${prefilledFields.has('lastName') ? 'bg-blue-50/30' : ''}`} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                       </div>
                       <div className="col-span-3 space-y-2">
                          <InputLabel label="Email Address" required fieldKey="email" />
                          <input required type="email" onBlur={checkDuplicate} className={`w-full font-bold text-gray-900 border-blue-100 ${prefilledFields.has('email') ? 'bg-blue-50/30' : ''}`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                       </div>
                       <div className="col-span-3 space-y-2">
                          <InputLabel label="Mobile Number" fieldKey="mobile" />
                          <input type="tel" className={`w-full font-bold text-gray-900 ${prefilledFields.has('mobile') ? 'bg-blue-50/30' : ''}`} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'address' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <MapPin size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Address Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2 space-y-2">
                          <InputLabel label="Address Line 1" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Area / Locality" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="City" fieldKey="city" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="State" fieldKey="state" />
                          <select className="w-full font-bold text-gray-900" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                             <option value="">Select State...</option>
                             {/* States */}
                             <option>Andhra Pradesh</option>
                             <option>Arunachal Pradesh</option>
                             <option>Assam</option>
                             <option>Bihar</option>
                             <option>Chhattisgarh</option>
                             <option>Goa</option>
                             <option>Gujarat</option>
                             <option>Haryana</option>
                             <option>Himachal Pradesh</option>
                             <option>Jharkhand</option>
                             <option>Karnataka</option>
                             <option>Kerala</option>
                             <option>Madhya Pradesh</option>
                             <option>Maharashtra</option>
                             <option>Manipur</option>
                             <option>Meghalaya</option>
                             <option>Mizoram</option>
                             <option>Nagaland</option>
                             <option>Odisha</option>
                             <option>Punjab</option>
                             <option>Rajasthan</option>
                             <option>Sikkim</option>
                             <option>Tamil Nadu</option>
                             <option>Telangana</option>
                             <option>Tripura</option>
                             <option>Uttar Pradesh</option>
                             <option>Uttarakhand</option>
                             <option>West Bengal</option>
                             {/* Union Territories */}
                             <option>Andaman and Nicobar Islands</option>
                             <option>Chandigarh</option>
                             <option>Dadra and Nagar Haveli and Daman and Diu</option>
                             <option>Delhi</option>
                             <option>Jammu and Kashmir</option>
                             <option>Ladakh</option>
                             <option>Lakshadweep</option>
                             <option>Puducherry</option>
                          </select>
                       </div>                       <div className="space-y-2">
                          <InputLabel label="Zip Code" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'professional' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <Briefcase size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Professional Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <InputLabel label="Experience (Years)" fieldKey="experienceYears" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Highest Qualification" fieldKey="highestQualification" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Current Employer" fieldKey="currentEmployer" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.currentEmployer} onChange={e => setFormData({...formData, currentEmployer: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Current Job Title" fieldKey="currentJobTitle" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.currentJobTitle} onChange={e => setFormData({...formData, currentJobTitle: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Current Salary" fieldKey="currentSalary" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.currentSalary} onChange={e => setFormData({...formData, currentSalary: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Expected Salary" fieldKey="expectedSalary" />
                          <input type="text" className="w-full font-bold text-gray-900" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} />
                       </div>
                       <div className="col-span-2 space-y-2">
                          <InputLabel label="Skill Set" fieldKey="skillSet" />
                          <input type="text" className="w-full font-bold text-gray-900" placeholder="e.g. React, Node.js, SQL" value={formData.skillSet} onChange={e => setFormData({...formData, skillSet: e.target.value})} />
                       </div>
                       <div className="col-span-2 space-y-2">
                          <InputLabel label="Additional Info" />
                          <textarea rows={3} className="w-full font-bold text-gray-900" value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'assessment' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <Trophy size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Assessment Scores</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <InputLabel label="Paper Set" />
                          <input type="text" className="w-full font-bold text-gray-900" placeholder="e.g. Set A" value={formData.aptitudePaperSet} onChange={e => setFormData({...formData, aptitudePaperSet: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Aptitude Marks" />
                          <input type="number" className="w-full font-bold text-gray-900" value={formData.aptitudeMarks} onChange={e => setFormData({...formData, aptitudeMarks: parseInt(e.target.value) || 0})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Technical Marks" />
                          <input type="number" className="w-full font-bold text-gray-900" value={formData.techMarks} onChange={e => setFormData({...formData, techMarks: parseInt(e.target.value) || 0})} />
                       </div>
                       <div className="space-y-2">
                          <InputLabel label="Total Marks" />
                          <input type="number" disabled className="w-full font-bold text-gray-900 bg-gray-50" value={formData.totalMarks} />
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'education' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-blue-600">
                          <GraduationCap size={20} />
                          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Educational Details</h2>
                       </div>
                       <button type="button" onClick={() => handleAddField('education')} className="flex items-center space-x-2 text-blue-600 hover:underline">
                          <PlusCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                       </button>
                    </div>
                    
                    <div className="space-y-6">
                       {formData.education.map((edu: any, i: number) => (
                         <div key={i} className="p-6 bg-gray-50/50 rounded-[32px] border border-slate-200 relative group">
                            {i > 0 && (
                              <button onClick={() => removeField('education', i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                 <Trash2 size={16} />
                              </button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Institute / School</label><input type="text" className="w-full font-bold text-gray-900 border-gray-200" value={edu.institute} onChange={e => handleSectionUpdate('education', i, 'institute', e.target.value)} /></div>
                               <div className="space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Degree</label><input type="text" className="w-full font-bold text-gray-900 border-gray-200" value={edu.degree} onChange={e => handleSectionUpdate('education', i, 'degree', e.target.value)} /></div>
                               <div className="space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Major / Department</label><input type="text" className="w-full font-bold text-gray-900 border-gray-200" value={edu.major} onChange={e => handleSectionUpdate('education', i, 'major', e.target.value)} /></div>
                               
                               <div className="col-span-2 grid grid-cols-5 gap-4 items-end">
                                  <div className="col-span-2 space-y-1.5">
                                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">From (Month & Year)</label>
                                     <div className="flex space-x-2">
                                        <select className="flex-1 text-xs font-bold" value={edu.fromMonth} onChange={e => handleSectionUpdate('education', i, 'fromMonth', e.target.value)}>
                                           <option value="">Month</option>
                                           {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select className="flex-1 text-xs font-bold" value={edu.fromYear} onChange={e => handleSectionUpdate('education', i, 'fromYear', e.target.value)}>
                                           <option value="">Year</option>
                                           {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                  </div>
                                  <div className="col-span-2 space-y-1.5">
                                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">To (Month & Year)</label>
                                     <div className="flex space-x-2">
                                        <select disabled={edu.isCurrent} className="flex-1 text-xs font-bold disabled:bg-gray-100" value={edu.toMonth} onChange={e => handleSectionUpdate('education', i, 'toMonth', e.target.value)}>
                                           <option value="">Month</option>
                                           {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select disabled={edu.isCurrent} className="flex-1 text-xs font-bold disabled:bg-gray-100" value={edu.toYear} onChange={e => handleSectionUpdate('education', i, 'toYear', e.target.value)}>
                                           <option value="">Year</option>
                                           {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                  </div>
                                  <div className="flex items-center space-x-2 pb-3">
                                     <input type="checkbox" checked={edu.isCurrent} onChange={e => handleSectionUpdate('education', i, 'isCurrent', e.target.checked)} className="rounded" />
                                     <span className="text-[10px] font-bold text-gray-600 uppercase">Pursuing</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeSection === 'experience' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-blue-600">
                          <Briefcase size={20} />
                          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Experience Details</h2>
                       </div>
                       <button type="button" onClick={() => handleAddField('experience')} className="flex items-center space-x-2 text-blue-600 hover:underline">
                          <PlusCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                       </button>
                    </div>

                    <div className="space-y-6">
                       {formData.experience.map((exp: any, i: number) => (
                         <div key={i} className="p-6 bg-gray-50/50 rounded-[32px] border border-slate-200 relative group">
                            {i > 0 && (
                               <button onClick={() => removeField('experience', i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={16} />
                               </button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Title</label><input type="text" className="w-full font-bold text-gray-900 border-gray-200" value={exp.title} onChange={e => handleSectionUpdate('experience', i, 'title', e.target.value)} /></div>
                               <div className="space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label><input type="text" className="w-full font-bold text-gray-900 border-gray-200" value={exp.company} onChange={e => handleSectionUpdate('experience', i, 'company', e.target.value)} /></div>
                               <div className="col-span-2 space-y-1.5"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Summary</label><textarea rows={2} className="w-full font-bold text-gray-900 border-gray-200" value={exp.summary} onChange={e => handleSectionUpdate('experience', i, 'summary', e.target.value)} /></div>
                               
                               <div className="col-span-2 grid grid-cols-5 gap-4 items-end">
                                  <div className="col-span-2 space-y-1.5">
                                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">From (Month & Year)</label>
                                     <div className="flex space-x-2">
                                        <select className="flex-1 text-xs font-bold" value={exp.fromMonth} onChange={e => handleSectionUpdate('experience', i, 'fromMonth', e.target.value)}>
                                           <option value="">Month</option>
                                           {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select className="flex-1 text-xs font-bold" value={exp.fromYear} onChange={e => handleSectionUpdate('experience', i, 'fromYear', e.target.value)}>
                                           <option value="">Year</option>
                                           {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                  </div>
                                  <div className="col-span-2 space-y-1.5">
                                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">To (Month & Year)</label>
                                     <div className="flex space-x-2">
                                        <select disabled={exp.isCurrent} className="flex-1 text-xs font-bold disabled:bg-gray-100" value={exp.toMonth} onChange={e => handleSectionUpdate('experience', i, 'toMonth', e.target.value)}>
                                           <option value="">Month</option>
                                           {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select disabled={exp.isCurrent} className="flex-1 text-xs font-bold disabled:bg-gray-100" value={exp.toYear} onChange={e => handleSectionUpdate('experience', i, 'toYear', e.target.value)}>
                                           <option value="">Year</option>
                                           {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                     </div>
                                  </div>
                                  <div className="flex items-center space-x-2 pb-3">
                                     <input type="checkbox" checked={exp.isCurrent} onChange={e => handleSectionUpdate('experience', i, 'isCurrent', e.target.checked)} className="rounded" />
                                     <span className="text-[10px] font-bold text-gray-600 uppercase">Current</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeSection === 'social' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <Globe size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Social Profiles</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn Profile</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/><input type="url" className="w-full pl-10 font-bold text-gray-900 border-gray-200" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} /></div></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Facebook</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/><input type="url" className="w-full pl-10 font-bold text-gray-900 border-gray-200" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} /></div></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instagram</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/><input type="url" className="w-full pl-10 font-bold text-gray-900 border-gray-200" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} /></div></div>
                       <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Other Profile</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14}/><input type="url" className="w-full pl-10 font-bold text-gray-900 border-gray-200" value={formData.otherSocial} onChange={e => setFormData({...formData, otherSocial: e.target.value})} /></div></div>
                    </div>
                 </motion.div>
               )}

               {activeSection === 'attachments' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3 text-blue-600">
                          <FileText size={20} />
                          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Document Vault</h2>
                       </div>
                       <button type="button" onClick={() => setAttachments([...attachments, { type: 'OTHER', file: null, name: '' }])} className="flex items-center space-x-2 text-blue-600 hover:underline">
                          <PlusCircle size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Add More</span>
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {attachments.map((att, i) => (
                         <div key={i} className="p-5 bg-gray-50 border border-slate-200 rounded-[28px] space-y-4 relative group">
                            {i > 0 && (
                               <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                  <X size={14} />
                               </button>
                            )}
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Type</label>
                               <select 
                                 className="w-full text-xs font-bold"
                                 value={att.type}
                                 onChange={e => {
                                    const updated = [...attachments];
                                    updated[i].type = e.target.value;
                                    setAttachments(updated);
                                 }}
                               >
                                  <option value="RESUME">Resume</option>
                                  <option value="COVER">Cover Letter</option>
                                  <option value="OFFER">Offer Letter</option>
                                  <option value="CONTRACT">Contract</option>
                                  <option value="SOLUTION_R1">Solution R1</option>
                                  <option value="EVALUATION">Evaluation Sheet</option>
                                  <option value="OTHER">Other</option>
                               </select>
                            </div>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:bg-white transition-all cursor-pointer">
                               <input 
                                 type="file" 
                                 className="absolute inset-0 opacity-0 cursor-pointer" 
                                 onChange={e => {
                                    const file = e.target.files?.[0] || null;
                                    const updated = [...attachments];
                                    updated[i].file = file;
                                    updated[i].name = file?.name || '';
                                    setAttachments(updated);
                                 }}
                               />
                               <div className="flex items-center justify-center space-x-3">
                                  <UploadCloud size={16} className={att.file ? 'text-green-500' : 'text-gray-300'} />
                                  <span className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">{att.name || 'Attach File'}</span>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeSection === 'other' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex items-center space-x-3 text-blue-600">
                       <ShieldCheck size={20} />
                       <h2 className="text-sm font-black uppercase tracking-[0.2em]">Other Information</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Candidate Status</label>
                          <select className="w-full font-bold text-gray-900 border-gray-200" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                             {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source</label>
                          <select className="w-full font-bold text-gray-900 border-gray-200" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                             {sources.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Candidate Owner</label>
                          <select className="w-full font-bold text-gray-900 border-gray-200" value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})}>
                             <option value="">Unassigned</option>
                             {owners.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                          </select>
                       </div>
                    </div>
                 </motion.div>
               )}

            </div>
         </div>
      </div>

      {/* Post-Creation Success & Link Modal */}
      <AnimatePresence>
         {showSuccessModal && (
           <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                 <div className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                       <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Candidate Created!</h2>
                    <p className="text-gray-500 text-sm font-medium">The profile has been built. Would you like to associate this candidate with an active job opening now?</p>
                 </div>

                 <div className="px-8 pb-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Active Opening (Optional)</label>
                       <select 
                         className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                         value={selectedJobId}
                         onChange={e => setSelectedJobId(e.target.value)}
                       >
                          <option value="">Choose a position...</option>
                          {jobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.location})</option>)}
                       </select>
                    </div>

                    <div className="flex flex-col space-y-3">
                       <button 
                         onClick={() => handleLinkJob()}
                         disabled={isLinking}
                         className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                       >
                          {isLinking ? <RefreshCw size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                          <span>{selectedJobId ? 'Link & View Profile' : 'Skip & View Profile'}</span>
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, 
  UploadCloud, CheckCircle2, AlertCircle, FileText, ImageIcon, Award,
  AlertTriangle, RefreshCw, Link as LinkIcon, Building, Info, Star
} from 'lucide-react';

export default function WalkInRegistrationPage() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', gender: 'MALE', 
    currentState: '', currentCity: '', 
    hometownState: '', hometownCity: '',
    tenthPercentage: '', tenthYear: '',
    twelfthPercentage: '', twelfthYear: '',
    graduationDegree: '', gradOtherDegree: '', graduationYear: '', graduationPercentage: '', graduationCollege: '',
    pgDegree: '', pgOtherDegree: '', pgYear: '', pgPercentage: '', pgCollege: '',
    experienceType: 'Fresher', experienceDuration: 'Fresher', roleDescription: '',
    prevCompanyName: '', prevDesignation: '', currentCTC: '', expectedCTC: '', noticePeriod: '', reasonForChange: '',
    projectURL: '',
    technologies: '', dbProficiency: 1, whyFit: ''
  });

  const [resume, setResume] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);

  useEffect(() => {
    api.get(`/walkins/campaign/${campaignId}`)
      .then(res => setCampaign(res.data))
      .catch(() => setError('Invalid or expired campaign link.'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const handleSubmit = async (e: React.FormEvent, force: boolean = false) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (formData.dbProficiency < 1 || formData.dbProficiency > 5) {
      setError('DB Proficiency must be between 1 and 5');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    const submissionData = { ...formData };
    
    // Handle "Other" degree values
    if (submissionData.graduationDegree === 'Other') submissionData.graduationDegree = submissionData.gradOtherDegree;
    if (submissionData.pgDegree === 'Other') submissionData.pgDegree = submissionData.pgOtherDegree;

    // Clean up temporary fields before sending to API to avoid DTO errors
    const { gradOtherDegree, pgOtherDegree, ...finalData } = submissionData;

    Object.entries(finalData).forEach(([key, value]) => data.append(key, value.toString()));
    if (force) data.append('force', 'true');
    if (resume) data.append('resume', resume);
    if (photo) data.append('photo', photo);
    if (certificate) data.append('certificate', certificate);

    try {
      await api.post(`/walkins/register/${campaignId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message);
        setShowOverride(true);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please verify all fields.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 26 }, (_, i) => (2010 + i).toString());
  const degrees = ['B.Tech', 'BE', 'BCA', 'BSc', 'B.Com', 'BBA', 'Other'];
  const pgDegrees = ['M.Tech', 'ME', 'MCA', 'MSc', 'MBA', 'Other'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-slate-200">
         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
         </div>
         <h1 className="text-3xl font-black text-gray-900 mb-4">Registration Complete</h1>
         <p className="text-gray-500 font-medium leading-relaxed">Thank you, {formData.name}! Your details have been securely recorded.</p>
         <button onClick={() => window.location.reload()} className="mt-10 text-sm font-black text-blue-600 uppercase tracking-widest hover:underline">New Registration</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
           <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="Logo" width={140} height={140} className="object-contain" priority />
           </div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">{campaign?.title}</h1>
        </div>

        {error && (
          <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className={`p-6 rounded-[32px] border flex flex-col md:flex-row md:items-center justify-between gap-4 ${showOverride ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <div className="flex items-center space-x-3">
              {showOverride ? <AlertTriangle size={24} /> : <AlertCircle size={24} />}
              <div>
                <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Attention Required</p>
                <p className="text-xs font-bold opacity-80">{error}</p>
              </div>
            </div>
            {showOverride && (
               <button onClick={(e) => handleSubmit(e as any, true)} disabled={submitting} className="bg-orange-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center space-x-2 shrink-0">
                 <RefreshCw size={14} className={submitting ? 'animate-spin' : ''} />
                 <span>Confirm & Register Anyway</span>
               </button>
            )}
          </motion.div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-[48px] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden relative z-10"        >
          <div className="p-10 space-y-12">
            
            {/* Identity */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <User size={20} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Basic Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                  <input required type="text" className="w-full" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
                  <input required type="email" className="w-full" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                  <input required type="tel" className="w-full" placeholder="10-digit number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender *</label>
                  <select className="w-full" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current State *</label>
                  <select required className="w-full" value={formData.currentState} onChange={(e) => setFormData({...formData, currentState: e.target.value})}>
                    <option value="">Select State</option>
                    {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Other'].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current City/Area *</label>
                  <input required type="text" className="w-full" placeholder="e.g. Noida Sector 62" value={formData.currentCity} onChange={(e) => setFormData({...formData, currentCity: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hometown State *</label>
                  <select required className="w-full" value={formData.hometownState} onChange={(e) => setFormData({...formData, hometownState: e.target.value})}>
                    <option value="">Select State</option>
                    {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Other'].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hometown City/Area *</label>
                  <input required type="text" className="w-full" placeholder="e.g. Lucknow Gomti Nagar" value={formData.hometownCity} onChange={(e) => setFormData({...formData, hometownCity: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Academic */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <GraduationCap size={20} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Academic Records</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">10th % *</label>
                    <input required type="text" className="w-full text-xs font-bold" placeholder="75%" value={formData.tenthPercentage} onChange={(e) => setFormData({...formData, tenthPercentage: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">10th Year *</label>
                    <select required className="w-full text-xs" value={formData.tenthYear} onChange={(e) => setFormData({...formData, tenthYear: e.target.value})}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">12th % *</label>
                    <input required type="text" className="w-full text-xs font-bold" placeholder="80%" value={formData.twelfthPercentage} onChange={(e) => setFormData({...formData, twelfthPercentage: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">12th Year *</label>
                    <select required className="w-full text-xs" value={formData.twelfthYear} onChange={(e) => setFormData({...formData, twelfthYear: e.target.value})}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Graduation */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
                  <div className="space-y-2 col-span-1">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Graduation *</label>
                    <select required className="w-full text-xs font-bold" value={formData.graduationDegree} onChange={(e) => setFormData({...formData, graduationDegree: e.target.value})}>
                      <option value="">Degree</option>
                      {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {formData.graduationDegree === 'Other' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                      <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest ml-1">Specify Degree *</label>
                      <input required type="text" className="w-full text-xs" placeholder="Degree Name" value={formData.gradOtherDegree} onChange={e => setFormData({...formData, gradOtherDegree: e.target.value})} />
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Year *</label>
                    <select required className="w-full text-xs" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Score % *</label>
                    <input required type="text" className="w-full text-xs font-bold" placeholder="e.g. 75%" value={formData.graduationPercentage} onChange={(e) => setFormData({...formData, graduationPercentage: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">College *</label>
                    <input required type="text" className="w-full text-xs" placeholder="College Name" value={formData.graduationCollege} onChange={(e) => setFormData({...formData, graduationCollege: e.target.value})} />
                  </div>
                </div>

                {/* PG Section (Restored) */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-purple-50/30 p-6 rounded-3xl border border-purple-100/50">
                  <div className="space-y-2 col-span-1">
                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Post Graduation</label>
                    <select className="w-full text-xs font-bold" value={formData.pgDegree} onChange={(e) => setFormData({...formData, pgDegree: e.target.value})}>
                      <option value="">Degree (Optional)</option>
                      {pgDegrees.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {formData.pgDegree === 'Other' && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                      <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest ml-1">Specify Degree *</label>
                      <input required type="text" className="w-full text-xs" placeholder="PG Degree Name" value={formData.pgOtherDegree} onChange={e => setFormData({...formData, pgOtherDegree: e.target.value})} />
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Year</label>
                    <select className="w-full text-xs" value={formData.pgYear} onChange={(e) => setFormData({...formData, pgYear: e.target.value})}>
                      <option value="">Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Score %</label>
                    <input type="text" className="w-full text-xs font-bold" placeholder="e.g. 80%" value={formData.pgPercentage} onChange={(e) => setFormData({...formData, pgPercentage: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">College</label>
                    <input type="text" className="w-full text-xs" placeholder="PG College Name" value={formData.pgCollege} onChange={(e) => setFormData({...formData, pgCollege: e.target.value})} />
                  </div>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <Briefcase size={20} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Professional Background</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Type *</label>
                  <select required className="w-full font-black text-blue-600" value={formData.experienceType} onChange={(e) => setFormData({...formData, experienceType: e.target.value})}>
                    <option value="Fresher">Fresher</option>
                    <option value="Internship">Internship</option>
                    <option value="Job">Full-time Job</option>
                    <option value="Project">Academic/Personal Project</option>
                    <option value="Training">Industrial Training</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration *</label>
                  <select required className="w-full text-sm" value={formData.experienceDuration} onChange={(e) => setFormData({...formData, experienceDuration: e.target.value})}>
                    <option value="Fresher">Fresher</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2+ years">2+ years</option>
                  </select>
                </div>

                <AnimatePresence>
                   {formData.experienceType === 'Job' && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name *</label><div className="relative"><Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input required type="text" className="w-full pl-10 text-sm" placeholder="Employer" value={formData.prevCompanyName} onChange={e => setFormData({...formData, prevCompanyName: e.target.value})} /></div></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation *</label><div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input required type="text" className="w-full pl-10 text-sm" placeholder="Designation" value={formData.prevDesignation} onChange={e => setFormData({...formData, prevDesignation: e.target.value})} /></div></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current CTC *</label><input required type="text" className="w-full text-sm font-black" placeholder="e.g. 4.5 LPA" value={formData.currentCTC} onChange={e => setFormData({...formData, currentCTC: e.target.value})} /></div><div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected CTC *</label><input required type="text" className="w-full text-sm font-black text-blue-600" placeholder="e.g. 6.0 LPA" value={formData.expectedCTC} onChange={e => setFormData({...formData, expectedCTC: e.target.value})} /></div></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notice Period *</label><input required type="text" className="w-full text-sm" placeholder="Days" value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} /></div><div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Change *</label><input required type="text" className="w-full text-sm" placeholder="Reason" value={formData.reasonForChange} onChange={e => setFormData({...formData, reasonForChange: e.target.value})} /></div></div>
                     </motion.div>
                   )}
                </AnimatePresence>

                <AnimatePresence>
                   {(formData.experienceType === 'Project' || formData.experienceType === 'Internship') && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:col-span-2 space-y-2 overflow-hidden"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project / Portfolio URL *</label><div className="relative"><LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input required type="url" className="w-full pl-10 text-sm font-mono" placeholder="https://github.com/..." value={formData.projectURL} onChange={e => setFormData({...formData, projectURL: e.target.value})} /></div></motion.div>
                   )}
                </AnimatePresence>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Description / Project Summary</label>
                  <textarea rows={3} className="w-full text-sm" placeholder="Briefly describe..." value={formData.roleDescription} onChange={(e) => setFormData({...formData, roleDescription: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Technical */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <Award size={20} />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Skills & Proficiency</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Technologies *</label>
                  <input required type="text" className="w-full text-sm" placeholder="React, Node.js, Python, etc." value={formData.technologies} onChange={(e) => setFormData({...formData, technologies: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rate your Database Proficiency *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({...formData, dbProficiency: level})}
                        className={`py-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 !bg-white ${
                          formData.dbProficiency === level 
                            ? '!bg-blue-600 !border-blue-600 !text-white shadow-lg shadow-blue-200' 
                            : '!text-gray-400 hover:!border-blue-300 hover:!text-blue-500'
                        }`}
                        style={formData.dbProficiency === level ? { backgroundColor: '#2563eb !important', color: '#ffffff !important' } : {}}
                      >
                        <span className="text-sm font-black">{level}</span>
                        <span className="text-[7px] font-bold uppercase tracking-tighter">
                          {level === 1 && 'Basic'}
                          {level === 2 && 'Fair'}
                          {level === 3 && 'Good'}
                          {level === 4 && 'V. Good'}
                          {level === 5 && 'Expert'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-[9px] text-gray-400 font-medium italic ml-1">
                    <Info size={10} />
                    <span>Select 1 for Basics and 5 for Expert Architecture/Design level</span>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Why are you a good fit for this profile? *</label>
                  <textarea required rows={4} className="w-full text-sm leading-relaxed" placeholder="Value proposition..." value={formData.whyFit} onChange={(e) => setFormData({...formData, whyFit: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Uploads */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-3 text-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-1"><FileText size={12}/><span>Resume (PDF) *</span></label>
                  <div className="relative h-28 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"><input required type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setResume(e.target.files?.[0] || null)} /><UploadCloud size={20} className={resume ? 'text-green-500' : 'text-gray-300'} /><span className="text-[9px] font-black text-gray-500 mt-2 truncate px-4">{resume ? resume.name : 'Click to Upload'}</span></div>
               </div>
               <div className="space-y-3 text-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-1"><ImageIcon size={12}/><span>Passport Photo *</span></label>
                  <div className="relative h-28 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"><input required type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setPhoto(e.target.files?.[0] || null)} /><ImageIcon size={20} className={photo ? 'text-green-500' : 'text-gray-300'} /><span className="text-[9px] font-black text-gray-500 mt-2 truncate px-4">{photo ? photo.name : 'Click to Upload'}</span></div>
               </div>
               <div className="space-y-3 text-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center space-x-1"><Award size={12}/><span>Certificate</span></label>
                  <div className="relative h-28 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"><input type="file" accept=".pdf,image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setCertificate(e.target.files?.[0] || null)} /><CheckCircle2 size={20} className={certificate ? 'text-green-500' : 'text-gray-300'} /><span className="text-[9px] font-black text-gray-500 mt-2 truncate px-4">{certificate ? certificate.name : 'Optional'}</span></div>
               </div>
            </section>

            <button disabled={submitting} className="w-full bg-blue-600 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 disabled:bg-blue-400 flex items-center justify-center space-x-3">{submitting ? (<><RefreshCw size={20} className="animate-spin" /><span>Processing...</span></>) : (<span>Complete Registration</span>)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

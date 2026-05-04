'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Briefcase, 
  UploadCloud, CheckCircle2, AlertCircle, FileText, ImageIcon, Award,
  RefreshCw, Link as LinkIcon, Building, Info, ChevronLeft, ShieldCheck
} from 'lucide-react';

export default function ApplyJobPage() {
  const { id: jobId } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', gender: 'MALE', 
    currentLocation: '', hometown: '',
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

  useEffect(() => {
    api.get(`/jobs/${jobId}`)
      .then(res => setJob(res.data))
      .catch(() => setError('Invalid job post.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      setError('Please upload your resume to continue.');
      return;
    }
    setSubmitting(true);
    setError('');

    const submissionData = { ...formData };
    if (submissionData.graduationDegree === 'Other') submissionData.graduationDegree = submissionData.gradOtherDegree;
    if (submissionData.pgDegree === 'Other') submissionData.pgDegree = submissionData.pgOtherDegree;

    const { gradOtherDegree, pgOtherDegree, ...finalData } = submissionData;

    // Split name into firstName and lastName for backend
    const nameParts = finalData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

    try {
      const candidateRes = await api.post('/candidates', {
        ...finalData,
        firstName,
        lastName,
        jobId: parseInt(jobId as string)
      });

      const candidateId = candidateRes.data.id;

      if (resume) {
        const resumeData = new FormData();
        resumeData.append('file', resume);
        await api.post(`/candidates/${candidateId}/upload-resume`, resumeData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application failed. Please verify all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 26 }, (_, i) => (2010 + i).toString());
  const degrees = ['B.Tech', 'BE', 'BCA', 'BSc', 'B.Com', 'BBA', 'Other'];
  const pgDegrees = ['M.Tech', 'ME', 'MCA', 'MSc', 'MBA', 'Other'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white p-12 rounded-[48px] shadow-2xl border border-slate-200">
         <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
         </div>
         <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Sent!</h1>
         <p className="text-gray-500 font-medium leading-relaxed">Thank you, <span className="text-blue-600 font-bold">{formData.name}</span>! Your application for {job?.title} has been received.</p>
         <button onClick={() => router.push('/careers')} className="mt-10 bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Back to Careers</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Compact Header */}
        <div className="flex flex-col items-center text-center space-y-4">
           <button onClick={() => router.push(`/careers/job/${jobId}`)} className="self-start flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all mb-4">
              <ChevronLeft size={16} />
              <span>Cancel Application</span>
           </button>
           <div className="relative w-48 h-12 mb-2">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
           </div>
           <div className="space-y-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{job?.title}</h1>
              <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[9px]">Professional Application Portal</p>
           </div>
        </div>

        {error && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 rounded-2xl border bg-red-50 border-red-100 text-red-600 flex items-center space-x-3">
            <AlertCircle size={20} />
            <p className="text-xs font-bold">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-slate-200 overflow-hidden relative z-10">
          <div className="p-10 space-y-12">
            
            {/* Section 1: Identity */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-lg"><User size={18} /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Contact Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
                  <input required type="text" className="w-full text-sm font-bold text-gray-900 border-gray-200" placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
                  <input required type="email" className="w-full text-sm font-bold text-gray-900 border-gray-200" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                  <input required type="tel" className="w-full text-sm font-bold text-gray-900 border-gray-200" placeholder="10-digit number" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender *</label>
                  <select className="w-full text-sm font-bold text-gray-900 border-gray-200" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current City</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-900 border-gray-200" placeholder="e.g. Noida" value={formData.currentLocation} onChange={(e) => setFormData({...formData, currentLocation: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hometown</label>
                  <input type="text" className="w-full text-sm font-bold text-gray-900 border-gray-200" placeholder="e.g. Delhi" value={formData.hometown} onChange={(e) => setFormData({...formData, hometown: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Section 2: Academic */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-lg"><GraduationCap size={18} /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Academic records</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-slate-200">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">10th % *</label>
                      <input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.tenthPercentage} onChange={(e) => setFormData({...formData, tenthPercentage: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">10th Year *</label>
                      <select required className="w-full text-sm font-bold border-gray-200" value={formData.tenthYear} onChange={(e) => setFormData({...formData, tenthYear: e.target.value})}>
                         <option value="">Year</option>
                         {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-slate-200">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">12th % *</label>
                      <input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.twelfthPercentage} onChange={(e) => setFormData({...formData, twelfthPercentage: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">12th Year *</label>
                      <select required className="w-full text-sm font-bold border-gray-200" value={formData.twelfthYear} onChange={(e) => setFormData({...formData, twelfthYear: e.target.value})}>
                         <option value="">Year</option>
                         {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                   </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/30 p-6 rounded-[32px] border border-blue-100">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Graduation *</label>
                      <select required className="w-full text-sm font-bold border-blue-200" value={formData.graduationDegree} onChange={(e) => setFormData({...formData, graduationDegree: e.target.value})}>
                         <option value="">Degree</option>
                         {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   {formData.graduationDegree === 'Other' && (
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest ml-1">Specify Degree *</label>
                        <input required type="text" className="w-full text-sm font-bold border-orange-200" value={formData.gradOtherDegree} onChange={e => setFormData({...formData, gradOtherDegree: e.target.value})} />
                     </div>
                   )}
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Year *</label>
                      <select required className="w-full text-sm font-bold border-blue-200" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}>
                         <option value="">Year</option>
                         {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">Score % *</label>
                      <input required type="text" className="w-full text-sm font-bold border-blue-200" value={formData.graduationPercentage} onChange={(e) => setFormData({...formData, graduationPercentage: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">College *</label>
                      <input required type="text" className="w-full text-sm font-bold border-blue-200" value={formData.graduationCollege} onChange={(e) => setFormData({...formData, graduationCollege: e.target.value})} />
                   </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-purple-50/30 p-6 rounded-[32px] border border-purple-100">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Post Graduation</label>
                      <select className="w-full text-sm font-bold border-purple-200" value={formData.pgDegree} onChange={(e) => setFormData({...formData, pgDegree: e.target.value})}>
                         <option value="">Degree</option>
                         {pgDegrees.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                   </div>
                   {formData.pgDegree === 'Other' && (
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest ml-1">Specify Degree *</label>
                        <input required type="text" className="w-full text-sm font-bold border-orange-200" value={formData.pgOtherDegree} onChange={e => setFormData({...formData, pgOtherDegree: e.target.value})} />
                     </div>
                   )}
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Year</label>
                      <select className="w-full text-sm font-bold border-purple-200" value={formData.pgYear} onChange={(e) => setFormData({...formData, pgYear: e.target.value})}>
                         <option value="">Year</option>
                         {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">Score %</label>
                      <input type="text" className="w-full text-sm font-bold border-purple-200" value={formData.pgPercentage} onChange={(e) => setFormData({...formData, pgPercentage: e.target.value})} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest ml-1">College</label>
                      <input type="text" className="w-full text-sm font-bold border-purple-200" value={formData.pgCollege} onChange={(e) => setFormData({...formData, pgCollege: e.target.value})} />
                   </div>
                </div>
              </div>
            </section>

            {/* Section 3: Professional */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-lg"><Briefcase size={18} /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Work Experience</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience Type *</label>
                  <select required className="w-full text-sm font-bold border-gray-200" value={formData.experienceType} onChange={(e) => setFormData({...formData, experienceType: e.target.value})}>
                    <option value="Fresher">Fresher</option>
                    <option value="Internship">Internship</option>
                    <option value="Job">Full-time Job</option>
                    <option value="Project">Academic/Personal Project</option>
                    <option value="Training">Industrial Training</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration *</label>
                  <select required className="w-full text-sm font-bold border-gray-200" value={formData.experienceDuration} onChange={(e) => setFormData({...formData, experienceDuration: e.target.value})}>
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
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden pt-2">
                        <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.prevCompanyName} onChange={e => setFormData({...formData, prevCompanyName: e.target.value})} /></div>
                        <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.prevDesignation} onChange={e => setFormData({...formData, prevDesignation: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current CTC *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.currentCTC} onChange={e => setFormData({...formData, currentCTC: e.target.value})} /></div>
                           <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected CTC *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.expectedCTC} onChange={e => setFormData({...formData, expectedCTC: e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notice Period *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} /></div>
                           <div className="space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Change *</label><input required type="text" className="w-full text-sm font-bold border-gray-200" value={formData.reasonForChange} onChange={e => setFormData({...formData, reasonForChange: e.target.value})} /></div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>

                {(formData.experienceType === 'Project' || formData.experienceType === 'Internship') && (
                  <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project / Portfolio URL *</label><input required type="url" className="w-full text-sm font-bold border-gray-200" value={formData.projectURL} onChange={e => setFormData({...formData, projectURL: e.target.value})} /></div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Summary</label>
                  <textarea rows={3} className="w-full text-sm font-bold border-gray-200" value={formData.roleDescription} onChange={(e) => setFormData({...formData, roleDescription: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Section 4: Technical */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600">
                <div className="p-2 bg-blue-50 rounded-lg"><Award size={18} /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Skills & Fit</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Technologies *</label>
                  <input required type="text" className="w-full text-sm font-bold border-gray-200" placeholder="e.g. React, Node.js, SQL" value={formData.technologies} onChange={(e) => setFormData({...formData, technologies: e.target.value})} />
                </div>
                <div className="space-y-3 md:col-span-2 bg-gray-50/50 p-6 rounded-[32px] border border-slate-200">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center block">Database Proficiency (1-5) *</label>
                  <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button key={level} type="button" onClick={() => setFormData({...formData, dbProficiency: level})} className={`py-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${formData.dbProficiency === level ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border-gray-200 text-gray-400 hover:border-blue-300'}`}>
                        <span className="text-sm font-black">{level}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Why are you a good fit? *</label>
                  <textarea required rows={4} className="w-full text-sm font-bold border-gray-200 leading-relaxed" value={formData.whyFit} onChange={(e) => setFormData({...formData, whyFit: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Section 5: Resume */}
            <section className="space-y-6 pt-4 border-t border-gray-50">
               <div className="flex items-center space-x-3 text-blue-600">
                  <div className="p-2 bg-blue-50 rounded-lg"><FileText size={18} /></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em]">Upload Resume</h2>
               </div>
               <div className="max-w-md">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Resume / CV (PDF Only) *</label>
                  <div className="relative h-24 border-2 border-dashed border-gray-200 rounded-[24px] flex items-center px-8 hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all">
                     <input required type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                     <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${resume ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                           <UploadCloud size={20} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <p className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{resume ? resume.name : 'Choose your PDF file'}</p>
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{resume ? 'Click to replace' : 'Click to browse'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <div className="pt-4 space-y-4">
               <button disabled={submitting} className="w-full bg-blue-600 text-white p-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:bg-blue-400 flex items-center justify-center space-x-3">
                  {submitting ? (<><RefreshCw size={18} className="animate-spin" /><span>Submitting...</span></>) : (<span>Submit</span>)}
               </button>
               
               <div className="flex items-center justify-center space-x-3 text-gray-400">
                  <ShieldCheck size={16} className="text-green-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Enterprise Secure & Encrypted Application</span>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

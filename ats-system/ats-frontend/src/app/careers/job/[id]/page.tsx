'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  MapPin, 
  Clock, 
  ChevronLeft,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Globe,
  Banknote
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  position?: string;
  department?: string;
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
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!job) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest">Job not found</div>;

  const isContentEmpty = (html?: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, '').trim();
    return stripped.length === 0;
  };

  const sanitizeContent = (html?: string) => {
    if (!html) return '';
    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s([,.!?:;])/g, '$1')
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased leading-tight">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="relative w-40 h-10 cursor-pointer" onClick={() => router.push('/careers')}>
            <Image src="/logo.png" alt="Velocity Logo" fill className="object-contain object-left" priority />
          </div>
          <button onClick={() => router.push('/careers')} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
             <ChevronLeft size={14} />
             <span>Back to Openings</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* Left: Content */}
           <div className="lg:col-span-3 space-y-6">
              
              {/* Job Header */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                 <div className="flex items-center space-x-3 mb-4 text-[10px] font-black uppercase tracking-widest text-blue-600">
                    <span className="px-2 py-0.5 bg-blue-50 rounded border border-blue-100">{job.department || 'General'}</span>
                    <span className="text-gray-300">•</span>
                    <span>{job.jobType || 'Full-time'}</span>
                 </div>
                 <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-6">{job.title}</h1>
                 <div className="flex flex-wrap items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    {job.location && (
                      <div className="flex items-center space-x-2"><MapPin size={14} className="text-blue-500" /><span>{job.location}</span></div>
                    )}
                    <div className="flex items-center space-x-2"><Clock size={14} className="text-blue-500" /><span>Posted {new Date(job.createdAt).toLocaleDateString()}</span></div>
                 </div>
              </div>

              {/* Main Info */}
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="p-8 space-y-10">
                    {!isContentEmpty(job.description) && (
                      <section>
                         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center space-x-2">
                            <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
                            <span>Role Overview</span>
                         </h2>
                         <div className="quill-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(job.description) }} />
                      </section>
                    )}

                    {job.requiredSkills && (
                      <section className="pt-10 border-t border-gray-50">
                         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center space-x-2">
                            <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
                            <span>Required Expertise</span>
                         </h2>
                         <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.split(',').map((skill, idx) => (
                               <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                                  {skill.trim()}
                               </span>
                            ))}
                         </div>
                      </section>
                    )}

                    {!isContentEmpty(job.requirements) && (
                      <section className="pt-10 border-t border-gray-50">
                         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center space-x-2">
                            <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
                            <span>Key Requirements</span>
                         </h2>
                         <div className="quill-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(job.requirements) }} />
                      </section>
                    )}

                    {!isContentEmpty(job.benefits) && (
                      <section className="pt-10 border-t border-gray-50">
                         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center space-x-2">
                            <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
                            <span>Benefits</span>
                         </h2>
                         <div className="quill-content" dangerouslySetInnerHTML={{ __html: sanitizeContent(job.benefits) }} />
                      </section>
                    )}
                 </div>
              </div>
           </div>

           {/* Right: Sidebar */}
           <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                 <div className="bg-gray-900 text-white p-8 rounded-[32px] shadow-2xl space-y-6 text-center">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase tracking-tight">Apply Now</h3>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Process takes 2 mins</p>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/careers/apply/${job.id}`)}
                      className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95 border-b-4 border-blue-800"
                    >
                       <span>Apply here</span>
                       <ArrowRight size={14} />
                    </button>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                       <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <ShieldCheck size={14} className="text-green-500" />
                          <span className="text-[8px] font-black uppercase tracking-widest">Secure Application</span>
                       </div>
                    </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-slate-200 pb-3">Highlights</h3>
                    <div className="space-y-4">
                       {job.position && (
                         <div className="flex items-center space-x-3">
                            <Briefcase size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">{job.position}</span>
                         </div>
                       )}
                       {job.experience && (
                         <div className="flex items-center space-x-3">
                            <Briefcase size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">{job.experience} Exp</span>
                         </div>
                       )}
                       {job.salaryRange && (
                         <div className="flex items-center space-x-3">
                            <Banknote size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">{job.salaryRange}</span>
                         </div>
                       )}
                       {job.interviewMode && (
                         <div className="flex items-center space-x-3">
                            <Globe size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-gray-700">{job.interviewMode} Mode</span>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}

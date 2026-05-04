'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  jobType: string;
  createdAt: string;
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/active')
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900 leading-tight">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="relative w-40 h-10">
            <Image src="/logo.png" alt="Velocity Logo" fill className="object-contain object-left" priority />
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">Home</Link>
            <Link href="#jobs" className="bg-gray-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Open Roles</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Compact & Structured */}
      <section className="bg-white border-b border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
               <Zap size={12} className="fill-current" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Careers at Velocity</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
               Build elite software <br />
               <span className="text-blue-600">with a global team.</span>
            </h1>
            <p className="text-base text-gray-500 font-medium leading-relaxed max-w-xl">
               Join our mission to redefine enterprise intelligence. We look for builders, visionaries, and experts who want to make a real impact.
            </p>
          </motion.div>
          
          <div className="hidden md:block w-px h-32 bg-gray-100 mx-12" />

          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="p-6 bg-gray-50 rounded-[32px] border border-slate-200 text-center">
                <p className="text-3xl font-black text-blue-600 leading-none mb-2">{jobs.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Open Roles</p>
             </div>
             <div className="p-6 bg-gray-50 rounded-[32px] border border-slate-200 text-center">
                <p className="text-3xl font-black text-gray-900 leading-none mb-2">12+</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Locations</p>
             </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-16 bg-gray-50 px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-12">
           <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Active Openings</h2>
              <div className="h-px flex-1 bg-gray-200" />
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full mb-4" />
             </div>
           ) : jobs.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-[40px] border border-gray-200 border-dashed">
                <Briefcase size={40} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 uppercase">No Open Roles</h3>
             </div>
           ) : (
             <div className="grid gap-4">
                {jobs.map((job, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    key={job.id} 
                    className="bg-white p-6 rounded-[32px] border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 group flex items-center justify-between gap-6"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest">
                         <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{job.department || 'Engineering'}</span>
                         <span className="text-gray-300">•</span>
                         <span className="text-gray-500">{job.jobType || 'Full-time'}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-6 text-gray-400">
                         <div className="flex items-center space-x-1.5">
                            <MapPin size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{job.location || 'Noida'}</span>
                         </div>
                         <div className="flex items-center space-x-1.5">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(job.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </div>
                    <Link href={`/careers/job/${job.id}`} className="bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95 border border-slate-200 group-hover:border-blue-600 flex items-center space-x-2">
                       <span>Details</span>
                       <ChevronRight size={14} />
                    </Link>
                  </motion.div>
                ))}
             </div>
           )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="relative w-40 h-10 grayscale opacity-40">
             <Image src="/logo.png" alt="Logo" fill className="object-contain object-left" />
           </div>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">© 2026 Velocity Software Solutions</p>
           <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest">
              <Link href="#" className="text-gray-400 hover:text-blue-600">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

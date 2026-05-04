'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Database, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Server
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StoragePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const metrics = [
    { name: 'Database Records', usage: '245 MB', limit: '10 GB', percent: 2.5, icon: <Database size={18}/>, color: 'blue' },
    { name: 'Candidate Resumes', usage: '1.2 GB', limit: '50 GB', percent: 12, icon: <FileText size={18}/>, color: 'purple' },
    { name: 'System Logs', usage: '82 MB', limit: '5 GB', percent: 1.6, icon: <Clock size={18}/>, color: 'orange' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800); // Simulate fetch
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Storage</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resource Management</p>
        </div>
        <button className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-black transition-all shadow-lg active:scale-95">
          <RefreshCw size={16} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-6"
          >
             <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-${m.color}-50 text-${m.color}-600`}>
                   {m.icon}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.percent}% Used</span>
             </div>
             <div>
                <h3 className="text-sm font-black text-gray-900">{m.name}</h3>
                <div className="flex items-baseline space-x-1 mt-1">
                   <span className="text-2xl font-black text-gray-900">{m.usage}</span>
                   <span className="text-xs font-bold text-gray-400">/ {m.limit}</span>
                </div>
             </div>
             <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${m.percent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full bg-${m.color}-500 rounded-full`}
                />
             </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div>
               <h2 className="text-xl font-black text-gray-900">Optimization Center</h2>
               <p className="text-sm text-gray-400 font-medium mt-1">Free up space by cleaning up old system artifacts.</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center space-x-3 text-orange-600">
               <AlertCircle size={20} />
               <span className="text-xs font-black uppercase tracking-widest">Healthy</span>
            </div>
         </div>
         <div className="divide-y divide-gray-50">
            <div className="p-6 flex items-center justify-between group">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-red-500 transition-colors"><Trash2 size={20}/></div>
                  <div>
                     <p className="text-sm font-black text-gray-800">Clear Temporary Uploads</p>
                     <p className="text-xs text-gray-400 font-medium">Remove cached files and failed resume uploads.</p>
                  </div>
               </div>
               <button className="px-6 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">Execute Cleanup</button>
            </div>
            <div className="p-6 flex items-center justify-between group">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-blue-500 transition-colors"><Server size={20}/></div>
                  <div>
                     <p className="text-sm font-black text-gray-800">Log Archiving</p>
                     <p className="text-xs text-gray-400 font-medium">Archive activity logs older than 180 days to cold storage.</p>
                  </div>
               </div>
               <button className="px-6 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Run Archival</button>
            </div>
         </div>
      </section>
    </div>
  );
}

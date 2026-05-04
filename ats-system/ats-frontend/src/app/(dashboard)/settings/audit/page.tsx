'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  History, 
  Download, 
  Filter, 
  Search,
  UserPlus,
  Briefcase,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  createdAt: string;
}

export default function AuditTrailSettingsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activity-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getActionStyles = (action: string, entity: string) => {
    if (action === 'CREATED' && entity === 'CANDIDATE') return { icon: <UserPlus size={16} />, color: 'blue' };
    if (action === 'CREATED' && entity === 'JOB') return { icon: <Briefcase size={16} />, color: 'purple' };
    if (action === 'STATUS_CHANGED') return { icon: <Zap size={16} />, color: 'orange' };
    return { icon: <History size={16} />, color: 'gray' };
  };

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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Audit Trail</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System History</p>
        </div>
        <button className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-black transition-all shadow-lg active:scale-95">
          <Download size={16} />
          <span>Export Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input type="text" placeholder="Search system events..." className="w-64 pl-10 pr-4 py-2 rounded-xl border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              </div>
              <button className="p-2 bg-white rounded-xl border border-slate-200 text-gray-400 hover:text-gray-600 shadow-sm">
                <Filter size={16} />
              </button>
           </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50/30 border-b border-slate-200">
             <tr>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Source</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Description</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Context</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
             {logs.map((log) => {
               const { icon, color } = getActionStyles(log.action, log.entityType);
               return (
                 <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                   <td className="px-8 py-4">
                      <div className="flex items-center space-x-3">
                         <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>{icon}</div>
                         <span className="text-[10px] font-black uppercase text-gray-700 tracking-tighter">{log.entityType}</span>
                      </div>
                   </td>
                   <td className="px-8 py-4">
                      <p className="text-sm font-black text-gray-900 leading-none mb-1">{log.action.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-400 font-medium">{log.description}</p>
                   </td>
                   <td className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase">
                      <div className="flex items-center space-x-1">
                         <Clock size={12} className="text-gray-300" />
                         <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                   </td>
                   <td className="px-8 py-4 text-right">
                      <button className="text-gray-300 hover:text-blue-600 transition-colors"><ExternalLink size={14}/></button>
                   </td>
                 </tr>
               );
             })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

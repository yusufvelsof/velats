'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { History, Clock, FileText, CheckCircle2, UserPlus, Briefcase, Zap } from 'lucide-react';

interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1 }
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activity-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getActionStyles = (action: string, entity: string) => {
    if (action === 'CREATED' && entity === 'CANDIDATE') return { icon: <UserPlus size={18} />, color: 'blue' };
    if (action === 'CREATED' && entity === 'JOB') return { icon: <Briefcase size={18} />, color: 'purple' };
    if (action === 'STATUS_CHANGED') return { icon: <Zap size={18} />, color: 'orange' };
    if (action === 'CREATED' && entity === 'INTERVIEW') return { icon: <Clock size={18} />, color: 'emerald' };
    return { icon: <History size={18} />, color: 'gray' };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Audit Trail</h1>
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <History size={14} />
           <span>System Status: <span className="text-green-500">Live</span></span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        {loading ? (
          <div className="text-center text-gray-400 py-12 font-bold animate-pulse">Loading system logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
             <History size={48} className="text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">System is idle</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {logs.map((log) => {
              const { icon, color } = getActionStyles(log.action, log.entityType);
              
              return (
                <motion.div variants={item} key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  
                  {/* Icon Node */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-${color}-100 text-${color}-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110`}>
                    {icon}
                  </div>

                  {/* Content Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl hover:border-gray-200 transition-all border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-${color}-50 text-${color}-600 border border-${color}-100`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <time className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <div className="text-gray-900 font-black text-sm mb-1">{log.description}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {log.entityType} ID: #{log.entityId} • {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

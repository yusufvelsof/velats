'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Trash2, 
  RefreshCcw, 
  X, 
  CheckCircle2, 
  AlertCircle,
  User,
  Briefcase,
  Search,
  History
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RecycleBinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching soft-deleted items
    setItems([
      { id: 1, type: 'CANDIDATE', name: 'Mark Stevens', info: 'mark.s@example.com', date: '2026-04-24' },
      { id: 2, type: 'JOB', name: 'Node.js Architect', info: 'Engineering Dept', date: '2026-04-23' },
    ]);
    setLoading(false);
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
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Recycle Bin</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Recovery</p>
        </div>
        <button className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95">
          <Trash2 size={16} />
          <span>Empty Bin</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center space-x-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                 <input type="text" placeholder="Search deleted items..." className="w-64 pl-10 pr-4 py-2 rounded-xl border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
              </div>
           </div>
           <div className="flex items-center space-x-2 text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
              <AlertCircle size={14} className="mr-2" />
              <span>Items are permanently purged after 30 days</span>
           </div>
        </div>

        <div className="divide-y divide-gray-50">
          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
               <History size={48} className="text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Recycle bin is empty</p>
            </div>
          ) : items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="p-6 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
              <div className="flex items-center space-x-6">
                 <div className={`p-3 rounded-2xl ${item.type === 'CANDIDATE' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {item.type === 'CANDIDATE' ? <User size={20}/> : <Briefcase size={20}/>}
                 </div>
                 <div>
                    <div className="flex items-center space-x-3 mb-1">
                       <h3 className="text-sm font-black text-gray-900">{item.name}</h3>
                       <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-gray-200 text-gray-400 bg-white">{item.type}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">{item.info} • Deleted on {item.date}</p>
                 </div>
              </div>
              <div className="flex items-center space-x-3">
                 <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center space-x-2">
                    <RefreshCcw size={14}/>
                    <span>Restore</span>
                 </button>
                 <button className="p-2 text-gray-300 hover:text-red-600 transition-colors">
                    <Trash2 size={18}/>
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

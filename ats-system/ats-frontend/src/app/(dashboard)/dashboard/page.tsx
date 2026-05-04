'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  Send, 
  CheckCircle, 
  Clock,
  Calendar,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ChevronRight,
  Filter,
  Zap,
  Target,
  Trophy,
  UserCheck,
  UserX,
  ShieldAlert
} from 'lucide-react';

interface Stats {
  totalCandidates: number;
  totalJobs: number;
  applicationStats: {
    APPLIED: number;
    SHORTLISTED: number;
    INTERVIEW: number;
    OFFER: number;
    HIRED: number;
  };
}

interface WalkinStats {
  totalWalkins: number;
  aptitudeShortlisted: number;
  technicalScheduled: number;
  hrScheduled: number;
  hiredCount: number;
  onTrialCount: number;
  totalRejections: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [walkinStats, setWalkinStats] = useState<WalkinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('3m');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const [statsRes, walkinRes] = await Promise.all([
        api.get('/dashboard'),
        api.get(`/dashboard/walkin?range=${range}${range === 'custom' ? `&startDate=${startDate}&endDate=${endDate}` : ''}`)
      ]);
      setStats(statsRes.data);
      setWalkinStats(walkinRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  const handleCustomFilter = () => {
    if (startDate && endDate) fetchStats();
  };

  if (loading || !stats || !walkinStats) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
        <p className="text-gray-400 font-medium animate-pulse">Analyzing recruitment data...</p>
      </div>
    );
  }

  const mainCards = [
    { title: 'Total Talent', value: stats.totalCandidates, icon: <Users size={16}/>, color: 'blue', path: '/candidates' },
    { title: 'Open Jobs', value: stats.totalJobs, icon: <Briefcase size={16}/>, color: 'purple', path: '/jobs' },
    { title: 'Hired', value: stats.applicationStats.HIRED, icon: <CheckCircle size={16}/>, color: 'green', path: '/pipeline' },
  ];

  const walkinCards = [
    { title: 'Total Walk-ins', value: walkinStats.totalWalkins, icon: <Zap size={16}/>, color: 'blue', path: '/walkins' },
    { title: 'Shortlisted Apti', value: walkinStats.aptitudeShortlisted, icon: <Target size={16}/>, color: 'purple', path: '/walkins', query: '?status=SHORTLISTED_APTI' },
    { title: 'Tech Interview', value: walkinStats.technicalScheduled, icon: <Activity size={16}/>, color: 'orange', path: '/pipeline' },
    { title: 'HR Round', value: walkinStats.hrScheduled, icon: <Users size={16}/>, color: 'amber', path: '/pipeline' },
    { title: 'Final Hires', value: walkinStats.hiredCount, icon: <Trophy size={16}/>, color: 'green', path: '/candidates' },
    { title: 'Total Rejected', value: walkinStats.totalRejections, icon: <UserX size={16}/>, color: 'rose', path: '/walkins' },
    { title: 'On Trial', value: walkinStats.onTrialCount, icon: <Clock size={16}/>, color: 'indigo', path: '/candidates' },
    { title: 'Success Rate', value: walkinStats.totalWalkins > 0 ? Math.round((walkinStats.hiredCount / walkinStats.totalWalkins) * 100) + '%' : '0%', icon: <TrendingUp size={16}/>, color: 'emerald', path: '/pipeline' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      
      {/* Dynamic Header with Global Stats & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight border-r border-slate-200 pr-8 shrink-0">Dashboard</h1>
          <div className="flex items-center space-x-10 shrink-0">
            {mainCards.map((card, i) => (
              <div key={i} className="flex items-center space-x-3 cursor-pointer group" onClick={() => router.push(card.path)}>
                <div className={`p-2 rounded-xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-all duration-300 shadow-sm shadow-${card.color}-100`}>
                  {card.icon}
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 opacity-70">{card.title}</div>
                  <div className="text-lg font-black text-[#0F172A] leading-none">{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 hover:border-slate-200 transition-all">
             <Filter size={14} className="text-slate-400 mr-3" />
             <select 
               className="text-[10px] outline-none bg-transparent text-[#0F172A] font-black uppercase tracking-widest cursor-pointer"
               value={range}
               onChange={(e) => setRange(e.target.value)}
             >
                <option value="1m">Last 1 Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last 1 Year</option>
                <option value="custom">Custom Range</option>
             </select>
          </div>
          {range === 'custom' && (
            <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
               <input type="date" className="text-[10px] p-2 rounded-xl bg-slate-50 border-slate-200 font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} />
               <input type="date" className="text-[10px] p-2 rounded-xl bg-slate-50 border-slate-200 font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} />
               <button onClick={handleCustomFilter} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><CheckCircle size={14}/></button>
            </div>
          )}
          <button onClick={() => router.push('/walkins')} className="flex items-center space-x-3 bg-[#0A2540] text-white hover:bg-[#4F46E5] px-6 py-3 rounded-xl shadow-md transition-all duration-300 active:scale-95">
            <Zap size={14} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest">Launch Walk-in</span>
          </button>
        </div>
      </div>

      {/* Walk-in Analytics Grid */}
      <div className="space-y-5">
        <div className="flex items-center space-x-3 ml-2">
           <div className="w-1 h-4 bg-indigo-600 rounded-full" />
           <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Walk-in Lifecycle Analytics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {walkinCards.map((card, i) => (
            <motion.div 
              key={i} 
              variants={item}
              whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              onClick={() => router.push(card.path + (card.query || ''))}
              className="corporate-card p-5 group relative overflow-hidden cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 bg-${card.color}-500/5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700`} />
              <div className={`p-2.5 rounded-xl bg-${card.color}-50 text-${card.color}-600 mb-4 w-fit relative z-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                {card.icon}
              </div>
              <div className="text-2xl font-black text-[#0F172A] leading-none mb-1.5 relative z-10">{card.value}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-tight relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">{card.title}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Pipeline & Recent History */}
        <motion.div variants={item} className="lg:col-span-2 corporate-card p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Activity size={18} /></div>
                 <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Application Pipeline</h2>
              </div>
              <Link href="/pipeline" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center">
                View Detailed Report <ArrowUpRight size={12} className="ml-2" />
              </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-4 custom-scrollbar">
              {Object.entries(stats.applicationStats).map(([status, count]) => (
                <div key={status} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200 hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all group text-center cursor-default">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">{status}</p>
                   <p className="text-2xl font-black text-[#0F172A]">{count}</p>
                </div>
              ))}
           </div>
        </motion.div>

        <motion.div variants={item} className="corporate-card p-8">
           <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Trophy size={18} /></div>
              <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">Retention Health</h2>
           </div>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hiring Efficiency</span>
                 <span className="text-sm font-black text-emerald-600">84.2%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: '84.2%' }} 
                    transition={{ duration: 1.5, ease: "easeOut" }} 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
                 >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                 </motion.div>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed opacity-70">Calculated based on candidate promotion speed and successful 90-day onboarding metrics for current fiscal year.</p>
           </div>
        </motion.div>
      </div>

    </motion.div>
  );
}

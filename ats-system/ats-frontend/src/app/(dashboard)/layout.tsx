'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Bell, User as UserIcon, Menu, Search, Plus, ChevronDown, UserPlus, Briefcase } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { SettingsProvider } from '@/lib/contexts/SettingsContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<{ firstName?: string, lastName?: string, alias?: string, email?: string, permissions?: any } | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ candidates: any[], jobs: any[], campaigns: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isQuickAddOpen && !event.target.closest('.quick-add-dropdown')) {
        setIsQuickAddOpen(false);
      }
      if (isNotificationsOpen && !event.target.closest('.notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
      if (showSearchResults && !event.target.closest('.global-search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickAddOpen, isNotificationsOpen, showSearchResults]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        api.get(`/search?q=${searchQuery}`)
          .then(res => {
            setSearchResults(res.data);
            setShowSearchResults(true);
          })
          .catch(err => console.error('Search error:', err))
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/users/me')
      .then(res => {
        console.log('[DashboardLayout] Profile loaded:', res.data);
        setUser(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[DashboardLayout] Profile load failed:', err?.response?.status || err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} userPermissions={user?.permissions} />

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Slim Top Navbar - Optimized for Phase 1 & 2 */}
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex-shrink-0 flex items-center px-8 shadow-sm z-40">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 mr-6 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 border border-slate-200 hover:border-indigo-100"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={20} />
            </button>
            
            {/* Centered Search & Quick Add */}
            <div className="flex-1 flex items-center justify-center max-w-3xl">
               <div className="flex items-center w-full relative global-search-container">
                  <div className="relative w-full group">
                     <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-indigo-600 animate-pulse' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                     <input 
                       type="text" 
                       placeholder="Search candidates, positions, or modules..." 
                       className="w-full bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-4 py-2.5 text-[11px] font-bold transition-all placeholder:text-slate-400 outline-none border border-slate-200 focus:border-indigo-200 shadow-inner focus:shadow-none"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                     />
                  </div>

                  <AnimatePresence>
                     {showSearchResults && searchResults && (
                       <motion.div 
                         initial={{ opacity: 0, y: 15 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}
                         className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 z-50 max-h-[75vh] overflow-y-auto no-scrollbar border-t-0"
                       >
                          {/* Candidates */}
                          {searchResults.candidates.length > 0 && (
                            <div className="mb-6">
                               <h3 className="label-meta mb-3 px-3 opacity-60">Database Intelligence</h3>
                               <div className="space-y-1.5">
                                  {searchResults.candidates.map(c => (
                                    <button 
                                      key={c.id} 
                                      onClick={() => { router.push(`/candidates/${c.id}`); setShowSearchResults(false); setSearchQuery(''); }}
                                      className="w-full flex items-center justify-between p-3 hover:bg-indigo-50/50 rounded-2xl transition-all text-left group/item"
                                    >
                                       <div className="flex items-center space-x-4">
                                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">{c.name.charAt(0)}</div>
                                          <div>
                                             <p className="text-[12px] font-black text-[#0F172A]">{c.name}</p>
                                             <p className="text-[10px] font-bold text-slate-400">{c.email}</p>
                                          </div>
                                       </div>
                                       <span className="text-[9px] font-black bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 uppercase tracking-widest">{c.status}</span>
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}

                          {/* Jobs */}
                          {searchResults.jobs.length > 0 && (
                            <div className="mb-4">
                               <h3 className="label-meta mb-3 px-3 opacity-60">Open Mandates</h3>
                               <div className="space-y-1.5">
                                  {searchResults.jobs.map(j => (
                                    <button 
                                      key={j.id}
                                      onClick={() => { router.push('/jobs'); setShowSearchResults(false); setSearchQuery(''); }}
                                      className="w-full flex items-center justify-between p-3 hover:bg-amber-50/50 rounded-2xl transition-all text-left group/item"
                                    >
                                       <div className="flex items-center space-x-4">
                                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors"><Briefcase size={16}/></div>
                                          <div>
                                             <p className="text-[12px] font-black text-[#0F172A]">{j.title}</p>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{j.department}</p>
                                          </div>
                                       </div>
                                       <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">{j.status}</span>
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}

                          {searchResults.candidates.length === 0 && searchResults.jobs.length === 0 && searchResults.campaigns.length === 0 && (
                            <div className="py-12 text-center">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No matching intelligence found</p>
                            </div>
                          )}
                       </motion.div>
                     )}
                  </AnimatePresence>
                  
                  <div className="relative ml-6 quick-add-dropdown">
                     <button 
                       onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                       className="flex items-center space-x-3 bg-[#0A2540] text-white hover:bg-[#4F46E5] px-6 py-2.5 rounded-xl shadow-md transition-all duration-300 active:scale-95 whitespace-nowrap"
                     >
                       <Plus size={16} />
                       <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Execute</span>
                       <ChevronDown size={12} className={`transition-transform duration-500 ${isQuickAddOpen ? 'rotate-180' : ''}`} />
                     </button>

                     <AnimatePresence>
                        {isQuickAddOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 z-50 overflow-hidden"
                          >
                             <button 
                               onClick={() => { router.push('/candidates/new'); setIsQuickAddOpen(false); }}
                               className="w-full flex items-center space-x-4 px-4 py-3 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-2xl transition-all text-left group"
                             >
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><UserPlus size={16} /></div>
                                <span className="text-[11px] font-black uppercase tracking-widest">Candidate</span>
                             </button>
                             <button 
                               onClick={() => { router.push('/jobs'); setIsQuickAddOpen(false); }}
                               className="w-full flex items-center space-x-4 px-4 py-3 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-2xl transition-all text-left group"
                             >
                                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all"><Briefcase size={16} /></div>
                                <span className="text-[11px] font-black uppercase tracking-widest">New Job</span>
                             </button>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>

            {/* Right Side: Notifications & Profile */}
            <div className="flex-1 flex items-center justify-end space-x-6">
              <div className="relative notifications-dropdown">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2.5 rounded-2xl transition-all group active:scale-90 border shadow-sm ${isNotificationsOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-indigo-900/5' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200 hover:border-indigo-100 hover:shadow-indigo-900/5'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform shadow-sm"></span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0F172A]">Intelligence Feed</h3>
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 New</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {[
                          { id: 1, title: 'New Registration', desc: 'Auto Tester applied for E2E Test Engineer', time: 'Just now', icon: <UserPlus size={14} />, color: 'indigo' },
                          { id: 2, title: 'Interview Fixed', desc: 'Technical Round scheduled for tomorrow', time: '12 mins ago', icon: <Calendar size={14} />, color: 'amber' },
                          { id: 3, title: 'Mandate Update', desc: 'Software Engineer openings increased to 3', time: '2 hours ago', icon: <Briefcase size={14} />, color: 'emerald' },
                        ].map((n) => (
                          <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
                            <div className="flex items-start space-x-4">
                              <div className={`mt-1 p-2 rounded-xl bg-${n.color}-50 text-${n.color}-600 group-hover:scale-110 transition-transform`}>
                                {n.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] font-black text-[#0F172A]">{n.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-tight">{n.desc}</p>
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full p-4 bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors border-t border-slate-100">
                        View All Activity
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="h-8 w-px bg-slate-100"></div>

              <div className="flex items-center space-x-4 pl-2 group cursor-pointer" onClick={() => router.push('/settings/personal')}>
                <div className="text-right hidden sm:block">
                  <p className="text-[12px] font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors leading-none tracking-tight">
                    {user?.alias || (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Administrator')}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 leading-none opacity-70 group-hover:text-indigo-400 transition-colors">{user?.email || 'hr@velsof.com'}</p>
                </div>
                <div className="relative">
                  <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center min-w-[36px] min-h-[36px] group-hover:border-indigo-200 group-hover:scale-105 transition-all">
                    <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain" priority />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-10 overflow-y-auto min-w-0 no-scrollbar bg-[#F8FAFC]">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, CheckCircle2, Clock, XCircle, Search, RefreshCw, 
  MapPin, Briefcase, Calendar, ChevronRight, AlertCircle, Filter,
  Phone, Mail, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/lib/api';

export default function LiveDrivePanel() {
  const params = useParams();
  const driveId = params.id;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newlyCheckedIn, setNewlyCheckedIn] = useState<number[]>([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await api.get(`/slots/live/${driveId}`);
      
      // Check for new check-ins to highlight
      if (data) {
        const newlyAdded = res.data.bookings
          .filter((b: any) => b.status === 'CHECKED_IN' && 
                 !data.bookings.find((oldB: any) => oldB.id === b.id && oldB.status === 'CHECKED_IN'))
          .map((b: any) => b.id);
        
        if (newlyAdded.length > 0) {
          setNewlyCheckedIn(prev => [...prev, ...newlyAdded]);
          toast.success(`${newlyAdded.length} new check-in(s) detected!`);
          setTimeout(() => {
            setNewlyCheckedIn(prev => prev.filter(id => !newlyAdded.includes(id)));
          }, 3000);
        }
      }

      setData(res.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load live data.');
      toast.error('Failed to sync live data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [driveId]);

  // Auto-focus search on mount
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [loading]);

  const handleManualCheckIn = async (bookingId: number) => {
    try {
      await api.post('/slots/check-in/confirm', { bookingId, token: 'ADMIN_OVERRIDE' });
      toast.success('Manual check-in successful');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleMarkNoShow = (bookingId: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Mark as No-Show',
      description: 'Are you sure you want to mark this candidate as No-Show? This will finalize their status as absent.',
      onConfirm: async () => {
        try {
          // Simulation for now
          toast.success('Candidate marked as No-Show');
          fetchData(true);
        } catch (err) {
          toast.error('Failed to update status');
        }
      }
    });
  };

  if (loading) return (
    <div className="p-12 min-h-[600px] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <RefreshCw className="absolute inset-0 m-auto text-blue-600 opacity-20" size={32} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Live Stream</p>
        <p className="text-xs font-bold text-gray-300">Syncing attendance data...</p>
      </div>
    </div>
  );

  const filteredBookings = data?.bookings.filter((b: any) => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.mobile.includes(search) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-sans">
      
      {/* Sticky Stats Header */}
      <div className="sticky top-0 z-50 py-4 -mt-4 bg-gray-50/80 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: data.stats.total, icon: Users, color: 'blue', bg: 'bg-blue-600' },
            { label: 'Present', value: data.stats.checkedIn, icon: CheckCircle2, color: 'green', bg: 'bg-green-500' },
            { label: 'Waiting', value: data.stats.pending, icon: Clock, color: 'amber', bg: 'bg-amber-500' },
            { label: 'Absent', value: data.stats.noShow, icon: XCircle, color: 'red', bg: 'bg-red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 ${stat.bg} text-white rounded-xl flex items-center justify-center shadow-lg shadow-${stat.color}-100`}>
                <stat.icon size={20} strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drive Info Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[50px] shadow-sm border border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
             <div className="flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                Active Now
             </div>
             <div className="flex items-center text-gray-400 text-xs font-bold bg-gray-50 px-3 py-1 rounded-full">
                <Calendar size={14} className="mr-1.5 text-blue-600" />
                {new Date(data.drive.startDate).toDateString()}
             </div>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">{data.drive.name}</h1>
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center text-gray-600 text-sm font-black uppercase tracking-widest">
                <Briefcase size={16} className="mr-2 text-blue-600" />
                {data.drive.job.title}
             </div>
             <div className="flex items-center text-gray-600 text-sm font-black uppercase tracking-widest">
                <MapPin size={16} className="mr-2 text-blue-600" />
                {data.drive.location}
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pulse Check</p>
              <p className="text-sm font-black text-gray-900">{new Date().toLocaleTimeString()}</p>
           </div>
           <button 
             onClick={() => fetchData(true)} 
             disabled={isRefreshing}
             className="w-16 h-16 bg-white border-2 border-gray-50 rounded-[24px] shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-blue-600 flex items-center justify-center group active:scale-95"
           >
              <RefreshCw size={24} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[50px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gray-50/30">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Filter size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Real-time Desk</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Managing {filteredBookings.length} Active Records</p>
              </div>
           </div>
           <div className="relative max-w-lg w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search candidates instantly..." 
                className="w-full pl-14 pr-6 bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-0 rounded-[24px] text-sm font-black h-16 shadow-inner transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="pl-10 pr-6 py-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Candidate Info</th>
                <th className="px-6 py-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Scheduled Slot</th>
                <th className="px-6 py-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Activity Log</th>
                <th className="pl-6 pr-10 py-8 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredBookings.map((booking: any) => {
                  const isNew = newlyCheckedIn.includes(booking.id);
                  return (
                    <motion.tr 
                      key={booking.id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        backgroundColor: isNew ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0)'
                      }}
                      className={`group transition-colors duration-500 ${isNew ? 'ring-2 ring-inset ring-green-200' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="pl-10 pr-6 py-8">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-colors ${
                            booking.status === 'CHECKED_IN' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {booking.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">{booking.name}</p>
                            <div className="flex items-center space-x-3 mt-1">
                               <div className="flex items-center text-[11px] font-bold text-gray-400">
                                  <Phone size={10} className="mr-1.5" /> {booking.mobile}
                               </div>
                               <div className="flex items-center text-[11px] font-bold text-gray-400">
                                  <Mail size={10} className="mr-1.5" /> {booking.email}
                               </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-2xl">
                           <Clock size={16} className="mr-2.5 text-blue-600" strokeWidth={2.5} />
                           <span className="text-sm font-black text-gray-900">
                              {new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        <div className={`inline-flex px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${
                          booking.status === 'CHECKED_IN' ? 'bg-green-50 text-green-700 border-green-100' :
                          booking.status === 'CONFIRMED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          booking.status === 'NO_SHOW' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-600 border-slate-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            booking.status === 'CHECKED_IN' ? 'bg-green-500' :
                            booking.status === 'CONFIRMED' ? 'bg-amber-500' :
                            booking.status === 'NO_SHOW' ? 'bg-red-500' : 'bg-gray-400'
                          }`}></div>
                          {booking.status === 'CONFIRMED' ? 'EXPECTED' : booking.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-8">
                        {booking.checkInTime ? (
                           <div className="space-y-1">
                              <p className="text-xs font-black text-gray-900">Checked-in</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(booking.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </p>
                           </div>
                        ) : (
                           <div className="flex items-center text-xs font-bold text-gray-300 italic">
                              <Clock size={12} className="mr-2" />
                              Awaiting candidate...
                           </div>
                        )}
                      </td>
                      <td className="pl-6 pr-10 py-8 text-right">
                        <div className="flex items-center justify-end space-x-3">
                           {booking.status === 'CONFIRMED' ? (
                              <>
                                 <button 
                                    onClick={() => handleManualCheckIn(booking.id)}
                                    className="h-12 px-5 bg-green-600 text-white rounded-[18px] hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center space-x-2 active:scale-95"
                                    title="Quick Check-in"
                                 >
                                    <CheckCircle2 size={16} strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Check-in</span>
                                 </button>
                                 <button 
                                    onClick={() => handleMarkNoShow(booking.id)}
                                    className="w-12 h-12 bg-red-50 text-red-600 rounded-[18px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center active:scale-95"
                                    title="Mark Absent"
                                 >
                                    <XCircle size={20} />
                                 </button>
                              </>
                           ) : (
                              <div className="h-12 px-5 bg-gray-50 text-gray-400 rounded-[18px] flex items-center space-x-2 border border-slate-200">
                                 <Check size={16} strokeWidth={3} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Finalized</span>
                              </div>
                           )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-32 text-center space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto text-gray-100 shadow-inner">
                   <Search size={48} />
                </div>
                <div className="space-y-2">
                   <p className="text-xl font-black text-gray-900 tracking-tight">No Results Found</p>
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Try adjusting your search for "{search}"</p>
                </div>
                <button onClick={() => setSearch('')} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Clear Filters</button>
             </motion.div>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center px-10 pt-4">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Pulse v3.0 Live Attendance Engine</p>
         <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Operational</span>
         </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Clock, X, Briefcase, MapPin, Calendar, Info, Users, ChevronRight, Save, ArrowLeft, CheckCircle2, RefreshCw, AlertCircle, Edit2, User, Mail, Phone, Trash2, Activity, Link as LinkIcon, QrCode, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/lib/api';

interface GeneratedSlot {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: string;
}

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: string;
}

interface Drive {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  job: { title: string };
  slots: Slot[];
  _count: { slots: number };
}

export default function SlotManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isSlotBookingsOpen, setIsSlotBookingsOpen] = useState(false);
  const [slotBookings, setSlotBookings] = useState<any[]>([]);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(0);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);

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

  const [jobs, setJobs] = useState<any[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState<GeneratedSlot[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    jobId: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    slotType: 'ONE_ON_ONE', // ONE_ON_ONE, GROUP
    slotDuration: '60',
    bufferTime: '15',
    capacity: 1,
    startTime: '09:00',
    endTime: '18:00'
  });

  useEffect(() => {
    fetchDrives();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/active');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/slots/drives');
      setDrives(res.data);
      if (selectedDrive) {
        const updated = res.data.find((d: Drive) => d.id === selectedDrive.id);
        if (updated) setSelectedDrive(updated);
      }
    } catch (err) {
      console.error('Failed to fetch drives', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotBookings = async (slot: Slot) => {
    setSelectedSlot(slot);
    setIsSlotBookingsOpen(true);
    try {
      const res = await api.get(`/slots/slot/${slot.id}/bookings`);
      setSlotBookings(res.data);
      setNewCapacity(slot.capacity);
    } catch (err) {
      console.error('Failed to fetch slot bookings', err);
    }
  };

  const handleUpdateCapacity = async () => {
    if (!selectedSlot) return;
    setIsUpdatingCapacity(true);
    try {
      await api.patch(`/slots/slot/${selectedSlot.id}/capacity`, { capacity: newCapacity });
      setIsEditingCapacity(false);
      // Refresh
      const updatedSlot = { ...selectedSlot, capacity: newCapacity };
      setSelectedSlot(updatedSlot);
      toast.success('Capacity updated');
      fetchDrives();
    } catch (err) {
      toast.error('Failed to update capacity');
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  const handleDeleteDrive = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Hiring Drive',
      description: 'Are you sure you want to delete this drive? All slots and bookings will be permanently removed. This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/slots/drive/${id}`);
          toast.success('Hiring drive deleted');
          setIsDetailOpen(false);
          fetchDrives();
        } catch (err) {
          toast.error('Failed to delete drive');
        }
      }
    });
  };

  const openDriveDetail = async (drive: Drive) => {
    try {
      const res = await api.get(`/slots/public/drive/${drive.id}`);
      setSelectedDrive(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch drive detail', err);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slots: GeneratedSlot[] = [];
    // Use UTC consistently to avoid timezone shifts (e.g. IST shifting back to previous day)
    let currentDay = new Date(formData.startDate + 'T00:00:00Z');
    const endDay = new Date(formData.endDate + 'T00:00:00Z');
    
    if (isNaN(currentDay.getTime()) || isNaN(endDay.getTime())) {
      setError('Invalid start or end date.');
      return;
    }

    if (endDay < currentDay) {
      setError('End date cannot be before start date.');
      return;
    }

    while (currentDay <= endDay) {
      const dateStr = currentDay.toISOString().split('T')[0];
      let [startH, startM] = formData.startTime.split(':').map(Number);
      let [endH, endM] = formData.endTime.split(':').map(Number);
      
      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = parseInt(formData.slotDuration);
      const buffer = parseInt(formData.bufferTime);
      
      while (currentMinutes + duration <= endMinutes) {
        const sH = Math.floor(currentMinutes / 60);
        const sM = currentMinutes % 60;
        const eH = Math.floor((currentMinutes + duration) / 60);
        const eM = (currentMinutes + duration) % 60;
        
        const startTimeStr = `${sH.toString().padStart(2, '0')}:${sM.toString().padStart(2, '0')}`;
        const endTimeStr = `${eH.toString().padStart(2, '0')}:${eM.toString().padStart(2, '0')}`;
        
        slots.push({
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          capacity: formData.capacity,
          booked: 0,
          status: "OPEN"
        });
        
        currentMinutes += duration + buffer;
      }
      
      currentDay.setUTCDate(currentDay.getUTCDate() + 1);
    }

    if (slots.length === 0) {
      setError('No slots could be generated with the given configuration.');
      return;
    }

    setError('');
    setGeneratedSlots(slots);
    setView('preview');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/slots/create-drive', {
        driveData: formData,
        slots: generatedSlots
      });
      
      toast.success('Hiring drive created successfully');
      setIsModalOpen(false);
      setView('form');
      // Reset form
      setFormData({
        name: '',
        jobId: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        slotType: 'ONE_ON_ONE',
        slotDuration: '60',
        bufferTime: '15',
        capacity: 1,
        startTime: '09:00',
        endTime: '18:00'
      });
      setGeneratedSlots([]);
      fetchDrives();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create drive. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const InputLabel = ({ label, required }: { label: string, required?: boolean }) => (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // Group slots by date for preview
  const groupedSlots = generatedSlots.reduce((acc: any, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Group real slots by date
  const groupedRealSlots = selectedDrive?.slots?.reduce((acc: any, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Slot Management</h1>
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
             <input type="text" placeholder="Search drives..." className="w-full pl-9 pr-4 py-2 rounded-xl border-slate-200 bg-gray-50 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>
        <button 
          onClick={() => {
            setView('form');
            setIsModalOpen(true);
            setError('');
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={16} />
          <span>Create Drive</span>
        </button>
      </div>

      {/* Drives Content */}
      {loading && !selectedDrive ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-20 flex flex-col items-center justify-center text-center">
           <RefreshCw className="text-blue-600 animate-spin mb-4" size={32} />
           <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Drives...</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Clock className="text-gray-300" size={40} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">No drives created yet</h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Start managing your interview slots by creating your first hiring drive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div key={drive.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6 space-y-4 cursor-pointer" onClick={() => openDriveDetail(drive)}>
                 <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <Calendar size={20} />
                    </div>
                    <span className="bg-green-50 text-green-600 text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-widest">
                       {drive.status}
                    </span>
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{drive.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-400 mt-1">
                       <Briefcase size={12} />
                       <span className="text-xs font-bold">{drive.job.title}</span>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                       <p className="text-xs font-bold text-gray-700">{drive.location}</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Slots</p>
                       <p className="text-xs font-bold text-gray-700">{drive._count.slots} Generated</p>
                    </div>
                 </div>
              </div>
              <div className="bg-gray-50 p-4 flex flex-wrap gap-2 justify-between items-center border-t border-slate-200">
                 <div className="flex gap-2">
                    <Link 
                       href={`/slots/${drive.id}/live`}
                       className="bg-white p-2 rounded-xl text-blue-600 border border-blue-50 hover:bg-blue-600 hover:text-white transition-all shadow-sm group/btn"
                       title="Live Monitoring"
                    >
                       <Activity size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </Link>
                    <Link 
                       href={`/print-qr/${drive.id}`}
                       target="_blank"
                       className="bg-white p-2 rounded-xl text-purple-600 border border-purple-50 hover:bg-purple-600 hover:text-white transition-all shadow-sm group/btn"
                       title="Print Check-in Poster"
                    >
                       <Printer size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </Link>
                    <button 
                       onClick={() => {
                          const link = `${window.location.origin}/check-in/${drive.id}`;
                          navigator.clipboard.writeText(link);
                          toast.success('Check-in link copied to clipboard');
                       }}
                       className="bg-white p-2 rounded-xl text-amber-600 border border-amber-50 hover:bg-amber-600 hover:text-white transition-all shadow-sm group/btn"
                       title="Copy Check-in Link"
                    >
                       <QrCode size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button 
                       onClick={() => {
                          const link = `${window.location.origin}/book-slot/${drive.id}`;
                          navigator.clipboard.writeText(link);
                          toast.success('Booking link copied to clipboard');
                       }}
                       className="bg-white p-2 rounded-xl text-green-600 border border-green-50 hover:bg-green-600 hover:text-white transition-all shadow-sm group/btn"
                       title="Copy Booking Link"
                    >
                       <LinkIcon size={14} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                 </div>

                 <div className="flex gap-2">
                    <button onClick={() => openDriveDetail(drive)} className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center space-x-1 hover:underline">
                       <span>Manage</span>
                       <ChevronRight size={14} />
                    </button>
                    <button 
                       onClick={(e) => { e.stopPropagation(); handleDeleteDrive(drive.id); }} 
                       className="text-red-600 font-black text-[10px] uppercase tracking-widest flex items-center space-x-1 hover:underline"
                    >
                       <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drive Detail Sidebar / Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedDrive && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-end z-[1000]">
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               className="h-full w-full max-w-4xl bg-white shadow-2xl flex flex-col no-scrollbar"
             >
                <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-gray-50/50">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl"><Calendar size={24}/></div>
                      <div>
                         <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedDrive.name}</h2>
                         <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{selectedDrive.job.title} • {selectedDrive.location}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                   {/* Quick Actions for usability */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link 
                        href={`/slots/${selectedDrive.id}/live`}
                        className="flex items-center justify-between p-6 bg-blue-600 text-white rounded-[32px] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all group"
                      >
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><Activity size={24}/></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Real-time</p>
                               <h3 className="text-lg font-black tracking-tight">Live Monitor</h3>
                            </div>
                         </div>
                         <ChevronRight size={20}/>
                      </Link>
                      <button 
                        onClick={() => {
                           const link = `${window.location.origin}/check-in/${selectedDrive.id}`;
                           navigator.clipboard.writeText(link);
                           toast.success('Check-in link copied!');
                        }}
                        className="flex items-center justify-between p-6 bg-amber-500 text-white rounded-[32px] shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all group"
                      >
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><QrCode size={24}/></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Reception Use</p>
                               <h3 className="text-lg font-black tracking-tight">Copy Check-in Link</h3>
                            </div>
                         </div>
                         <LinkIcon size={20}/>
                      </button>
                      <Link 
                        href={`/slots/${selectedDrive.id}/print-qr`}
                        className="flex items-center justify-between p-6 bg-purple-600 text-white rounded-[32px] shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all group"
                      >
                         <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><Printer size={24}/></div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Printable Poster</p>
                               <h3 className="text-lg font-black tracking-tight">Print Gate QR</h3>
                            </div>
                         </div>
                         <ChevronRight size={20}/>
                      </Link>
                   </div>

                   {groupedRealSlots && Object.keys(groupedRealSlots).sort().map(date => (
                     <div key={date} className="space-y-6">
                        <div className="flex items-center space-x-2">
                           <div className="h-px bg-gray-200 flex-1"></div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                           <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {groupedRealSlots[date].map((slot: Slot) => (
                             <div 
                               key={slot.id} 
                               onClick={() => fetchSlotBookings(slot)}
                               className={`p-5 rounded-[24px] border-2 transition-all cursor-pointer group ${slot.booked >= slot.capacity ? 'border-red-100 bg-red-50/30' : 'border-slate-200 bg-white hover:border-blue-600 shadow-sm hover:shadow-md'}`}
                             >
                                <div className="flex items-center justify-between mb-4">
                                   <div className={`p-2 rounded-xl ${slot.booked >= slot.capacity ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'} transition-colors`}>
                                      <Clock size={16} />
                                   </div>
                                   <div className="flex items-center space-x-2">
                                      <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${slot.booked >= slot.capacity ? 'bg-red-600 text-white' : 'bg-green-50 text-green-600'}`}>
                                         {slot.booked}/{slot.capacity} Booked
                                      </div>
                                   </div>
                                </div>
                                <div className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                   {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">View Attendees <ChevronRight size={10} className="inline ml-1"/></p>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slot Bookings Modal */}
      <AnimatePresence>
        {isSlotBookingsOpen && selectedSlot && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
               className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-200 flex justify-between items-center">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 text-gray-900 rounded-2xl"><Users size={20}/></div>
                      <div>
                         <h3 className="text-xl font-black text-gray-900">Slot Attendees</h3>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {selectedSlot.booked} Booked / {selectedSlot.capacity} Capacity
                         </p>
                      </div>
                   </div>
                   <button onClick={() => setIsSlotBookingsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>

                <div className="p-8 space-y-6">
                   {/* Capacity Management */}
                   <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Edit2 size={18}/></div>
                         <div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Adjust Capacity</p>
                            {isEditingCapacity ? (
                               <input 
                                 autoFocus
                                 type="number" 
                                 className="w-20 bg-white border-2 border-blue-600 rounded-lg px-2 py-1 font-black text-lg mt-1 outline-none" 
                                 value={newCapacity}
                                 onChange={e => setNewCapacity(parseInt(e.target.value) || 0)}
                               />
                            ) : (
                               <p className="text-xl font-black text-gray-900">{selectedSlot.capacity} Total Seats</p>
                            )}
                         </div>
                      </div>
                      {isEditingCapacity ? (
                         <div className="flex space-x-2">
                            <button onClick={() => setIsEditingCapacity(false)} className="px-4 py-2 text-[10px] font-black uppercase text-gray-400">Cancel</button>
                            <button onClick={handleUpdateCapacity} disabled={isUpdatingCapacity} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200">
                               {isUpdatingCapacity ? 'Saving...' : 'Save'}
                            </button>
                         </div>
                      ) : (
                         <button onClick={() => setIsEditingCapacity(true)} className="px-6 py-3 bg-white border border-blue-100 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Change</button>
                      )}
                   </div>

                   <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                      {slotBookings.length === 0 ? (
                         <div className="py-10 text-center space-y-2">
                            <Users size={32} className="mx-auto text-gray-200"/>
                            <p className="text-sm font-bold text-gray-400">No candidates have booked this slot yet.</p>
                         </div>
                      ) : (
                        slotBookings.map((booking: any) => (
                           <div key={booking.id} className="p-4 bg-gray-50 rounded-2xl border border-slate-200 flex items-center justify-between group">
                              <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-black text-blue-600 shadow-sm">{booking.name.charAt(0)}</div>
                                 <div>
                                    <h4 className="text-sm font-black text-gray-900 leading-none mb-1">{booking.name}</h4>
                                    <div className="flex items-center space-x-3 text-[10px] font-bold text-gray-400">
                                       <span className="flex items-center"><Mail size={10} className="mr-1"/> {booking.email}</span>
                                       <span className="flex items-center"><Phone size={10} className="mr-1"/> {booking.mobile}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all" title="View Profile"><User size={14}/></button>
                                 <button onClick={() => {
                                   setConfirmModal({
                                     isOpen: true,
                                     title: 'Remove Booking',
                                     description: `Are you sure you want to remove ${booking.name} from this slot?`,
                                     onConfirm: async () => {
                                       try {
                                         await api.delete(`/slots/booking/${booking.id}`);
                                         toast.success('Booking removed');
                                         fetchSlotBookings(selectedSlot);
                                         fetchDrives();
                                       } catch (err) { toast.error('Failed to remove booking'); }
                                     }
                                   });
                                 }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all" title="Remove Booking"><Trash2 size={14}/></button>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Drive Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-start justify-center z-[1000] p-4 overflow-y-auto pt-10 md:pt-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      {view === 'form' ? 'Create Hiring Drive' : 'Review Generated Slots'}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">
                      {view === 'form' ? 'Configure slots and timing for the interview event.' : `Generated ${generatedSlots.length} slots across ${Object.keys(groupedSlots).length} days.`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {view === 'form' ? (
                <form onSubmit={handleGenerate} className="p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center space-x-2">
                       <AlertCircle size={18} />
                       <span className="text-sm font-bold">{error}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Left Column: Basic Info & Timing */}
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-blue-600 border-b border-blue-50 pb-2">
                          <Info size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Basic Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <InputLabel label="Drive Name" required />
                            <input 
                              required 
                              type="text" 
                              placeholder="e.g. Frontend Developer Drive - May" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20" 
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <InputLabel label="Job Role" required />
                              <div className="relative">
                                <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select 
                                  required 
                                  className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 pl-10 focus:ring-2 focus:ring-blue-500/20"
                                  value={formData.jobId}
                                  onChange={e => setFormData({...formData, jobId: e.target.value})}
                                >
                                  <option value="">Select Job...</option>
                                  {jobs.map(job => (
                                    <option key={job.id} value={job.id}>{job.title}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <InputLabel label="Location" required />
                              <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                  required 
                                  type="text" 
                                  placeholder="Office / Remote" 
                                  className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 pl-10 focus:ring-2 focus:ring-blue-500/20"
                                  value={formData.location}
                                  onChange={e => setFormData({...formData, location: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <InputLabel label="Description" />
                            <textarea 
                              rows={3} 
                              placeholder="Brief details about the drive..." 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-blue-600 border-b border-blue-50 pb-2">
                          <Calendar size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Drive Timing</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <InputLabel label="Start Date" required />
                            <input 
                              required 
                              type="date" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.startDate}
                              onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <InputLabel label="End Date" required />
                            <input 
                              required 
                              type="date" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.endDate}
                              onChange={e => setFormData({...formData, endDate: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Slot Configuration */}
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-blue-600 border-b border-blue-50 pb-2">
                          <Clock size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Slot Configuration</h3>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-1.5">
                            <InputLabel label="Slot Type" required />
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, slotType: 'ONE_ON_ONE', capacity: 1})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${formData.slotType === 'ONE_ON_ONE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                              >
                                <Users size={20} />
                                <span className="text-[10px] font-black uppercase">One-on-One</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({...formData, slotType: 'GROUP'})}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${formData.slotType === 'GROUP' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                              >
                                <Users size={20} />
                                <span className="text-[10px] font-black uppercase">Group Booking</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <InputLabel label="Duration (Mins)" required />
                              <input 
                                required 
                                type="number" 
                                className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                                value={formData.slotDuration}
                                onChange={e => setFormData({...formData, slotDuration: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <InputLabel label="Buffer (Mins)" required />
                              <input 
                                required 
                                type="number" 
                                className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                                value={formData.bufferTime}
                                onChange={e => setFormData({...formData, bufferTime: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <InputLabel label="Capacity per Slot" required />
                            <input 
                              required 
                              disabled={formData.slotType === 'ONE_ON_ONE'}
                              type="number" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.capacity}
                              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-blue-600 border-b border-blue-50 pb-2">
                          <Calendar size={18} />
                          <h3 className="text-xs font-black uppercase tracking-widest">Generation Range</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <InputLabel label="Daily Start Time" required />
                            <input 
                              required 
                              type="time" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.startTime}
                              onChange={e => setFormData({...formData, startTime: e.target.value})}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <InputLabel label="Daily End Time" required />
                            <input 
                              required 
                              type="time" 
                              className="w-full bg-gray-50 border-slate-200 rounded-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                              value={formData.endTime}
                              onChange={e => setFormData({...formData, endTime: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="mt-12 flex items-center justify-end space-x-4 border-t border-gray-50 pt-8">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                    >
                      <span>Generate Slots</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col h-[600px]">
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50 no-scrollbar">
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center space-x-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-bold">{error}</span>
                      </div>
                    )}
                    {Object.keys(groupedSlots).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="p-6 bg-red-50 text-red-500 rounded-full">
                          <Info size={40} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">No slots generated</h3>
                          <p className="text-sm text-gray-400 max-w-xs mx-auto">Please check your configuration. Ensure the daily end time is after the start time and the duration fits within the range.</p>
                        </div>
                        <button 
                          onClick={() => setView('form')}
                          className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                          Back to Configuration
                        </button>
                      </div>
                    ) : (
                      Object.keys(groupedSlots).sort().map(date => (
                        <div key={date} className="space-y-4">
                          <div className="flex items-center space-x-2">
                             <div className="h-px bg-gray-200 flex-1"></div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                             <div className="h-px bg-gray-200 flex-1"></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {groupedSlots[date].map((slot: GeneratedSlot, idx: number) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Clock size={12} />
                                  </div>
                                  <div className="flex items-center space-x-1.5 bg-gray-50 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase">
                                    <Users size={8} />
                                    <span>Cap: {slot.capacity}</span>
                                  </div>
                                </div>
                                <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                  {formData.slotDuration} Mins + {formData.bufferTime}m Buffer
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Preview Footer */}
                  <div className="p-8 border-t border-slate-200 bg-white flex items-center justify-between">
                    <button 
                      onClick={() => setView('form')}
                      disabled={submitting}
                      className="flex items-center space-x-2 text-gray-400 hover:text-gray-900 transition-all"
                    >
                      <ArrowLeft size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Back to Edit</span>
                    </button>
                    
                    <button 
                      onClick={handleConfirm}
                      disabled={generatedSlots.length === 0 || submitting}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                    >
                      {submitting ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      <span>{submitting ? 'Creating Drive...' : 'Confirm & Create Drive'}</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

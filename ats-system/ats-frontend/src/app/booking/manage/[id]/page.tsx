'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Briefcase, User, Mail, Phone, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, XCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

interface Slot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  status: string;
}

interface Booking {
  id: number;
  token: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  slot: {
    id: number;
    startTime: string;
    endTime: string;
    drive: {
      name: string;
      location: string;
      job: { title: string };
      slots: Slot[];
    };
  };
}

export default function ManageBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

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

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/slots/booking/${bookingId}`);
      setBooking(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const isModificationAllowed = () => {
    if (!booking) return false;
    const now = new Date();
    const startTime = new Date(booking.slot.startTime);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return startTime > oneHourFromNow;
  };

  const handleCancel = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Interview',
      description: 'Are you sure you want to cancel this interview? This action cannot be undone.',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.post(`/slots/booking/${bookingId}/cancel`);
          setSuccessMessage('Your booking has been cancelled successfully.');
          fetchBookingDetails();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Cancellation failed.');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;

    setActionLoading(true);
    try {
      await api.post(`/slots/booking/${bookingId}/reschedule`, {
        newSlotId: selectedSlot.id
      });
      setSuccessMessage('Your booking has been rescheduled successfully.');
      setRescheduleMode(false);
      fetchBookingDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Rescheduling failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <RefreshCw className="text-blue-600 animate-spin mb-4" size={40} />
        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Loading booking details...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-200 text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (successMessage && !rescheduleMode) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-200 text-center max-w-md">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-500 font-medium mb-8">{successMessage}</p>
              <button 
                 onClick={() => { setSuccessMessage(''); fetchBookingDetails(); }}
                 className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                 View Booking
              </button>
           </motion.div>
        </div>
     );
  }

  const groupedSlots = booking?.slot.drive.slots.reduce((acc: any, slot) => {
    const dateKey = new Date(slot.startTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 booking?.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 
                 booking?.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                 {booking?.status}
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Briefcase size={12} />
                    <span>{booking?.slot.drive.job.title}</span>
                 </div>
                 <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage your Interview</h1>
                 <p className="text-gray-500 font-medium">Hello {booking?.name}, here are your interview details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-3xl border border-slate-200">
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Calendar size={18} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                          <p className="text-sm font-bold text-gray-900">{new Date(booking!.slot.startTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Clock size={18} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
                          <p className="text-sm font-bold text-gray-900">
                             {new Date(booking!.slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} - {new Date(booking!.slot.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                          </p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <MapPin size={18} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                          <p className="text-sm font-bold text-gray-900">{booking?.slot.drive.location}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <User size={18} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</p>
                          <p className="text-sm font-bold text-gray-900">{booking?.name} ({booking?.email})</p>
                       </div>
                    </div>
                 </div>
              </div>

              {!rescheduleMode && booking?.status === 'CONFIRMED' && (
                 <div className="flex flex-wrap gap-4 pt-4">
                    {isModificationAllowed() ? (
                       <>
                          <button 
                             onClick={() => setRescheduleMode(true)}
                             className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-100"
                          >
                             <RefreshCw size={14} />
                             <span>Reschedule</span>
                          </button>
                          <button 
                             onClick={handleCancel}
                             disabled={actionLoading}
                             className="bg-white text-red-600 border border-red-100 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center space-x-2"
                          >
                             <XCircle size={14} />
                             <span>Cancel Interview</span>
                          </button>
                       </>
                    ) : (
                       <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                          <AlertCircle size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Modification not allowed (within 1 hour of slot)</span>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>

        {/* Reschedule Section */}
        <AnimatePresence>
           {rescheduleMode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-3">
                       <Clock className="text-blue-600" size={20} />
                       <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Select New Slot</h2>
                    </div>
                    <button onClick={() => setRescheduleMode(false)} className="text-gray-400 hover:text-gray-600 flex items-center space-x-1 text-xs font-black uppercase tracking-widest">
                       <ArrowLeft size={14} />
                       <span>Back</span>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-10">
                       {Object.keys(groupedSlots).map((dateKey) => (
                         <div key={dateKey} className="space-y-4">
                            <div className="flex items-center space-x-3">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{dateKey}</span>
                               <div className="h-px bg-gray-200 flex-1"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {groupedSlots[dateKey].map((slot: Slot) => {
                                 const isFull = slot.status !== 'OPEN' || slot.booked >= slot.capacity;
                                 const isSelected = selectedSlot?.id === slot.id;
                                 const isCurrent = slot.id === booking?.slot.id;
                                 
                                 return (
                                   <button
                                     key={slot.id}
                                     disabled={isFull || isCurrent}
                                     onClick={() => setSelectedSlot(slot)}
                                     className={`p-6 rounded-3xl border-2 text-left transition-all ${
                                       isSelected 
                                         ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/5' 
                                         : (isFull || isCurrent)
                                           ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 bg-gray-50' 
                                           : 'border-white bg-white hover:border-blue-100 shadow-sm'
                                     }`}
                                   >
                                      <div className="flex justify-between items-start mb-3">
                                         <div className={`text-sm font-black ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                         </div>
                                         <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                                            isCurrent ? 'bg-blue-100 text-blue-600' :
                                            isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                         }`}>
                                            {isCurrent ? 'Current' : isFull ? 'Full' : `${slot.capacity - slot.booked} Seats Left`}
                                         </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {isCurrent ? 'Your currently booked slot' : 'Select this time'}
                                         </span>
                                         {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                                      </div>
                                   </button>
                                 );
                               })}
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="lg:col-span-1">
                       <div className="sticky top-8">
                          {selectedSlot ? (
                             <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-200 space-y-8">
                                <div>
                                   <h2 className="text-xl font-black text-gray-900 mb-1">Confirm New Slot</h2>
                                   <p className="text-gray-400 text-xs font-medium">Your previous slot will be released.</p>
                                </div>

                                <div className="p-5 bg-blue-50 rounded-3xl space-y-2">
                                   <div className="flex items-center space-x-3 text-blue-600">
                                      <Calendar size={14} />
                                      <span className="text-xs font-black">{new Date(selectedSlot.startTime).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}</span>
                                   </div>
                                   <div className="flex items-center space-x-3 text-blue-600">
                                      <Clock size={14} />
                                      <span className="text-xs font-black">
                                         {new Date(selectedSlot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                      </span>
                                   </div>
                                </div>

                                <button 
                                   disabled={actionLoading}
                                   onClick={handleReschedule}
                                   className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:bg-blue-400"
                                >
                                   {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <ChevronRight size={16} />}
                                   <span>{actionLoading ? 'Updating...' : 'Confirm Reschedule'}</span>
                                </button>
                             </div>
                          ) : (
                             <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-200 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                   <Clock size={32} />
                                </div>
                                <p className="text-sm font-bold text-gray-400">Select a new slot to reschedule.</p>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
        
        <div className="text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Velocity Recruitment System</p>
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

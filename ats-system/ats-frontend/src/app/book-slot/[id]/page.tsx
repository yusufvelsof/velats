'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Briefcase, User, Mail, Phone, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

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
  description: string;
  job: { title: string };
  slots: Slot[];
}

export default function PublicBookingPage() {
  const params = useParams();
  const driveId = params.id;

  const [drive, setDrive] = useState<Drive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('vats_booking_user');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (formData.name || formData.email || formData.mobile) {
      localStorage.setItem('vats_booking_user', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (driveId) {
      fetchDriveDetails();
    }
  }, [driveId]);

  const fetchDriveDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/slots/public/drive/${driveId}`);
      setDrive(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = { name: '', email: '', mobile: '' };
    let isValid = true;

    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }
    if (!formData.mobile) {
      errors.mobile = 'Mobile number is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    if (!validate()) return;

    setBookingStatus('submitting');
    setError('');
    try {
      await api.post('/slots/book', {
        driveId: parseInt(driveId as string),
        slotId: selectedSlot.id,
        ...formData
      });
      setBookingStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setBookingStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-12">
        <div className="space-y-6 w-full max-w-3xl">
           <div className="h-40 bg-gray-200 animate-pulse rounded-[40px]"></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 animate-pulse rounded-[40px]"></div>
              <div className="h-64 bg-gray-200 animate-pulse rounded-[40px]"></div>
           </div>
        </div>
      </div>
    );
  }

  if (error && bookingStatus !== 'success' && !selectedSlot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-12 rounded-[40px] shadow-xl border border-slate-200 text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-black text-gray-900 mb-2">Unavailable</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white p-12 rounded-[50px] shadow-2xl border border-slate-200 text-center max-w-xl w-full"
        >
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <div className="relative w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-200">
              <Check size={48} strokeWidth={4} />
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Booking Confirmed!</h2>
          <p className="text-gray-500 font-medium mb-10 text-lg leading-relaxed">
            Awesome! Your interview for <span className="text-blue-600 font-bold">{drive?.job.title}</span> is scheduled.
          </p>
          
          <div className="bg-gray-50 p-8 rounded-[32px] text-left space-y-5 mb-10 border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Date</p>
                 <p className="text-base font-bold text-gray-800">{new Date(selectedSlot!.startTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot</p>
                 <p className="text-base font-bold text-gray-800">
                    {new Date(selectedSlot!.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} - {new Date(selectedSlot!.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                 </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location / Venue</p>
                 <p className="text-base font-bold text-gray-800">{drive?.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl mb-10">
             <div className="flex items-center space-x-3 text-blue-700">
                <Mail size={18} />
                <p className="text-sm font-bold">Check your email for full details and calendar invite.</p>
             </div>
          </div>

          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-50">Velocity ATS</p>
        </motion.div>
      </div>
    );
  }

  const groupedSlots = drive?.slots.reduce((acc: any, slot) => {
    const dateKey = new Date(slot.startTime).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-10 md:p-14 rounded-[50px] shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-5">
               <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">
                  <Briefcase size={14} className="mr-1" />
                  <span>{drive?.job.title}</span>
               </div>
               <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">{drive?.name}</h1>
               <div className="flex flex-wrap gap-6 items-center text-gray-500 font-bold">
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl">
                    <MapPin size={18} className="text-blue-600" />
                    <span>{drive?.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-2xl">
                    <Calendar size={18} className="text-blue-600" />
                    <span>Multiple slots available</span>
                  </div>
               </div>
            </div>
            <div className="hidden md:block">
               <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center border border-slate-200 shadow-inner">
                  <Calendar size={56} className="text-blue-600 opacity-20" />
               </div>
            </div>
          </div>
          {drive?.description && (
            <div className="mt-10 pt-10 border-t border-gray-50">
              <p className="text-gray-500 font-medium leading-relaxed max-w-4xl text-lg">
                {drive.description}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Slot Selection */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                       <Clock size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Select your Slot</h2>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                       <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                       <span className="text-[10px] font-black text-gray-400 uppercase">Available</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                       <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                       <span className="text-[10px] font-black text-gray-400 uppercase">Full</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-12">
                 {Object.keys(groupedSlots).map((dateKey, dateIdx) => (
                   <motion.div 
                     key={dateKey} 
                     initial={{ opacity: 0, x: -20 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     transition={{ delay: dateIdx * 0.1 }}
                     className="space-y-6"
                   >
                      <div className="flex items-center space-x-4 px-2">
                         <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] whitespace-nowrap">{dateKey}</span>
                         <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         {groupedSlots[dateKey].map((slot: Slot) => {
                           const isFull = slot.status !== 'OPEN' || slot.booked >= slot.capacity;
                           const isSelected = selectedSlot?.id === slot.id;
                           
                           return (
                             <button
                               key={slot.id}
                               disabled={isFull}
                               onClick={() => setSelectedSlot(slot)}
                               className={`group relative p-8 rounded-[36px] border-4 text-left transition-all duration-300 ${
                                 isSelected 
                                   ? 'border-blue-600 bg-blue-50/50 shadow-2xl shadow-blue-100 -translate-y-1' 
                                   : isFull 
                                     ? 'opacity-40 grayscale cursor-not-allowed border-slate-200 bg-gray-50' 
                                     : 'border-white bg-white hover:border-blue-200 shadow-sm hover:shadow-md'
                               }`}
                             >
                                {isSelected && (
                                   <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                                      <Check size={16} strokeWidth={4} />
                                   </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                   <div className="space-y-1">
                                      <div className={`text-2xl font-black tracking-tight ${isSelected ? 'text-blue-700' : isFull ? 'text-gray-400' : 'text-gray-900'}`}>
                                         {new Date(slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                      </div>
                                      <div className={`text-xs font-bold ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                                         Ends at {new Date(slot.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                      </div>
                                   </div>
                                   <div className={`px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                                      isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                   }`}>
                                      {isFull ? 'Full' : `${slot.capacity - slot.booked} Seats`}
                                   </div>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`}>
                                      {isSelected ? 'Selected Slot' : isFull ? 'No Vacancy' : 'Reserve Slot'}
                                   </span>
                                </div>
                             </button>
                           );
                         })}
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>

           {/* Booking Form Sidebar */}
           <div className="lg:col-span-1">
              <div className="sticky top-12">
                 <AnimatePresence mode="wait">
                    {selectedSlot ? (
                       <motion.div 
                         key="form"
                         initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                         animate={{ opacity: 1, scale: 1, y: 0 }} 
                         exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                         className="bg-white p-10 rounded-[50px] shadow-2xl border border-slate-200 space-y-10"
                       >
                          <div className="space-y-2">
                             <div className="flex items-center space-x-2 text-blue-600 mb-1">
                                <CheckCircle2 size={18} />
                                <h2 className="text-2xl font-black tracking-tight">Final Step</h2>
                             </div>
                             <p className="text-gray-400 text-sm font-medium">Verify your selection and enter details.</p>
                          </div>

                          <div className="p-6 bg-blue-50 rounded-[32px] space-y-4 border border-blue-100">
                             <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                   <Calendar size={18} className="text-blue-600" />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Date</p>
                                   <p className="text-sm font-black text-blue-900">{new Date(selectedSlot.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
                                </div>
                             </div>
                             <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                   <Clock size={18} className="text-blue-600" />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Time</p>
                                   <p className="text-sm font-black text-blue-900">
                                      {new Date(selectedSlot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <form onSubmit={handleBooking} className="space-y-6">
                             {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center space-x-2">
                                   <AlertCircle size={18} />
                                   <span className="text-xs font-bold">{error}</span>
                                </div>
                             )}

                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                   <User size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 ${validationErrors.name ? 'text-red-300' : 'text-gray-300'}`} />
                                   <input 
                                      required 
                                      type="text" 
                                      placeholder="John Doe" 
                                      className={`w-full pl-12 h-14 bg-gray-50 border-2 rounded-[20px] text-sm font-black transition-all ${validationErrors.name ? 'border-red-100 focus:border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                      value={formData.name} 
                                      onChange={e => setFormData({...formData, name: e.target.value})} 
                                   />
                                </div>
                                {validationErrors.name && <p className="text-[10px] font-bold text-red-500 ml-1">{validationErrors.name}</p>}
                             </div>

                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                   <Mail size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 ${validationErrors.email ? 'text-red-300' : 'text-gray-300'}`} />
                                   <input 
                                      required 
                                      type="email" 
                                      placeholder="john@example.com" 
                                      className={`w-full pl-12 h-14 bg-gray-50 border-2 rounded-[20px] text-sm font-black transition-all ${validationErrors.email ? 'border-red-100 focus:border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                      value={formData.email} 
                                      onChange={e => setFormData({...formData, email: e.target.value})} 
                                   />
                                </div>
                                {validationErrors.email && <p className="text-[10px] font-bold text-red-500 ml-1">{validationErrors.email}</p>}
                             </div>

                             <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <div className="relative">
                                   <Phone size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 ${validationErrors.mobile ? 'text-red-300' : 'text-gray-300'}`} />
                                   <input 
                                      required 
                                      type="tel" 
                                      placeholder="+91 98765 43210" 
                                      className={`w-full pl-12 h-14 bg-gray-50 border-2 rounded-[20px] text-sm font-black transition-all ${validationErrors.mobile ? 'border-red-100 focus:border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                                      value={formData.mobile} 
                                      onChange={e => setFormData({...formData, mobile: e.target.value})} 
                                   />
                                </div>
                                {validationErrors.mobile && <p className="text-[10px] font-bold text-red-500 ml-1">{validationErrors.mobile}</p>}
                             </div>

                             <button 
                               disabled={bookingStatus === 'submitting'}
                               className="w-full bg-blue-600 text-white h-16 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:bg-blue-400 group"
                             >
                                {bookingStatus === 'submitting' ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />}
                                <span>{bookingStatus === 'submitting' ? 'Booking your Slot...' : 'Confirm My Slot'}</span>
                             </button>
                             <p className="text-[10px] text-center text-gray-400 font-bold px-4 leading-relaxed">By confirming, you agree to receive interview related updates via email/SMS.</p>
                          </form>
                       </motion.div>
                    ) : (
                       <motion.div 
                          key="empty"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          className="bg-white p-14 rounded-[50px] shadow-sm border border-slate-200 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]"
                       >
                          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 shadow-inner">
                             <Clock size={48} />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Select a Slot</h3>
                             <p className="text-sm font-medium text-gray-400 max-w-[200px] mx-auto leading-relaxed">Please choose an available interview time on the left to continue.</p>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

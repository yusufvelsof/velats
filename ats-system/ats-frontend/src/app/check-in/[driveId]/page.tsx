'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, MapPin, Briefcase, Calendar, Clock, LogIn, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function CheckInPage() {
  const params = useParams();
  const driveId = params.driveId;

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Auto-get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Location access denied')
      );
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/slots/check-in/verify', {
        driveId: parseInt(driveId as string),
        identifier
      });
      setBooking(res.data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/slots/check-in/confirm', {
        bookingId: booking.id,
        token: booking.checkInToken,
        location // Sending location for distance validation
      });
      setBooking(res.data); // Update with full checked-in data
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${
            step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-white text-gray-300 border border-slate-200'
          }`}>
            {step > s ? <Check size={16} strokeWidth={4} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-500 ${
              step > s ? 'bg-blue-600' : 'bg-gray-100'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        
        {step < 3 && <StepIndicator />}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -30 }} 
              className="bg-white p-12 rounded-[50px] shadow-2xl border border-slate-200 space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <LogIn size={40} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back!</h1>
                <p className="text-gray-400 text-base font-medium max-w-xs mx-auto">Please identify yourself using your registered email or mobile number.</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-8">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Mobile</label>
                  <div className="relative">
                    <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input 
                      required 
                      disabled={loading}
                      type="text" 
                      placeholder="e.g. john@example.com" 
                      className="w-full pl-14 bg-gray-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-3xl text-sm font-black h-16 transition-all" 
                      value={identifier} 
                      onChange={e => setIdentifier(e.target.value)} 
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center space-x-3 text-red-600 bg-red-50 p-5 rounded-3xl border border-red-100">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-bold leading-tight">{error}</span>
                  </motion.div>
                )}

                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white h-16 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:bg-blue-400"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <ChevronRight size={20} strokeWidth={3} />}
                  <span>{loading ? 'Verifying...' : 'Continue to Check-in'}</span>
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && booking && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -30 }} 
              className="bg-white p-12 rounded-[50px] shadow-2xl border border-slate-200 space-y-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Confirm Arrival</h1>
                <p className="text-gray-400 text-base font-medium">Is this you? Please confirm your details.</p>
              </div>

              <div className="space-y-6">
                 <div className="bg-gray-50 p-8 rounded-[40px] space-y-6 border border-slate-200 shadow-inner">
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <User size={22} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Candidate Name</p>
                          <p className="text-lg font-black text-gray-900 leading-none">{booking.name}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Briefcase size={22} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Applying For</p>
                          <p className="text-lg font-black text-gray-900 leading-none">{booking.slot.drive.job.title}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Clock size={22} className="text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Scheduled Slot</p>
                          <p className="text-lg font-black text-gray-900 leading-none">
                             {new Date(booking.slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-start space-x-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                    <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                       We use your location to confirm arrival at the venue. Please ensure GPS is enabled.
                    </p>
                 </div>

                 {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center space-x-3 text-red-600 bg-red-50 p-5 rounded-3xl border border-red-100">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-bold leading-tight">{error}</span>
                  </motion.div>
                )}

                 <div className="flex flex-col space-y-4 pt-4">
                    <button 
                      onClick={handleConfirm}
                      disabled={loading}
                      className="w-full bg-green-600 text-white h-16 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:bg-green-400"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} strokeWidth={3} />}
                      <span>{loading ? 'Confirming Arrival...' : 'Confirm & Check-in'}</span>
                    </button>
                    <button 
                      disabled={loading}
                      onClick={() => setStep(1)}
                      className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors py-2 text-center"
                    >
                      Wrong Person? Go Back
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white p-14 rounded-[60px] shadow-2xl border border-slate-200 text-center space-y-10"
            >
               <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-green-100 rounded-[36px] animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-green-500 text-white rounded-[36px] flex items-center justify-center mx-auto shadow-xl shadow-green-200">
                     <CheckCircle2 size={48} strokeWidth={3} />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Checked In!</h1>
                  <p className="text-gray-500 font-medium text-lg leading-relaxed px-4">
                     Welcome, <span className="text-blue-600 font-black">{booking.name}</span>!
                  </p>
               </div>

               <div className="bg-gray-900 p-10 rounded-[40px] shadow-2xl space-y-4 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={100} className="text-white"/></div>
                  <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em]">Your Registration ID</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter">{booking.walkinIdSequence}</h2>
                  <div className="h-px bg-white/10 w-20 mx-auto my-6"></div>
                  <p className="text-sm font-bold text-gray-300">
                     Interview Slot: <span className="text-white">{new Date(booking.slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
                  </p>
               </div>

               <div className="bg-gray-50 p-8 rounded-[40px] border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600 justify-center">
                     <Info size={18} className="text-blue-600" />
                     <p className="text-sm font-bold">Please proceed to the <span className="text-gray-900">Waiting Area</span>.</p>
                  </div>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                     Our team will call your ID <span className="font-bold text-gray-600">{booking.walkinIdSequence}</span> for the <span className="font-bold text-gray-600">{booking.slot.drive.job.title}</span> interview shortly.
                  </p>
               </div>

               <div className="pt-4">
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em]">Velocity Recruitment</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

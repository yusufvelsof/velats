'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Download, MapPin, Calendar, Briefcase } from 'lucide-react';
import api from '@/lib/api';

export default function PrintQRPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.id;
  
  const [drive, setDrive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkInUrl, setCheckInUrl] = useState('');

  useEffect(() => {
    if (driveId) {
      fetchDrive();
      setCheckInUrl(`${window.location.origin}/check-in/${driveId}`);
    }
  }, [driveId]);

  const fetchDrive = async () => {
    try {
      const res = await api.get(`/slots/public/drive/${driveId}`);
      setDrive(res.data);
    } catch (err) {
      console.error('Failed to fetch drive', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Drive Not Found</h1>
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Control Bar - Hidden during print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
           <button 
             onClick={() => router.back()}
             className="p-2 hover:bg-gray-100 rounded-xl transition-all"
           >
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-lg font-black text-gray-900">Print Check-in Poster</h1>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={handlePrint}
             className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
           >
             <Printer size={16} />
             <span>Print Poster</span>
           </button>
        </div>
      </div>

      {/* Poster Canvas */}
      <div className="flex justify-center p-0 md:p-12">
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:m-0 flex flex-col items-center p-16 relative overflow-hidden">
          
          {/* Header Decorations */}
          <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
          
          {/* Company Branding */}
          <div className="text-center mb-16 mt-8">
             <img src="/velocity-logo.png" alt="Velocity Logo" className="h-16 mx-auto mb-6" />
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.5em] mb-2">Welcome to</p>
             <h2 className="text-2xl font-black text-gray-900">Velocity Software Solutions</h2>
          </div>

          {/* Drive Header */}
          <div className="w-full bg-gray-50 rounded-[40px] p-12 text-center mb-16 border border-slate-200">
             <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest mb-6">
                <Briefcase size={14} className="mr-1" />
                <span>{drive.job.title}</span>
             </div>
             <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight uppercase">
                {drive.name}
             </h1>
             <div className="flex items-center justify-center space-x-8 text-gray-500 font-bold">
                <div className="flex items-center space-x-2">
                   <MapPin size={20} className="text-blue-600" />
                   <span className="text-lg">{drive.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                   <Calendar size={20} className="text-blue-600" />
                   <span className="text-lg">{new Date(drive.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
             </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-10 flex-1">
             <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900">SCAN TO CHECK-IN</h3>
                <p className="text-gray-400 font-bold text-lg uppercase tracking-widest">Please scan this code to confirm your arrival</p>
             </div>

             <div className="p-10 bg-white border-[12px] border-blue-600 rounded-[60px] shadow-2xl shadow-blue-50 relative">
                <QRCodeSVG 
                  value={checkInUrl} 
                  size={350}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/logo.png",
                    x: undefined,
                    y: undefined,
                    height: 60,
                    width: 60,
                    excavate: true,
                  }}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">
                   Secure Entry
                </div>
             </div>

             <div className="text-center space-y-4 max-w-md pt-6">
                <div className="flex items-center justify-center space-x-4">
                   <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400">1</div>
                   <p className="text-left text-gray-600 font-bold">Open your phone camera or QR scanner</p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                   <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400">2</div>
                   <p className="text-left text-gray-600 font-bold">Scan the code and enter your email/mobile</p>
                </div>
                <div className="flex items-center justify-center space-x-4">
                   <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400">3</div>
                   <p className="text-left text-gray-600 font-bold">Receive your Registration ID & Wait for your turn</p>
                </div>
             </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-16 pt-12 border-t border-slate-200 w-full text-center">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em]">Powered by Velocity ATS</p>
          </div>
          
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600 opacity-5 -mr-16 -mb-16 rounded-full"></div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, MapPin, Calendar, Briefcase, Globe } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
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
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white print:p-0 print:m-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }
          .poster-canvas {
            height: 297mm !important;
            width: 210mm !important;
            padding: 10mm 15mm !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
          }
          .print-compact {
            margin-bottom: 0.5rem !important;
          }
          .print-qr-size {
            width: 280px !important;
            height: 280px !important;
          }
        }
      `}</style>

      {/* Control Bar - Hidden during print */}
      <div className="print:hidden bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
           <button 
             onClick={() => router.back()}
             className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm"
           >
             <ArrowLeft size={18} />
             <span>Back to Management</span>
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
        <div className="poster-canvas bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:m-0 flex flex-col items-center p-16 relative overflow-hidden text-center">
          
          {/* Header Decorations - Hidden during print */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 print:hidden"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 opacity-50 print:hidden"></div>
          
          {/* 1. Logo */}
          <div className="mb-4 relative z-10 print-compact">
             <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain mx-auto" />
          </div>

          {/* 2. Badge/Label */}
          <div className="mb-6 print-compact">
             <span className="bg-blue-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200">
                Candidate Check-in
             </span>
          </div>

          {/* 3. Drive Details */}
          <div className="w-full mb-8 relative z-10 print-compact">
             <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight uppercase">
                {drive.name}
             </h1>
             
             <div className="flex flex-col items-center space-y-3">
                <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-1.5 rounded-2xl text-[12px] font-black uppercase tracking-widest">
                   <Briefcase size={14} className="text-blue-600" />
                   <span>{drive.job.title}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-6 text-gray-500 font-bold">
                   <div className="flex items-center space-x-2">
                      <MapPin size={18} className="text-blue-600" />
                      <span className="text-base">{drive.location}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <Calendar size={18} className="text-blue-600" />
                      <span className="text-base">{new Date(drive.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* 4. QR Code Section */}
          <div className="flex flex-col items-center space-y-6 flex-1 relative z-10 justify-center">
             <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">SCAN TO CHECK-IN</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Confirm your arrival instantly</p>
             </div>

             <div className="p-8 bg-white border-[1px] border-slate-200 rounded-[50px] shadow-[0_15px_40px_rgba(0,0,0,0.08)] relative">
                <div className="print-qr-size flex items-center justify-center">
                  <QRCodeSVG 
                    value={checkInUrl} 
                    size={280}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/logo.png",
                      x: undefined,
                      y: undefined,
                      height: 70,
                      width: 70,
                      excavate: true,
                    }}
                  />
                </div>
             </div>

             {/* 5. Stepwise Instructions */}
             <div className="w-full max-w-sm space-y-3">
                {[
                  { id: 1, text: "Open your phone camera or QR scanner app" },
                  { id: 2, text: "Scan the code and enter your email or mobile" },
                  { id: 3, text: "Receive Registration ID & wait for your turn" }
                ].map(step => (
                   <div key={step.id} className="flex items-center space-x-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm">{step.id}</div>
                      <p className="text-left text-gray-700 font-bold text-[12px] leading-tight">{step.text}</p>
                   </div>
                ))}
             </div>
          </div>

          {/* 6. Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 w-full flex justify-between items-end text-left relative z-10">
             <div className="space-y-1">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Powered by</p>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Velocity Software Solutions Pvt. Ltd.</h4>
             </div>
             <div className="text-right space-y-1">
                <div className="flex items-center justify-end space-x-2 text-gray-400">
                   <Globe size={12} />
                   <span className="text-[9px] font-bold">www.velsof.com</span>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Printer as PrinterIcon, 
  Copy, 
  CheckCircle2, 
  Globe,
  QrCode
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRPosterPage() {
  const { campaignId } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/walkins/campaign/${campaignId}`)
      .then(res => setCampaign(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const copyLink = () => {
    const url = `${window.location.origin}/walkin/register/${campaignId}`;
    navigator.clipboard.writeText(url);
    alert('Registration link copied!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 print:bg-white print:p-0 print:m-0">
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
          }
          #poster-canvas {
            height: 100vh !important;
            width: 100vw !important;
            max-width: none !important;
            min-height: 0 !important;
            border: none !important;
            padding: 2rem !important;
            margin: 0 !important;
            justify-content: center !important;
          }
        }
      `}</style>
      {/* Top Utility Bar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors font-bold text-sm"
        >
          <ChevronLeft size={18} />
          <span>Back to Management</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={copyLink}
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 shadow-sm transition-all active:scale-95"
            title="Copy Link"
          >
            <Copy size={20} />
          </button>
          <button 
            onClick={() => window.print()}
            className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            title="Print Poster"
          >
            <PrinterIcon size={20} />
          </button>
        </div>
      </div>

      {/* Main Poster Content (A4 Proportions) */}
      <div 
        id="poster-canvas"
        className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none border border-slate-200 print:border-none flex flex-col items-center py-12 px-12 text-center relative overflow-hidden"
      >
        {/* Background Decor for Digital View */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 print:hidden"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 opacity-50 print:hidden"></div>

        {/* 1. Logo */}
        <div className="mb-2 relative z-10">
           <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain" />
        </div>

        {/* 2. Walk-in Label */}
        <div className="mb-6">
           <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200">
             Walk-in Drive
           </span>
        </div>

        {/* 4. Campaign Title */}
        <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight mb-2 max-w-2xl">
          {campaign?.title}
        </h1>

        {/* 5. Scan to Register */}
        <div className="mb-10 flex flex-col items-center">
           <p className="text-lg font-bold text-gray-400 uppercase tracking-[0.4em] mb-2">Scan to Register</p>
           <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
        </div>

        {/* 6. QR Code Area */}
        <div className="bg-white p-12 rounded-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-50 mb-10 relative z-10">            <QRCodeCanvas 
              value={`${window.location.origin}/walkin/register/${campaignId}`}
              size={320}
              level={"H"}
              includeMargin={false}
            />
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-8 border-t border-slate-200 w-full flex justify-between items-end text-left">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Powered by</p>
              <h4 className="text-base font-black uppercase tracking-widest text-gray-900">Velocity Software Solutions Pvt. Ltd.</h4>
           </div>
           <div className="text-right space-y-2">
              <div className="flex items-center justify-end space-x-2 text-gray-400">
                 <Globe size={14} />
                 <span className="text-[10px] font-bold">www.velsof.com</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

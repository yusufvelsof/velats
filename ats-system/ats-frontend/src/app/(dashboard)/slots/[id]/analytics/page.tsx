'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  BarChart3, PieChart, TrendingUp, Users, CheckCircle2, 
  XCircle, Clock, Calendar, Download, ArrowLeft, Briefcase, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function DriveAnalyticsPage() {
  const params = useParams();
  const driveId = params.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/slots/analytics/${driveId}`);
        setData(res.data);
      } catch (err: any) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driveId]);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Slot Time', 'Capacity', 'Booked', 'Checked-In', 'No-Show'];
    const rows = data.slotBreakdown.map((s: any) => [
      s.time, s.capacity, s.booked, s.checkedIn, s.noShow
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `drive_analytics_${driveId}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center space-y-4">
      <TrendingUp className="animate-spin text-blue-600" size={40} />
      <p className="text-sm font-black uppercase tracking-widest text-gray-400">Crunching Numbers...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <div className="space-y-2">
           <div className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">
              <BarChart3 size={14} className="mr-2" />
              Drive Performance
           </div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">{data.drive.name}</h1>
           <div className="flex items-center space-x-4 text-gray-400 text-sm font-bold">
              <span className="flex items-center"><Briefcase size={14} className="mr-1" /> {data.drive.job.title}</span>
              <span className="flex items-center"><MapPin size={14} className="mr-1" /> {data.drive.location}</span>
           </div>
        </div>
        <button 
          onClick={exportCSV}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
        >
          <Download size={14} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Slots', value: data.summary.totalSlots, icon: Calendar, color: 'gray' },
          { label: 'Total Capacity', value: data.summary.totalCapacity, icon: Users, color: 'blue' },
          { label: 'Total Booked', value: data.summary.totalBooked, icon: CheckCircle2, color: 'indigo' },
          { label: 'Checked In', value: data.summary.totalCheckedIn, icon: TrendingUp, color: 'green' },
          { label: 'No Shows', value: data.summary.totalNoShow, icon: XCircle, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
             <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Performance Metrics */}
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Performance Metrics</h2>
            
            <div className="space-y-10">
               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Show Rate</p>
                        <h4 className="text-3xl font-black text-green-600">{data.summary.showRate.toFixed(1)}%</h4>
                     </div>
                     <span className="text-xs font-bold text-gray-400">Target: 80%</span>
                  </div>
                  <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${data.summary.showRate}%` }} className="h-full bg-green-500 rounded-full shadow-lg shadow-green-100" />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">No-Show Rate</p>
                        <h4 className="text-3xl font-black text-red-600">{data.summary.noShowRate.toFixed(1)}%</h4>
                     </div>
                     <span className="text-xs font-bold text-gray-400">Max Allowed: 15%</span>
                  </div>
                  <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${data.summary.noShowRate}%` }} className="h-full bg-red-500 rounded-full shadow-lg shadow-red-100" />
                  </div>
               </div>
            </div>
         </div>

         {/* Source Performance */}
         <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 space-y-8">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Candidate Sources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {Object.entries(data.sourceStats).map(([source, count]: [any, any], i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                     <span className="text-sm font-bold text-gray-600">{source}</span>
                     <span className="px-3 py-1 bg-white rounded-lg text-xs font-black text-blue-600 shadow-sm">{count}</span>
                  </div>
               ))}
               {Object.keys(data.sourceStats).length === 0 && (
                  <p className="col-span-2 text-center text-sm font-bold text-gray-300 py-10">No source data available</p>
               )}
            </div>
         </div>
      </div>

      {/* Slot Breakdown Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-gray-50">
           <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Slot-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Capacity</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Booked</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Checked-In</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">No-Show</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fill Rate</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {data.slotBreakdown.map((slot: any, i: number) => {
                    const fillRate = (slot.booked / slot.capacity) * 100;
                    return (
                       <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center text-sm font-black text-gray-900">
                                <Clock size={14} className="mr-2 text-blue-600" />
                                {slot.time}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center text-sm font-bold text-gray-500">{slot.capacity}</td>
                          <td className="px-8 py-6 text-center text-sm font-bold text-gray-900">{slot.booked}</td>
                          <td className="px-8 py-6 text-center">
                             <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black">{slot.checkedIn}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black">{slot.noShow}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end space-x-2">
                                <span className="text-sm font-black text-gray-900">{fillRate.toFixed(0)}%</span>
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-500" style={{ width: `${fillRate}%` }} />
                                </div>
                             </div>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  ChevronLeft, Search, User, Mail, Phone, GraduationCap, Briefcase, FileText, CheckCircle2, X, Trophy, FileBadge, Printer as PrinterIcon, Zap, Save, CheckSquare, Square, Ban, MapPin, Award, Globe, ListFilter, Send, Download
} from 'lucide-react';

export default function CampaignRegistrationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);

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
  
  // Global Server Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Excel-style Multi-select Filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [isMarkingOpen, setIsMarkingOpen] = useState(false);
  const [isPaperOpen, setIsPaperOpen] = useState(false);
  const [isCampaignEditOpen, setIsCampaignEditOpen] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('');

  const [marks, setMarks] = useState({ aptitude: 0, tech: 0, shortlisted: false });
  const [paperForm, setPaperForm] = useState({ aptitudePaper: '', codingPaper: '', dbPaper: '', projectTask: '' });

  const [isDriveSelectOpen, setIsDriveSelectOpen] = useState(false);
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);
  const [isSendingLinks, setIsSendingLinks] = useState(false);

  const fetchRegistrations = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (dateFrom) query.append('dateFrom', dateFrom);
      if (dateTo) query.append('dateTo', dateTo);

      const [campRes, regRes, driveRes, userRes] = await Promise.all([
        api.get(`/walkins/campaign/${id}`),
        api.get(`/walkins/registrations/${id}?${query.toString()}`),
        api.get('/slots/drives'),
        api.get('/users/me')
      ]);
      setCampaign(campRes.data);
      setNewCampaignTitle(campRes.data.title);
      setRegistrations(regRes.data);
      setDrives(driveRes.data);
      setUser(userRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSendBookingLinks = async () => {
    if (!selectedDriveId || selectedIds.length === 0) return;
    setIsSendingLinks(true);
    try {
      await api.post('/walkins/bulk-send-booking', {
        registrationIds: selectedIds,
        driveId: selectedDriveId
      });
      toast.success(`Successfully sent booking links to ${selectedIds.length} candidates.`);
      setIsDriveSelectOpen(false);
      setSelectedIds([]);
      fetchRegistrations();
    } catch (err) {
      toast.error('Failed to send booking links');
    } finally {
      setIsSendingLinks(false);
    }
  };

  const exportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx');
    
    const exportData = filteredData.map(reg => ({
      'Name': reg.name,
      'Email': reg.email,
      'Mobile': reg.mobile,
      'Status': reg.status,
      'Attendance': reg.slotBookings?.[0]?.attendanceStatus || 'PENDING',
      'Current State': reg.currentState || '-',
      'Current City': reg.currentCity || '-',
      'Hometown State': reg.hometownState || '-',
      'Hometown City': reg.hometownCity || '-',
      'Total Marks': reg.totalMarks,
      'Aptitude Marks': reg.aptitudeMarks,
      'Tech Marks': reg.techMarks,
      '10th %': reg.tenthPercentage,
      '12th %': reg.twelfthPercentage,
      'Graduation': reg.graduationDegree,
      'Graduation College': reg.graduationCollege,
      'Experience': reg.experienceDuration,
      'Technologies': reg.technologies,
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Registrations");
    writeFile(wb, `${campaign.title}_Registrations.xlsx`);
  };

  const handleUpdateCampaign = async () => {
    try {
      await api.patch(`/walkins/campaign/${id}`, { title: newCampaignTitle });
      toast.success('Campaign title updated');
      setIsCampaignEditOpen(false);
      fetchRegistrations();
    } catch (err) { toast.error('Failed to update campaign'); }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchRegistrations(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [id, search, statusFilter, dateFrom, dateTo]);

  // Unified Excel Filtering Logic
  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        // Handle special keys like attendance
        if (key === 'attendance') {
          const att = reg.slotBookings?.[0]?.attendanceStatus || 'PENDING';
          return selectedValues.includes(att);
        }
        return selectedValues.includes(String(reg[key] || '-'));
      });
    });
  }, [registrations, activeFilters]);

  // Extract unique values for a column
  const getUniqueValues = (colId: string) => {
    if (colId === 'attendance') {
      return ['PENDING', 'PRESENT', 'ABSENT'];
    }
    const values = registrations.map(r => String(r[colId] || '-'));
    return Array.from(new Set(values)).sort();
  };

  const handleFilterToggle = (colId: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[colId] || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [colId]: updated };
    });
  };

  const clearColumnFilter = (colId: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      delete next[colId];
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) setSelectedIds([]);
    else setSelectedIds(filteredData.map(r => r.id));
  };

  const toggleSelect = (regId: number) => {
    setSelectedIds(prev => prev.includes(regId) ? prev.filter(i => i !== regId) : [...prev, regId]);
  };

  const updateMarksInline = async (regId: number, field: 'aptitude' | 'tech' | 'paperSet', value: string) => {
    const reg = registrations.find(r => r.id === regId);
    if (!reg) return;

    const updatedApti = field === 'aptitude' ? (parseInt(value) || 0) : reg.aptitudeMarks;
    const updatedTech = field === 'tech' ? (parseInt(value) || 0) : reg.techMarks;
    const updatedPaper = field === 'paperSet' ? value : reg.aptitudePaperSet;
    
    setRegistrations(prev => prev.map(r => r.id === regId ? { 
      ...r, 
      aptitudeMarks: updatedApti, 
      techMarks: updatedTech,
      aptitudePaperSet: updatedPaper,
      totalMarks: updatedApti + updatedTech
    } : r));

    try {
      await api.patch(`/walkins/aptitude/${regId}`, {
        aptitudeMarks: updatedApti,
        techMarks: updatedTech,
        aptitudePaperSet: updatedPaper,
        isShortlistedAptitude: reg.isShortlistedAptitude
      });
    } catch (err) {
      console.error('Failed to sync assessment', err);
      fetchRegistrations();
    }
  };

  const handleBulkAction = async (action: string, data?: any, overrideIds?: number[]) => {
    const targetIds = overrideIds || selectedIds;
    if (targetIds.length === 0) return;

    if (action === 'DELETE') {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Registrations',
        description: `Are you sure you want to delete ${targetIds.length} registration(s)? This action cannot be undone.`,
        onConfirm: async () => {
          try {
            if (targetIds.length === 1) {
              await api.delete(`/walkins/registration/${targetIds[0]}`);
            } else {
              await api.post('/walkins/bulk-update', { ids: targetIds, action, data });
            }
            toast.success(`${targetIds.length} registration(s) deleted`);
            if (!overrideIds) setSelectedIds([]); 
            fetchRegistrations();
          } catch (err) { toast.error('Action failed'); }
        }
      });
      return;
    }

    try {
      await api.post('/walkins/bulk-update', { ids: targetIds, action, data });
      toast.success('Action completed successfully');
      if (!overrideIds) setSelectedIds([]); 
      fetchRegistrations();
    } catch (err) { toast.error('Action failed'); }
  };

  const openMarkingModal = (reg: any) => {
    setSelectedReg(reg);
    setMarks({
      aptitude: reg.aptitudeMarks || 0,
      tech: reg.techMarks || 0,
      shortlisted: reg.isShortlistedAptitude || false
    });
    setIsMarkingOpen(true);
  };

  const openPaperModal = (reg: any) => {
    setSelectedReg(reg);
    setPaperForm({
      aptitudePaper: reg.aptitudePaperSet || '',
      codingPaper: reg.codingPaperSet || '',
      dbPaper: reg.dbPaperSet || '',
      projectTask: reg.projectTaskId || ''
    });
    setIsPaperOpen(true);
  };

  const handleUpdateMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      await api.patch(`/walkins/aptitude/${selectedReg.id}`, {
        aptitudeMarks: marks.aptitude,
        techMarks: marks.tech,
        isShortlistedAptitude: marks.shortlisted,
        aptitudePaperSet: selectedReg.aptitudePaperSet
      });
      toast.success('Assessment updated');
      setIsMarkingOpen(false);
      fetchRegistrations();
    } catch (err) { toast.error('Failed to update marks'); }
  };

  const handleUpdatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    try {
      await api.post('/walkins/paper', {
        registrationId: selectedReg.id,
        ...paperForm
      });
      toast.success('Paper assignment updated');
      setIsPaperOpen(false);
      fetchRegistrations();
    } catch (err) { toast.error('Failed to update paper assignment'); }
  };

  const ColumnHeader = ({ title, colId, width, customBg }: { title: string, colId: string, width: string, customBg?: string }) => {
    const uniqueValues = getUniqueValues(colId);
    const hasFilter = (activeFilters[colId]?.length || 0) > 0;
    const filteredUnique = uniqueValues.filter(v => v.toLowerCase().includes(filterSearch.toLowerCase()));
    const bgClass = customBg || 'bg-gray-100';
    const textClass = 'text-gray-900';

    return (
      <th className={`${width} ${bgClass} px-4 py-3 border-r border-gray-300 relative group`}>
        <div className="flex items-center justify-between">
           <span className={`${textClass} font-black uppercase`}>{title}</span>
           <button 
             onClick={() => {
                setOpenFilterCol(openFilterCol === colId ? null : colId);
                setFilterSearch('');
             }}
             className={`p-1 rounded hover:bg-black/5 transition-all ${hasFilter ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-sm' : 'text-gray-400 group-hover:text-gray-600'}`}
           >
              <ListFilter size={12} />
           </button>
        </div>

        <AnimatePresence>
          {openFilterCol === colId && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenFilterCol(null)} />
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 normal-case font-bold"
              >
                 <div className="relative mb-4">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                    <input 
                      type="text" 
                      placeholder="Search values..." 
                      className="w-full pl-8 pr-2 py-1.5 bg-gray-50 rounded-lg text-[10px] font-bold outline-none border-slate-200 focus:border-blue-500"
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                    />
                 </div>
                 <div className="max-h-48 overflow-y-auto space-y-1 no-scrollbar border-b border-gray-50 pb-3 mb-3">
                    {filteredUnique.map(val => (
                      <div key={val} className="flex items-center space-x-2 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded-lg group" onClick={() => handleFilterToggle(colId, val)}>
                         <div className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${activeFilters[colId]?.includes(val) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                            {activeFilters[colId]?.includes(val) && <CheckCircle2 size={10} className="text-white" />}
                         </div>
                         <span className="text-[10px] font-bold text-gray-700 truncate">{val}</span>
                      </div>
                    ))}
                 </div>
                 <div className="flex items-center justify-between">
                    <button onClick={() => clearColumnFilter(colId)} className="text-[9px] font-black text-gray-400 uppercase hover:text-red-500">Reset</button>
                    <button onClick={() => setOpenFilterCol(null)} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Apply</button>
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </th>
    );
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 relative h-full flex flex-col no-scrollbar">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center space-x-4 flex-1">
          <button onClick={() => router.push('/walkins')} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all"><ChevronLeft size={20} /></button>
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-6">
            <h1 className="text-xl font-black text-gray-900 tracking-tight max-w-md truncate">{campaign?.title}</h1>
            <button onClick={() => setIsCampaignEditOpen(true)} className="p-1 text-gray-400 hover:text-blue-600 transition-all" title="Edit Campaign Title">
              <Zap size={14}/>
            </button>
          </div>
          <div className="flex items-center space-x-2 font-black">
             <span className="text-[10px] text-gray-400 uppercase">View:</span>
             <span className="text-sm text-blue-600">{filteredData.length}</span>
             <span className="text-[10px] text-gray-300 uppercase">/ {registrations.length} Total</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button onClick={exportToExcel} className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 shadow-sm"><Download size={14}/><span>Export Excel</span></button>
           <button onClick={() => setActiveFilters({})} className="px-4 py-2 bg-gray-900 text-[10px] font-black uppercase text-white rounded-xl shadow-lg hover:bg-black transition-all active:scale-95">Clear All Filters</button>
           <button onClick={() => fetchRegistrations()} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Zap size={18}/></button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-[32px] border-2 border-gray-200 shadow-[0_50px_150px_rgba(0,0,0,0.25)] overflow-hidden flex-1 flex flex-col no-scrollbar">
        <div className="overflow-x-auto overflow-y-auto flex-1 no-scrollbar relative">
          <table className="w-full text-left border-collapse table-fixed min-w-[4000px]">
            <thead className="sticky top-0 z-30 backdrop-blur-md shadow-sm">
              <tr className="text-[9px] font-black text-gray-900 border-b-2 border-gray-300">
                <th className="w-12 px-4 py-3 sticky left-0 bg-gray-200 z-40 border-r border-gray-300">
                   <button onClick={toggleSelectAll} className="p-1 hover:bg-white/50 rounded transition-all">
                      {selectedIds.length === filteredData.length && filteredData.length > 0 ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                   </button>
                </th>
                <ColumnHeader title="Candidate Name" colId="name" width="w-48 sticky left-12 bg-gray-200 z-40 border-r border-gray-300 shadow-[4px_0_10px_rgba(0,0,0,0.1)]" customBg="bg-gray-200" />
                <ColumnHeader title="Status" colId="status" width="w-28" />
                <ColumnHeader title="Attendance" colId="attendance" width="w-28" />
                <ColumnHeader title="Email Address" colId="email" width="w-48" />
                <ColumnHeader title="Mobile" colId="mobile" width="w-32" />
                <ColumnHeader title="Current State" colId="currentState" width="w-32" />
                <ColumnHeader title="Current City" colId="currentCity" width="w-32" />
                <ColumnHeader title="Hometown State" colId="hometownState" width="w-32" />
                <ColumnHeader title="Hometown City" colId="hometownCity" width="w-32" />
                <ColumnHeader title="Paper Set" colId="aptitudePaperSet" width="w-24 px-4 py-3 text-center border-r border-gray-300 font-black text-purple-900" customBg="bg-purple-100" />
                <ColumnHeader title="Apti" colId="aptitudeMarks" width="w-20 px-4 py-3 text-center border-r border-gray-300 font-black text-blue-900" customBg="bg-blue-100" />
                <ColumnHeader title="Tech" colId="techMarks" width="w-20 px-4 py-3 text-center border-r border-gray-300 font-black text-orange-900" customBg="bg-orange-100" />
                <ColumnHeader title="Total" colId="totalMarks" width="w-20 px-4 py-3 text-center border-r border-gray-300 font-black text-gray-900" customBg="bg-gray-300" />
                <ColumnHeader title="10th %" colId="tenthPercentage" width="w-20" />
                <ColumnHeader title="12th %" colId="twelfthPercentage" width="w-20" />
                <ColumnHeader title="Degree" colId="graduationDegree" width="w-32" />
                <ColumnHeader title="Grad Year" colId="graduationYear" width="w-24" />
                <ColumnHeader title="Grad %" colId="graduationPercentage" width="w-20" />
                <ColumnHeader title="Grad College" colId="graduationCollege" width="w-48" />
                <ColumnHeader title="PG Degree" colId="pgDegree" width="w-32" />
                <ColumnHeader title="PG Year" colId="pgYear" width="w-24" />
                <ColumnHeader title="Exp Type" colId="experienceType" width="w-32" />
                <ColumnHeader title="Duration" colId="experienceDuration" width="w-32" />
                <ColumnHeader title="Tech Stack" colId="technologies" width="w-64" />
                <ColumnHeader title="DB" colId="dbProficiency" width="w-20" />
                <th className="w-36 px-4 py-3 text-center sticky right-0 bg-gray-200 z-30 border-l border-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[10px] font-bold text-gray-700">
              {filteredData.map((reg) => {
                const attendance = reg.slotBookings?.[0]?.attendanceStatus || 'PENDING';
                return (
                <tr key={reg.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(reg.id) ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 z-20 border-r border-gray-200 text-center">
                    <button onClick={() => toggleSelect(reg.id)} className="p-1 hover:bg-white rounded transition-all">
                      {selectedIds.includes(reg.id) ? <CheckSquare size={14} className="text-blue-600" /> : <Square size={14} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 sticky left-12 bg-white group-hover:bg-gray-50 z-20 border-r border-gray-200 shadow-[4px_0_10px_rgba(0,0,0,0.06)]" onClick={() => toggleSelect(reg.id)}>
                    <div className="flex items-center space-x-2">
                       <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${reg.candidateId ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{reg.name.charAt(0)}</div>
                       <span className="font-black text-gray-900 truncate">{reg.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${
                      reg.status === 'REJECTED' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : reg.isShortlistedAptitude 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {reg.status.split('_')[0]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border shadow-sm ${
                      attendance === 'PRESENT' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : attendance === 'ABSENT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {attendance}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate text-gray-600">{reg.email}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.mobile}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.currentState || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.currentCity || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.hometownState || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.hometownCity || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-gray-200 bg-purple-50/10">
                    <input type="text" value={reg.aptitudePaperSet || ''} placeholder="..." onChange={(e) => updateMarksInline(reg.id, 'paperSet', e.target.value)} className="w-full bg-transparent text-center font-black text-purple-700 border-none p-0 focus:ring-0" />
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200 bg-blue-50/10 font-black text-blue-700">
                    <input type="number" value={reg.aptitudeMarks} onChange={e => updateMarksInline(reg.id, 'aptitude', e.target.value)} className="w-full bg-transparent text-center border-none p-0 focus:ring-0" />
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200 bg-orange-50/10 font-black text-orange-700">
                    <input type="number" value={reg.techMarks} onChange={e => updateMarksInline(reg.id, 'tech', e.target.value)} className="w-full bg-transparent text-center border-none p-0 focus:ring-0" />
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200 font-black text-gray-900 bg-gray-100/10">{reg.totalMarks}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.tenthPercentage || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.twelfthPercentage || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.graduationDegree || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.graduationYear || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.graduationPercentage || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.graduationCollege || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate">{reg.pgDegree || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.pgYear || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 uppercase">{reg.experienceType || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">{reg.experienceDuration || '-'}</td>
                  <td className="px-4 py-3 border-r border-slate-200 truncate text-blue-600">{reg.technologies || '-'}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-200 font-black">{reg.dbProficiency}</td>
                  <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-gray-50 z-30 border-l border-gray-300 flex items-center justify-center space-x-2 shadow-[-4px_0_10px_rgba(0,0,0,0.06)]">
                    <button onClick={() => openMarkingModal(reg)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Assessment"><Trophy size={16}/></button>
                    {user?.role === 'ADMIN' && (
                       <button onClick={() => handleBulkAction('DELETE', null, [reg.id])} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Ban size={16}/></button>
                    )}
                    <button onClick={() => window.open(`/walkin/evaluation/${reg.id}`, '_blank')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Print Evaluation"><PrinterIcon size={16}/></button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-5 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] flex items-center space-x-8 border border-white/10">
             <div className="flex items-center space-x-3 border-r border-gray-700 pr-8">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20">{selectedIds.length}</div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Selected</p>
             </div>
             <div className="flex items-center space-x-4">
                <button onClick={() => setIsDriveSelectOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"><Send size={16}/><span>Send Booking Email</span></button>
                <button onClick={() => handleBulkAction('SHORTLIST')} className="flex items-center space-x-2 px-6 py-3 bg-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-green-900/20"><Trophy size={16}/><span>Shortlist All</span></button>
                <button onClick={() => handleBulkAction('REJECT')} className="flex items-center space-x-2 px-6 py-3 bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-900/20"><Ban size={16}/><span>Bulk Reject</span></button>
                {user?.role === 'ADMIN' && (
                  <button onClick={() => handleBulkAction('DELETE')} className="flex items-center space-x-2 px-6 py-3 bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all active:scale-95 border border-white/5"><Ban size={16}/></button>
                )}
             </div>
             <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-full transition-all ml-4 text-gray-400 hover:text-white"><X size={20}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDriveSelectOpen && (
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 space-y-8">
               <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Send size={32}/></div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Send Slot Booking Link</h2>
                  <p className="text-gray-500 text-sm font-medium">Select the hiring drive to use for slot booking links for {selectedIds.length} candidates.</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Hiring Drive</label>
                    <select 
                      className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      value={selectedDriveId || ''}
                      onChange={e => setSelectedDriveId(Number(e.target.value))}
                    >
                       <option value="">Choose a drive...</option>
                       {drives.map(d => (
                         <option key={d.id} value={d.id}>{d.title} ({d.job.title})</option>
                       ))}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                     <button onClick={() => setIsDriveSelectOpen(false)} className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                     <button 
                       onClick={handleSendBookingLinks}
                       disabled={!selectedDriveId || isSendingLinks}
                       className="flex-2 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:shadow-none"
                     >
                        {isSendingLinks ? <Zap size={16} className="animate-spin" /> : <Send size={16} />}
                        <span>{isSendingLinks ? 'Sending...' : 'Send Links Now'}</span>
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMarkingOpen && selectedReg && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 space-y-6">
               <div className="flex justify-between items-center"><h2 className="text-xl font-black text-gray-900 leading-none">Assessment: {selectedReg.name}</h2><button onClick={() => setIsMarkingOpen(false)}><X/></button></div>
               <form onSubmit={handleUpdateMarks} className="space-y-6">
                  <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aptitude Paper Set</label><input type="text" value={selectedReg.aptitudePaperSet || ''} onChange={e => updateMarksInline(selectedReg.id, 'paperSet', e.target.value)} className="w-full text-sm font-black text-purple-600" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aptitude Marks</label><input type="number" value={marks.aptitude} onChange={e => setMarks({...marks, aptitude: +e.target.value})} className="w-full text-sm font-black text-blue-600" /></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Technical Marks</label><input type="number" value={marks.tech} onChange={e => setMarks({...marks, tech: +e.target.value})} className="text-sm font-black text-orange-600 w-full" /></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-slate-200">
                     <div><p className="text-xs font-black text-gray-800">Shortlist for Interview</p><p className="text-[9px] text-gray-400 font-medium">Promotes to main Pool</p></div>
                     <button type="button" onClick={() => setMarks({...marks, shortlisted: !marks.shortlisted})} className={`w-10 h-5 rounded-full ${marks.shortlisted ? 'bg-green-600' : 'bg-gray-300'} relative transition-colors`}><motion.div animate={{ x: marks.shortlisted ? 20 : 2 }} className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm" /></button>
                  </div>
                  <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all">Update Assessment</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaperOpen && selectedReg && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 space-y-6">
               <div className="flex justify-between items-center pb-4 border-b border-gray-50"><h2 className="text-xl font-black text-gray-900">Paper Set Tracking</h2><button onClick={() => setIsPaperOpen(false)}><X size={20}/></button></div>
               <form onSubmit={handleUpdatePaper} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Aptitude Set</label><input value={paperForm.aptitudePaper} onChange={e => setPaperForm({...paperForm, aptitudePaper: e.target.value})} className="w-full text-xs font-black" /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Coding Set</label><input value={paperForm.codingPaper} onChange={e => setPaperForm({...paperForm, codingPaper: e.target.value})} className="w-full text-xs font-black" /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">DB Proficiency Set</label><input value={paperForm.dbPaper} onChange={e => setPaperForm({...paperForm, dbPaper: e.target.value})} className="w-full text-xs font-black" /></div>
                     <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Task ID</label><input value={paperForm.projectTask} onChange={e => setPaperForm({...paperForm, projectTask: e.target.value})} className="w-full text-xs font-black" /></div>
                  </div>
                  <button className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-2"><Save size={18} /><span>Update Paper Assignment</span></button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCampaignEditOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 space-y-6">
               <div className="flex justify-between items-center"><h2 className="text-xl font-black text-gray-900 leading-none">Edit Campaign Title</h2><button onClick={() => setIsCampaignEditOpen(false)}><X/></button></div>
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Title</label>
                    <input type="text" value={newCampaignTitle} onChange={e => setNewCampaignTitle(e.target.value)} className="w-full text-sm font-black" />
                  </div>
                  <button onClick={handleUpdateCampaign} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all">Update Title</button>
               </div>
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

'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Mail, ChevronRight, Info, CheckCircle2, Clock, Send, Star, AlertCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ConfirmModal';

const COLUMNS = [
  { id: 'APPLIED', name: 'Applied', color: 'slate', icon: <Clock size={16} /> },
  { id: 'SHORTLISTED', name: 'Shortlisted', color: 'indigo', icon: <Star size={16} /> },
  { id: 'INTERVIEW', name: 'Interview', color: 'amber', icon: <Send size={16} /> },
  { id: 'OFFER', name: 'Offer', color: 'emerald', icon: <CheckCircle2 size={16} /> },
  { id: 'HIRED', name: 'Hired', color: 'emerald', icon: <CheckCircle2 size={16} /> },
];

interface Application {
  id: number;
  status: string;
  candidate: {
    id: number;
    name: string;
    email: string;
  };
  job: {
    title: string;
  };
}

export default function PipelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<{id: number, title: string}[]>([]);
  const [jobFilter, setJobFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [loading, setLoading] = useState(true);

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
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = jobFilter 
    ? applications.filter(app => app.job.title === jobFilter)
    : applications;

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const applicationId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistic Update
    const updatedApps = applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApps);

    try {
      await api.patch(`/applications/${applicationId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchApplications();
    }
  };

  const handleDeleteApplication = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Application',
      description: 'Are you sure you want to delete this application? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/applications/${id}`);
          fetchApplications();
        } catch (err) {
          console.error('Failed to delete application', err);
          alert('Failed to delete application');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full"
        />
        <p className="text-gray-400 font-bold tracking-widest uppercase text-[10px]">Synchronizing Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-8">
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-8">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Hiring Pipeline</h1>
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-widest mt-1 opacity-70">Real-time candidate tracking</p>
          </div>
          
          <div className="h-10 w-px bg-slate-100" />
          
          <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 hover:border-slate-200 transition-all">
            <Briefcase size={16} className="text-slate-400 mr-3" />
            <select 
              className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent text-[#0F172A] min-w-[220px] cursor-pointer"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="">All Active Positions</option>
              {jobs.map(job => (
                <option key={job.id} value={job.title}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setViewMode('board')}
            className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'board' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            Board
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            List
          </button>
        </div>
      </div>
      
      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 flex space-x-6 overflow-x-auto pb-6 custom-scrollbar min-h-0">
            {COLUMNS.map((column) => (
              <div key={column.id} className="flex flex-col w-80 min-w-[340px] bg-slate-50/50 rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-inner h-full">
                <div className={`p-6 bg-white/80 backdrop-blur-sm flex justify-between items-center border-b border-slate-200 flex-shrink-0`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl bg-${column.color}-50 text-${column.color}-600 shadow-sm shadow-${column.color}-100`}>
                      {column.icon}
                    </div>
                    <h3 className="font-black text-[#0F172A] text-[11px] uppercase tracking-[0.2em]">{column.name}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
                    {filteredApplications.filter(app => app.status === column.id).length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-4 space-y-5 overflow-y-auto custom-scrollbar transition-all duration-500 ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <AnimatePresence>
                        {filteredApplications
                          .filter((app) => app.status === column.id)
                          .map((app, index) => (
                            <Draggable key={app.id} draggableId={app.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style}
                                  className={`mb-5 select-none ${snapshot.isDragging ? 'z-[100]' : ''}`}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`corporate-card p-6 group cursor-grab active:cursor-grabbing relative ${
                                      snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500 border-slate-200 rotate-2 scale-105' : 'hover:border-indigo-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-5">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[#0F172A] font-black border border-slate-200 shadow-sm text-lg group-hover:scale-110 transition-transform duration-500">
                                          {app.candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                          <Link 
                                            href={`/candidates/${app.candidate.id}`}
                                            className="text-[13px] font-black text-[#0F172A] group-hover:text-indigo-600 transition-colors block leading-none mb-2"
                                          >
                                            {app.candidate.name}
                                          </Link>
                                          <div className="flex items-center text-[9px] text-[#64748B] font-black uppercase tracking-widest opacity-70">
                                            <Briefcase size={10} className="mr-2" />
                                            <span>{app.job.title}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDeleteApplication(app.id); }}
                                          className="text-slate-300 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-xl"
                                          title="Delete Application"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                        <button className="text-slate-300 hover:text-indigo-500 transition-all p-2 hover:bg-indigo-50 rounded-xl">
                                          <Info size={16} />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold overflow-hidden">
                                        <Mail size={10} className="flex-shrink-0 opacity-50" />
                                        <span className="truncate opacity-70">{app.candidate.email}</span>
                                      </div>
                                      <div className="flex -space-x-3">
                                        {[1, 2].map((i) => (
                                          <div key={i} className="w-7 h-7 rounded-xl border-2 border-white bg-slate-50 flex items-center justify-center text-[8px] font-black text-slate-400 shadow-sm">
                                            JD
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {snapshot.isDragging && (
                                      <div className="mt-5 flex items-center justify-center space-x-2 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                                        <Activity size={10} />
                                        <span>Transitioning...</span>
                                      </div>
                                    )}
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                      </AnimatePresence>
                      {provided.placeholder}
                      {filteredApplications.filter(app => app.status === column.id).length === 0 && (
                        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                          <div className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-slate-300 flex items-center justify-center">
                             <Plus size={24} className="text-slate-400" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Empty Stage</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Position</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode='popLayout'>
                  {filteredApplications.map((app) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={app.id} 
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">
                            {app.candidate.name.charAt(0)}
                          </div>
                          <Link href={`/candidates/${app.candidate.id}`} className="text-sm font-black text-[#0F172A] hover:text-indigo-600 transition-colors">
                            {app.candidate.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                          <Briefcase size={12} className="opacity-50" />
                          <span>{app.job.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400">
                          <Mail size={12} className="opacity-50" />
                          <span>{app.candidate.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteApplication(app.id)}
                            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <Link 
                            href={`/candidates/${app.candidate.id}`}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">No applications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

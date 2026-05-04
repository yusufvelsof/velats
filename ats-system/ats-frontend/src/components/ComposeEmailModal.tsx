'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Send, Paperclip, ChevronDown, Trash2, Mail, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSent: () => void;
}

const ComposeEmailModal = ({ isOpen, onClose, candidate, onSent }: ComposeEmailModalProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
  
  const [emailForm, setEmailForm] = useState({
    from: '',
    to: candidate?.email || '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templateAttachments, setTemplateAttachments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const initialFormState = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchUserProfile();
      const initial = {
        from: currentUser?.email || '',
        to: candidate?.email || '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
      };
      setEmailForm(initial);
      setAttachments([]);
      setTemplateAttachments([]);
      setSelectedTemplate('');
      initialFormState.current = JSON.stringify(initial);
    }
  }, [isOpen, candidate]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/email-templates');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setCurrentUser(res.data);
      if (!emailForm.from) {
        setEmailForm(prev => ({ ...prev, from: res.data.email }));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const replaceVariables = useCallback((text: string, user: any) => {
    if (!text) return '';
    let result = text;
    
    const latestInterview = candidate?.applications?.[0]?.interviews?.[0];
    const job = candidate?.applications?.[0]?.job;
    
    const vars: Record<string, string> = {
      'candidate_name': `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || candidate?.name || 'Candidate',
      'first_name': candidate?.firstName || candidate?.name?.split(' ')[0] || 'Candidate',
      'last_name': candidate?.lastName || candidate?.name?.split(' ').slice(1).join(' ') || '',
      'job_title': job?.title || 'the position',
      'recruiter_name': `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Recruiter',
      'interviewer_name': latestInterview?.interviewerUser ? `${latestInterview.interviewerUser.firstName} ${latestInterview.interviewerUser.lastName}` : 'TBD',
      'interview_date_time': latestInterview ? new Date(latestInterview.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : 'TBD',
      'interview_level': latestInterview?.round?.replace(/_/g, ' ') || 'Initial Round',
      'location': latestInterview?.location || 'Online / Link to be shared',
      'company_name': 'Velocity Software Solutions',
    };

    Object.entries(vars).forEach(([key, value]) => {
      // Escape curly braces for robust regex matching
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || '');
    });
    return result;
  }, [candidate]);

  const handleTemplateChange = (slug: string) => {
    // Check if user has manually edited the form
    const currentFormState = JSON.stringify(emailForm);
    const isDirty = currentFormState !== initialFormState.current && (emailForm.subject.trim() !== '' || emailForm.body.trim() !== '');

    const applyTemplate = (targetSlug: string) => {
      setSelectedTemplate(targetSlug);
      if (!targetSlug) {
        setTemplateAttachments([]);
        const resetForm = { ...emailForm, subject: '', body: '', from: currentUser?.email || '' };
        setEmailForm(resetForm);
        initialFormState.current = JSON.stringify(resetForm);
        return;
      }

      const template = templates.find(t => t.slug === targetSlug);
      if (template) {
        // Debug Requirement (MANDATORY): Log the template object
        console.log('Selected Template Data:', template);

        const candidateName = `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || candidate?.name || 'Candidate';
        
        // 1. Process Subject Line
        let subjectToProcess = template.subject || template.name || '';
        
        // Ensure the mandatory branding suffix pattern
        if (subjectToProcess && !subjectToProcess.includes('{{candidate_name}}') && !subjectToProcess.includes(candidateName)) {
          subjectToProcess = `${subjectToProcess} | {{candidate_name}}`;
        }

        const finalSubject = replaceVariables(subjectToProcess, currentUser) || subjectToProcess;

        // 2. Process Email Body & Signature
        const bodyToProcess = template.body || '';
        let finalBody = replaceVariables(bodyToProcess, currentUser) || bodyToProcess;

        // Requirement: body = template.body + "\n\n" + (template.signature || "")
        // Note: template.signature might be a separate field in some versions, 
        // while currentUser.signature is our local profile signature.
        const templateSignature = template.signature || '';
        if (templateSignature) {
           finalBody += `\n\n${templateSignature}`;
        } else if (template.addSignature) {
          const signature = currentUser?.signature || `<p>Regards,<br/><strong>Recruitment Team</strong><br/>Velocity Software Solutions</p>`;
          if (!finalBody.includes(signature.substring(0, 20))) {
            finalBody += `<br/><br/>${signature}`;
          }
        }
        
        setTemplateAttachments(Array.isArray(template.attachments) ? template.attachments : []);
        
        // 3. Update CC/BCC if defined in template
        const newCc = template.cc || emailForm.cc || '';
        const newBcc = template.bcc || emailForm.bcc || '';

        // 4. Update Form State
        const newFrom = template.defaultFromEmail || currentUser?.email || '';

        const newFormState = {
          ...emailForm,
          subject: finalSubject,
          body: finalBody,
          from: newFrom,
          cc: newCc,
          bcc: newBcc
        };

        setEmailForm(newFormState);
        // Update initialFormState to the newly applied template so next dirty check is accurate
        initialFormState.current = JSON.stringify(newFormState);
        toast.success(`Template "${template.name}" applied`);
      }
    };

    if (isDirty) {
      setConfirmModal({
        isOpen: true,
        title: 'Overwrite Draft?',
        description: 'You have manually edited this email. Selecting a new template will overwrite your current draft. Do you want to proceed?',
        onConfirm: () => {
          applyTemplate(slug);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    applyTemplate(slug);
  };

  const validateEmails = (emailStr: string) => {
    if (!emailStr) return true;
    const emails = emailStr.split(',').map(e => e.trim());
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => regex.test(email));
  };

  const handleSend = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateEmails(emailForm.cc) || !validateEmails(emailForm.bcc)) {
      toast.error('Please enter valid email addresses in CC/BCC (separated by commas)');
      return;
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', emailForm.to);
      formData.append('from', emailForm.from);
      formData.append('cc', emailForm.cc);
      formData.append('bcc', emailForm.bcc);
      formData.append('subject', emailForm.subject);
      formData.append('body', emailForm.body);
      formData.append('candidateId', candidate.id.toString());
      if (currentUser?.id) formData.append('userId', currentUser.id.toString());
      
      // Send template attachments as a JSON string
      formData.append('templateAttachments', JSON.stringify(templateAttachments));
      
      attachments.forEach(file => {
        formData.append('files', file);
      });

      await api.post('/email/send-composer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowSuccess(true);
      toast.success('Email sent successfully');
      setTimeout(() => {
        setShowSuccess(false);
        onSent();
        onClose();
      }, 2000);
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
      toast.info('Files attached');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info('Attachment removed');
  };

  const removeTemplateAttachment = (index: number) => {
    setTemplateAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info('Template file removed');
  };

  const handleClose = () => {
    const currentFormState = JSON.stringify(emailForm);
    if (currentFormState !== initialFormState.current && (emailForm.subject || emailForm.body)) {
      setConfirmModal({
        isOpen: true,
        title: 'Unsaved Changes',
        description: 'You have drafted a message. Are you sure you want to close and discard it?',
        onConfirm: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                <Mail size={20}/>
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900">Compose Email</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">To: {candidate.firstName} {candidate.lastName}</p>
             </div>
          </div>
          <button onClick={handleClose} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all"><X size={20}/></button>
        </div>

        <form onSubmit={handleSend} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Template</label>
              <div className="relative">
                <select 
                  className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                  value={selectedTemplate}
                  onChange={e => handleTemplateChange(e.target.value)}
                >
                  <option value="">Custom Email (No Template)</option>
                  {templates.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                value={emailForm.from}
                onChange={e => setEmailForm({...emailForm, from: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
              <input 
                type="email" 
                required
                className="w-full bg-gray-100 p-4 rounded-2xl text-sm font-bold border-slate-200 outline-none" 
                value={emailForm.to}
                onChange={e => setEmailForm({...emailForm, to: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CC</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                placeholder="Comma separated"
                value={emailForm.cc}
                onChange={e => setEmailForm({...emailForm, cc: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">BCC</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
                placeholder="Comma separated"
                value={emailForm.bcc}
                onChange={e => setEmailForm({...emailForm, bcc: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
            <input 
              type="text" 
              required
              className="w-full bg-gray-50 p-4 rounded-2xl text-sm font-bold border-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" 
              placeholder="Email subject line..."
              value={emailForm.subject}
              onChange={e => setEmailForm({...emailForm, subject: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Body</label>
               <div className="flex items-center space-x-1 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                  <Info size={10}/>
                  <span>Rich Text Enabled</span>
               </div>
            </div>
            <div className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm">
              <ReactQuill 
                theme="snow"
                value={emailForm.body}
                onChange={val => setEmailForm({...emailForm, body: val})}
                className="bg-white h-[250px]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attachments</label>
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-all text-[10px] font-black uppercase tracking-widest text-gray-600">
                   <Paperclip size={14}/>
                   <span>Attach Files</span>
                   <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Template Attachments */}
                {templateAttachments.map((file, idx) => (
                   <div key={`template-${idx}`} className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="flex items-center space-x-3 overflow-hidden">
                         <div className="p-2 bg-white rounded-lg text-indigo-600"><Paperclip size={12}/></div>
                         <div className="flex flex-col truncate">
                            <span className="text-[10px] font-bold text-indigo-700 truncate">{file.name}</span>
                            <span className="text-[8px] text-indigo-400 uppercase font-black">Template File</span>
                         </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeTemplateAttachment(idx)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                      >
                         <Trash2 size={14}/>
                      </button>
                   </div>
                ))}

                {/* New Uploads */}
                {attachments.map((file, idx) => (
                   <div key={`upload-${idx}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center space-x-3 overflow-hidden">
                         <div className="p-2 bg-white rounded-lg text-blue-600"><Paperclip size={12}/></div>
                         <div className="flex flex-col truncate">
                            <span className="text-[10px] font-bold text-blue-700 truncate">{file.name}</span>
                            <span className="text-[8px] text-blue-400">{(file.size / 1024).toFixed(1)} KB</span>
                         </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                      >
                         <Trash2 size={14}/>
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </form>

        <div className="p-8 bg-gray-50/50 border-t border-slate-200 flex justify-end">
           <button 
             type="submit" 
             onClick={handleSend}
             disabled={sending || showSuccess || !emailForm.subject || !emailForm.body}
             className="flex items-center space-x-3 px-10 py-4 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:shadow-none active:scale-95"
           >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={16}/>
                  <span>Send Email Now</span>
                </>
              )}
           </button>
        </div>
      </motion.div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant="warning"
      />
    </div>
  );
};

export default ComposeEmailModal;

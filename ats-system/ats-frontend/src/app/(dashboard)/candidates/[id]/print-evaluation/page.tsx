'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Printer as PrinterIcon, ChevronLeft, Zap } from 'lucide-react';
import Image from 'next/image';

export default function PrintEvaluationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [latestInterview, setLatestInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, compRes] = await Promise.all([
          api.get(`/candidates/${id}`),
          api.get('/company')
        ]);
        
        setCandidate(candRes.data);
        setCompany(compRes.data);

        // Find latest scheduled or completed interview
        const allInterviews = candRes.data.applications?.flatMap((app: any) => 
          app.interviews.map((iv: any) => ({ ...iv, jobTitle: app.job.title }))
        ) || [];

        const sorted = allInterviews.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setLatestInterview(sorted[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!candidate) return <div className="p-20 text-center font-black text-gray-400">Candidate not found.</div>;

  const Row = ({ label, value, placeholder }: { label: string, value?: string, placeholder?: boolean }) => (
    <div className="flex border-b border-black py-0.5 items-center">
      <span className="text-[9px] font-black uppercase w-24 shrink-0">{label}:</span>
      <span className={`text-[10px] font-bold uppercase flex-1 ${placeholder ? 'border-b border-dotted border-black h-3' : ''}`}>{value || ''}</span>
    </div>
  );

  const Checkbox = ({ label, checked }: { label: string, checked?: boolean }) => (
    <div className="flex items-center space-x-1">
      <div className="w-3 h-3 border border-black shrink-0 flex items-center justify-center text-[8px] font-black">
        {checked ? '✓' : ''}
      </div>
      <span className="text-[8px] font-bold whitespace-nowrap">{label}</span>
    </div>
  );

  return (
    <div className="bg-white min-h-screen p-4 max-w-[21cm] mx-auto print:p-0 leading-tight">
      <style jsx global>{`
        @page { size: portrait; margin: 0.5cm; }
        @media print {
          .print-hidden { display: none; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="mb-4 flex justify-between items-center print-hidden">
        <button onClick={() => router.push(`/candidates/${id}`)} className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-all font-bold text-sm">
            <ChevronLeft size={18} />
            <span>Back to Profile</span>
         </button>
        <button onClick={handlePrint} className="flex items-center space-x-2 bg-black text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          <PrinterIcon size={16} /> <span>Print Evaluation Sheet</span>
        </button>
      </div>

      <div className="border-[1.5px] border-black p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center border-b-[1.5px] border-black pb-2">
          <div className="relative w-32 h-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain object-left" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Candidate Evaluation Sheet</h1>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-500">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Basic Info - Row 1 */}
        <div className="grid grid-cols-3 gap-4 border-b border-black pb-1">
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Name:</span><span className="text-[10px] font-bold uppercase truncate">{candidate.firstName} {candidate.lastName}</span></div>
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Mobile:</span><span className="text-[10px] font-bold">{candidate.phone}</span></div>
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Email:</span><span className="text-[10px] font-bold lowercase truncate">{candidate.email}</span></div>
        </div>

        {/* Interview Meta */}
        <div className="grid grid-cols-3 gap-4">
          <Row label="Interviewer" value={latestInterview?.interviewerUser ? `${latestInterview.interviewerUser.firstName} ${latestInterview.interviewerUser.lastName}` : ''} placeholder={!latestInterview?.interviewerUser} />
          <Row label="Int. Round" value={latestInterview?.round?.replace('_', ' ')} placeholder={!latestInterview?.round} />
          <Row label="Applied Profile" value={latestInterview?.jobTitle} />
        </div>

        {/* Academic Details */}
        <div className="border border-black">
          <div className="bg-gray-50 border-b border-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest">Academic Background</div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="text-[8px] font-black border-b border-black">
                <th className="border-r border-black py-0.5">Level</th>
                <th className="border-r border-black">Stream / Degree</th>
                <th className="border-r border-black">Year</th>
                <th className="border-r border-black">Marks %</th>
                <th>College / Board</th>
              </tr>
            </thead>
            <tbody className="text-[9px] font-bold uppercase">
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">10th</td>
                <td className="border-r border-black">-</td>
                <td className="border-r border-black">{candidate.tenthYear || '-'}</td>
                <td className="border-r border-black">{candidate.tenthPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">12th</td>
                <td className="border-r border-black">-</td>
                <td className="border-r border-black">{candidate.twelfthYear || '-'}</td>
                <td className="border-r border-black">{candidate.twelfthPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">-</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">Graduation</td>
                <td className="border-r border-black truncate px-1 text-[8px]">{candidate.graduationDegree || '-'}</td>
                <td className="border-r border-black">{candidate.graduationYear || '-'}</td>
                <td className="border-r border-black">{candidate.graduationPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{candidate.graduationCollege || '-'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">Post Grad (PG)</td>
                <td className="border-r border-black truncate px-1 text-[8px]">{candidate.pgDegree || '-'}</td>
                <td className="border-r border-black">{candidate.pgYear || '-'}</td>
                <td className="border-r border-black">{candidate.pgPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{candidate.pgCollege || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Location & Experience */}
        <div className="grid grid-cols-2 gap-x-8">
          <div className="space-y-1">
            <Row label="Current Loc." value={candidate.currentLocation} />
            <Row label="Hometown" value={candidate.hometown} />
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-4">
              <span className="text-[9px] font-black uppercase">Experience:</span>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                   <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px]">{candidate.experienceYears ? '✓' : ''}</div>
                   <span className="text-[8px] font-bold">Experienced ({candidate.experienceYears || '0'} Yrs)</span>
                </div>
                <div className="flex items-center space-x-1">
                   <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px]">{!candidate.experienceYears || candidate.experienceYears === '0' ? '✓' : ''}</div>
                   <span className="text-[8px] font-bold">Fresher</span>
                </div>
              </div>
            </div>
            <div className="flex border-b border-black py-0.5 items-center">
              <span className="text-[9px] font-black uppercase w-24 shrink-0">Current Org:</span>
              <span className="text-[10px] font-bold uppercase flex-1 border-b border-dotted border-black h-3">{candidate.currentEmployer}</span>
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        <div className="grid grid-cols-2 gap-8 border border-black p-2">
          <div className="space-y-2">
             <div className="grid grid-cols-2 gap-2">
                <Row label="Skill Set" value={candidate.skillSet} />
                <Row label="Paper Set" value={candidate.aptitudePaperSet} />
             </div>
             <Row label="Apti Marks" value={`${candidate.aptitudeMarks || 0} + ${candidate.techMarks || 0} = ${candidate.totalMarks || 0}`} />
             <Row label="Programs Running" placeholder />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase underline">Written Comm.</span>
              <div className="flex space-x-3"><Checkbox label="Poor"/><Checkbox label="Avg"/><Checkbox label="Good"/><Checkbox label="Excl"/></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase underline">Oral Comm.</span>
              <div className="flex space-x-3"><Checkbox label="Poor"/><Checkbox label="Avg"/><Checkbox label="Good"/><Checkbox label="Excl"/></div>
            </div>
          </div>
        </div>

        {/* Family & Offer Details */}
        <div className="grid grid-cols-2 gap-8 border border-black p-2">
          <div className="space-y-1">
            <div className="text-[9px] font-black uppercase underline mb-1">Family Background</div>
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black" />
          </div>
          <div className="space-y-1 border-l border-black pl-4">
            <div className="text-[9px] font-black uppercase underline mb-1">Current Offer?</div>
            <div className="flex space-x-6 mb-2">
               <Checkbox label="No"/>
               <Checkbox label="Yes (Details below)"/>
            </div>
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black mb-1" />
            <div className="w-full h-3 border-b border-dotted border-black" />
            <p className="text-[7px] text-gray-400 font-bold">(If yes: Company, CTC, Joining Date)</p>
          </div>
        </div>

        {/* T&C Section */}
        <div className="border border-black p-2">
          <div className="text-[9px] font-black uppercase mb-2 underline">Terms & Conditions Explained</div>
          <div className="flex justify-between px-4">
             {['Bond (2 Years)', 'Security Cheque', 'Original Documents', 'Stipend / Training Period'].map(tc => (
               <div key={tc} className="flex items-center space-x-2">
                  <div className="w-4 h-4 border border-black" />
                  <span className="text-[9px] font-bold">{tc}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="border border-black min-h-[140px] p-2 relative">
          <div className="text-[9px] font-black uppercase mb-1">Detailed Feedback:</div>
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black mb-3" />
          <div className="w-full h-3 border-b border-dotted border-black" />
        </div>

        {/* Decision & Rejection Reasons */}
        <div className="grid grid-cols-4 gap-4">
           <div className="col-span-1 border border-black p-2">
              <div className="text-[9px] font-black uppercase mb-2 underline">Final Decision</div>
              <div className="space-y-2">
                 {['S (Select)', 'H (Hold)', 'R (Reject)', 'A (Absent)'].map(opt => (
                   <div key={opt} className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-black" />
                      <span className="text-[9px] font-black">{opt}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="col-span-3 border border-black p-2">
              <div className="text-[9px] font-black uppercase mb-2 underline">Reasons for Rejection (If Applicable)</div>
              <div className="grid grid-cols-3 gap-1">
                 {[
                   'Culture Fitment', 'No Coding Knowledge', 'Cheated / Unfair', 
                   'Not keen for Job', 'Bad Attitude', 'Bad Communication',
                   'Location Issue', 'T&C not ok', 'High Salary Exp',
                   'Unresponsive', 'Better Offer', 'College Cap Met', 'Give up!'
                 ].map(reason => <Checkbox key={reason} label={reason} />)}
              </div>
           </div>
        </div>

        {/* Signature */}
        <div className="pt-16 flex justify-between">
           <div className="text-center w-48 border-t border-black pt-1">
              <p className="text-[9px] font-black uppercase">Recruiter Signature</p>
           </div>
           <div className="text-center w-48 border-t border-black pt-1">
              <p className="text-[9px] font-black uppercase">Interviewer Signature</p>
           </div>
        </div>
      </div>
    </div>
  );
}

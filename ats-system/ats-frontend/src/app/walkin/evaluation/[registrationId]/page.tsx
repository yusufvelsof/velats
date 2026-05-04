'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Printer as PrinterIcon, Zap } from 'lucide-react';
import Image from 'next/image';

export default function EvaluationSheetPage() {
  const { registrationId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [registrationId]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/walkins/evaluation/${registrationId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update Candidate / Registration details
      await api.patch(`/walkins/aptitude/${data.id}`, {
        aptitudeMarks: parseInt(data.aptitudeMarks) || 0,
        techMarks: parseInt(data.techMarks) || 0,
        isShortlistedAptitude: data.isShortlistedAptitude,
        aptitudePaperSet: data.aptitudePaperSet
      });

      // Update Campaign details
      if (data.campaign) {
        await api.patch(`/walkins/campaign/${data.campaign.id}`, {
          title: data.campaign.title
        });
      }

      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Generating...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Data not found.</div>;

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
      <div className="mb-4 flex justify-end items-center space-x-2 print-hidden">
        <button onClick={() => setIsEditing(!isEditing)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs">
          <Zap size={14} /> <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
        </button>
        <button onClick={() => window.print()} className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded font-bold text-xs">
          <PrinterIcon size={14} /> <span>Print Sheet</span>
        </button>
      </div>

      <div className="border-[1.5px] border-black p-4 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center border-b-[1.5px] border-black pb-2">
          <div className="relative w-32 h-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain object-left" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Candidate Evaluation Sheet</h1>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-500">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Basic Info - Row 1 */}
        <div className="grid grid-cols-3 gap-4 border-b border-black pb-1">
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Name:</span><span className="text-[10px] font-bold uppercase truncate">{data.name}</span></div>
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Mobile:</span><span className="text-[10px] font-bold">{data.mobile}</span></div>
          <div className="flex space-x-1"><span className="text-[9px] font-bold uppercase tracking-wider text-gray-600">Email:</span><span className="text-[10px] font-bold lowercase truncate">{data.email}</span></div>
        </div>

        {/* Interview Meta */}
        <div className="grid grid-cols-3 gap-4">
          <Row label="Interviewer" placeholder />
          <Row label="Int. Round" placeholder />
          <Row label="Applied Profile" value={data.campaign?.title} />
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
                <td className="border-r border-black">{data.tenthYear || '-'}</td>
                <td className="border-r border-black">{data.tenthPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{data.tenthBoard || '-'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">12th</td>
                <td className="border-r border-black">-</td>
                <td className="border-r border-black">{data.twelfthYear || '-'}</td>
                <td className="border-r border-black">{data.twelfthPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{data.twelfthBoard || '-'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">Graduation</td>
                <td className="border-r border-black truncate px-1 text-[8px]">{data.graduationDegree || '-'}</td>
                <td className="border-r border-black">{data.graduationYear || '-'}</td>
                <td className="border-r border-black">{data.graduationPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{data.graduationCollege || '-'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="border-r border-black font-black">Post Grad (PG)</td>
                <td className="border-r border-black truncate px-1 text-[8px]">{data.pgDegree || '-'}</td>
                <td className="border-r border-black">{data.pgYear || '-'}</td>
                <td className="border-r border-black">{data.pgPercentage || '-'}</td>
                <td className="truncate px-1 text-[8px]">{data.pgCollege || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Location & Experience */}
        <div className="grid grid-cols-2 gap-x-8">
          <div className="space-y-1">
            <Row label="Current Loc." value={data.currentLocation} />
            <Row label="Hometown" value={data.hometown} />
          </div>
          <div className="space-y-2 pt-1">
            <div className="flex items-center space-x-4">
              <span className="text-[9px] font-black uppercase">Experience:</span>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                   <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px]">{data.experienceType === 'EXPERIENCED' ? '✓' : ''}</div>
                   <span className="text-[8px] font-bold">Experienced ({data.experienceDuration || '0'} Yrs)</span>
                </div>
                <div className="flex items-center space-x-1">
                   <div className="w-3 h-3 border border-black flex items-center justify-center text-[8px]">{data.experienceType === 'FRESHER' ? '✓' : ''}</div>
                   <span className="text-[8px] font-bold">Fresher</span>
                </div>
              </div>
            </div>
            <div className="flex border-b border-black py-0.5 items-center">
              <span className="text-[9px] font-black uppercase w-24 shrink-0">Current Org:</span>
              <span className="text-[10px] font-bold uppercase flex-1 border-b border-dotted border-black h-3" />
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        <div className="grid grid-cols-2 gap-8 border border-black p-2">
          <div className="space-y-2">
             <div className="grid grid-cols-2 gap-2">
                <Row label="Paper Sets" value={data.aptitudePaperSet} />
                <Row label="Apti Marks" value={`${data.aptitudeMarks || 0} + ${data.techMarks || 0} = ${data.totalMarks || 0}`} />
             </div>
             <Row label="Programs Running" placeholder />
             <Row label="Database" placeholder />
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

      {/* Edit Overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] print-hidden">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase">Edit Evaluation Data</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-black font-bold">Close</button>
             </div>
             <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Aptitude Marks</label>
                    <input type="number" value={data.aptitudeMarks} onChange={e => setData({...data, aptitudeMarks: e.target.value})} className="w-full text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Technical Marks</label>
                    <input type="number" value={data.techMarks} onChange={e => setData({...data, techMarks: e.target.value})} className="w-full text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Paper Set</label>
                    <input type="text" value={data.aptitudePaperSet} onChange={e => setData({...data, aptitudePaperSet: e.target.value})} className="w-full text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Shortlisted</label>
                    <select value={data.isShortlistedAptitude ? 'true' : 'false'} onChange={e => setData({...data, isShortlistedAptitude: e.target.value === 'true'})} className="w-full text-sm font-bold">
                       <option value="true">YES</option>
                       <option value="false">NO</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-xs font-black uppercase mb-4 text-gray-400">Campaign Details</h3>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Applied Job Title (Campaign)</label>
                    <input type="text" value={data.campaign?.title} onChange={e => setData({...data, campaign: {...data.campaign, title: e.target.value}})} className="w-full text-sm font-bold" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-xs font-black uppercase mb-4 text-gray-400">Candidate Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Name</label>
                      <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Mobile</label>
                      <input type="text" value={data.mobile} onChange={e => setData({...data, mobile: e.target.value})} className="w-full text-sm font-bold" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 mt-6">Save & Refresh Sheet</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

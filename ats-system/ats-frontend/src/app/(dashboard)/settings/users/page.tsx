'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  X, 
  CheckCircle2, 
  Lock,
  Search,
  Eye,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  alias: string;
  permissions: any;
}

const MODULES = [
  { id: 'jobs', name: 'Job Openings' },
  { id: 'candidates', name: 'Talent Pool' },
  { id: 'interviews', name: 'Assessments' },
  { id: 'settings', name: 'System Config' },
];

export default function UsersControlPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'RECRUITER',
    permissions: { 
      globalSettingsAccess: false,
      modules: {
        jobs: { canUse: true, canEdit: false, canManageSettings: false },
        candidates: { canUse: true, canEdit: false, canManageSettings: false },
        interviews: { canUse: true, canEdit: false, canManageSettings: false }
      }
    }
  });

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleModulePermissionChange = (moduleId: string, field: 'canUse' | 'canEdit' | 'canManageSettings', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: {
          ...prev.permissions.modules,
          [moduleId]: { ...prev.permissions.modules[moduleId as keyof typeof prev.permissions.modules], [field]: value }
        }
      }
    }));
  };

  const handleGlobalSettingsChange = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: { ...prev.permissions, globalSettingsAccess: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/users', formData);
      setMessage({ type: 'success', text: 'User created successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          firstName: '', lastName: '', email: '', password: '', role: 'RECRUITER',
          permissions: { 
            globalSettingsAccess: false,
            modules: {
              jobs: { canUse: true, canEdit: false, canManageSettings: false },
              candidates: { canUse: true, canEdit: false, canManageSettings: false },
              interviews: { canUse: true, canEdit: false, canManageSettings: false }
            }
          }
        });
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">User & Control</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Permissions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Team Member</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Access Role</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Permissions Overview</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold animate-pulse">Loading team...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                      {user.firstName?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm">
                        {user.firstName ? `${user.firstName} ${user.lastName}` : 'System User'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 leading-none">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                    user.role === 'HIRING_MANAGER' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {user.permissions?.globalSettingsAccess && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center space-x-1">
                        <Settings size={8} />
                        <span>Settings</span>
                      </span>
                    )}
                    {Object.entries(user.permissions?.modules || {}).map(([id, p]: [string, any]) => (
                      <div key={id} className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 pr-2">
                        <span className="text-[8px] font-black uppercase text-gray-400 border-r border-slate-200 pr-1 mr-1">{id}</span>
                        <div className="flex items-center space-x-1">
                          {p.canUse && <div title="Can View/Use" className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {p.canEdit && <div title="Can Edit Data" className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {p.canManageSettings && <div title="Can Manage Settings" className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                          {!p.canUse && !p.canEdit && !p.canManageSettings && <X size={8} className="text-gray-200" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-3 text-right">
                  <button className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Add Team Member</h2>
                  <p className="text-gray-400 text-sm font-medium">Create a new user account and assign granular permissions.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-gray-600 shadow-sm border border-slate-200 transition-all active:scale-90">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {message.text && (
                  <div className={`p-4 rounded-2xl text-sm font-bold flex items-center space-x-2 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                    <span>{message.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full text-sm"
                      placeholder="e.g. Sarah"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full text-sm"
                      placeholder="e.g. Connor"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full text-sm font-bold text-blue-600"
                      placeholder="sarah@velocity.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Role</label>
                    <select 
                      className="w-full text-sm font-bold"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="RECRUITER">Recruiter</option>
                      <option value="HIRING_MANAGER">Hiring Manager</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                      type="password"
                      className="w-full pl-10 text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div>
                      <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Global Settings Access</h3>
                      <p className="text-[10px] text-blue-700 font-bold uppercase">Enable or deny access to the entire Settings section</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500"
                      checked={formData.permissions.globalSettingsAccess}
                      onChange={(e) => handleGlobalSettingsChange(e.target.checked)}
                    />
                  </div>

                  <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">Module Permissions</h3>
                  <div className="space-y-3">
                    {MODULES.filter(m => m.id !== 'settings').map(m => (
                      <div key={m.id} className="p-4 bg-gray-50 rounded-3xl border border-slate-200 flex items-center justify-between">
                        <div className="w-1/3">
                          <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{m.name}</span>
                        </div>
                        <div className="flex-1 flex justify-end space-x-6">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={formData.permissions.modules[m.id as keyof typeof formData.permissions.modules].canUse}
                              onChange={(e) => handleModulePermissionChange(m.id, 'canUse', e.target.checked)}
                            />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Use</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={formData.permissions.modules[m.id as keyof typeof formData.permissions.modules].canEdit}
                              onChange={(e) => handleModulePermissionChange(m.id, 'canEdit', e.target.checked)}
                            />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Edit</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={formData.permissions.modules[m.id as keyof typeof formData.permissions.modules].canManageSettings}
                              onChange={(e) => handleModulePermissionChange(m.id, 'canManageSettings', e.target.checked)}
                            />
                            <span className="text-[10px] font-black text-gray-500 uppercase">Settings</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                  >
                    {submitting ? 'Creating Account...' : 'Create User Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

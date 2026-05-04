'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Building, 
  ShieldCheck, 
  Bell, 
  LayoutGrid, 
  FileText, 
  LayoutDashboard, 
  Cpu, 
  Inbox, 
  Globe, 
  Users, 
  Zap, 
  Code2, 
  Database, 
  Trash2, 
  History,
  ChevronRight,
  Plus
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};

const item = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function SettingsPage() {
  const router = useRouter();

  const groups = [
    {
      name: 'General',
      items: [
        { title: 'Personal Settings', desc: 'Profile, display name, and credentials', icon: <User size={18}/>, color: 'blue', path: '/settings/personal' },
        { title: 'Company Details', desc: 'Business info and legal entity details', icon: <Building size={18}/>, color: 'indigo', path: '/settings/company' },
        { title: 'User and Control', desc: 'Roles, permissions, and team access', icon: <ShieldCheck size={18}/>, color: 'purple', path: '/settings/users' },
        { title: 'Notification Settings', desc: 'Email, push, and desktop alert preferences', icon: <Bell size={18}/>, color: 'orange', path: '/settings/notifications' },
      ]
    },
    {
      name: 'Recruitment',
      items: [
        { title: 'Interview Settings', desc: 'Departments, Positions, Levels & Feedback', icon: <Users size={18}/>, color: 'emerald', path: '/settings/interviews' },
        { title: 'Candidate Settings', desc: 'Statuses, Sources & Attachment Types', icon: <ShieldCheck size={18}/>, color: 'orange', path: '/settings/candidates' },
        { title: 'Portal Settings', desc: 'Career page styling and application forms', icon: <Globe size={18}/>, color: 'blue', path: '/settings/portal' },
        { title: 'Parser Mapping', desc: 'AI data extraction rules for resumes', icon: <Cpu size={18}/>, color: 'cyan', path: '/settings/parser' },
        { title: 'Resume Inbox', desc: 'Source email and direct upload integration', icon: <Inbox size={18}/>, color: 'rose', path: '/settings/inbox' },
      ]
    },
    {
      name: 'Customization',
      items: [
        { title: 'Modules', desc: 'Enable/disable core system features', icon: <LayoutGrid size={18}/>, color: 'pink', path: '/settings/modules' },
        { title: 'Templates', desc: 'Email, offer letter, and job presets', icon: <FileText size={18}/>, color: 'amber', path: '/settings/templates' },
        { title: 'Form Builder', desc: 'Customize application and registration fields', icon: <Plus size={18}/>, color: 'blue', path: '/settings/forms' },
        { title: 'Customize Home Page', desc: 'Dashboard widget and layout config', icon: <LayoutDashboard size={18}/>, color: 'violet', path: '/settings/home' },
        { title: 'Automation', desc: 'Workflow rules, triggers, and actions', icon: <Zap size={18}/>, color: 'yellow', path: '/settings/automation' },
      ]
    },
    {
      name: 'System',
      items: [
        { title: 'Developer Space', desc: 'API keys, Webhooks, and documentation', icon: <Code2 size={18}/>, color: 'slate', path: '/settings/developer' },
        { title: 'Storage', desc: 'Usage metrics and attachment management', icon: <Database size={18}/>, color: 'blue', path: '/settings/storage' },
        { title: 'Recycle Bin', desc: 'Recover deleted candidates and jobs', icon: <Trash2 size={18}/>, color: 'red', path: '/settings/recycle' },
        { title: 'Audit Trail', desc: 'System-wide history of admin actions', icon: <History size={18}/>, color: 'gray', path: '/settings/audit' },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Compact Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-black text-gray-900 tracking-tight border-r border-slate-200 pr-6">Setup</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Configuration Hub</p>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {groups.map((group) => (
          <section key={group.name} className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{group.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {group.items.map((section, i) => (
                <motion.div 
                  key={section.title}
                  variants={item}
                  whileHover={{ y: -2 }}
                  onClick={() => router.push(section.path)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl bg-${section.color}-50 text-${section.color}-600 group-hover:scale-110 transition-transform`}>
                      {section.icon}
                    </div>
                    <ChevronRight size={14} className="text-gray-200 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{section.title}</h3>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{section.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </motion.div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  LogOut,
  FileText,
  Columns,
  Calendar,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  userPermissions?: any;
}

const Sidebar = ({ isCollapsed, setIsCollapsed, userPermissions: initialPermissions }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({
    dashboard: true,
    pipeline: true,
    interviews: true,
    candidates: true,
    jobs: true,
    'activity-logs': true,
    settings: true,
    slots: true
  });
  const [userPermissions, setUserPermissions] = useState<any>(initialPermissions);

  useEffect(() => {
    if (initialPermissions) {
      setUserPermissions(initialPermissions);
    }
  }, [initialPermissions]);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Fetch Company Module Config
    api.get('/company')
      .then(res => {
        if (res.data.modulesConfig) {
          setEnabledModules(res.data.modulesConfig);
        }
      })
      .catch(err => console.error('Failed to load sidebar config', err));

    // 2. Fetch User Specific Permissions if not provided via props
    if (!initialPermissions) {
      api.get('/users/profile')
        .then(res => {
          setUserPermissions(res.data.permissions);
        })
        .catch(err => console.error('Failed to load user permissions', err));
    }
  }, [initialPermissions]);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'pipeline', name: 'Pipeline', path: '/pipeline', icon: <Columns size={20} /> },
    { id: 'interviews', name: 'Interviews', path: '/interviews', icon: <Calendar size={20} /> },
    { id: 'candidates', name: 'Candidates', path: '/candidates', icon: <Users size={20} /> },
    { id: 'jobs', name: 'Jobs', path: '/jobs', icon: <Briefcase size={20} /> },
    { id: 'walkins', name: 'Walk-ins', path: '/walkins', icon: <Zap size={20} /> },
    { id: 'slots', name: 'Slot Management', path: '/slots', icon: <Clock size={20} /> },
    { id: 'settings', name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  // Filter items based on backend config AND user permissions
  const visibleItems = menuItems.filter(item => {
    // 1. Check if module is globally enabled for the company
    if (enabledModules[item.id] === false) return false;

    // 2. Check user granular permissions
    if (!userPermissions) return true; // Default to showing until loaded

    // Special check for Settings
    if (item.id === 'settings') {
      return userPermissions.globalSettingsAccess === true;
    }

    // Check specific module usage right
    const modPerm = userPermissions.modules?.[item.id];
    if (modPerm && modPerm.canUse === false) return false;

    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="h-screen bg-[#0A2540] text-white flex flex-col flex-shrink-0 shadow-2xl z-50 overflow-hidden border-r border-white/5"
    >
      {/* Branding Section */}
      <div className={`relative flex flex-col items-center px-6 py-10 transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex flex-col items-center w-full relative z-10">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative cursor-pointer mb-6"
            onClick={() => router.push('/dashboard')}
          >
            <Image 
              src="/logo-white.png" 
              alt="Velocity" 
              width={isCollapsed ? 36 : 100} 
              height={isCollapsed ? 36 : 36} 
              className="object-contain" 
              priority 
            />
          </motion.div>

          <AnimatePresence mode='wait'>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl font-bold tracking-[0.3em] text-white">A</span>
                  <span className="text-xl font-bold tracking-[0.3em] text-white">T</span>
                  <span className="text-xl font-bold tracking-[0.3em] text-white/40">S</span>
                </div>
                {/* Minimal White Accent Bar */}
                <div className="w-12 h-[2px] bg-white/20 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                whileHover={{ x: 4, backgroundColor: isActive ? "" : "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 rounded-xl transition-all cursor-pointer group relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'} transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-xs uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isCollapsed && (
                  <div className="absolute left-20 bg-[#0A2540] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[60] border border-white/10 shadow-2xl">
                    {item.name}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <AnimatePresence>
          {!isCollapsed && mounted && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-4 px-2 leading-relaxed opacity-50"
            >
              © {new Date().getFullYear()} Velocity Software Solutions
            </motion.p>
          )}
        </AnimatePresence>
        <button
          onClick={handleLogout}
          className={`flex items-center p-3 w-full text-left text-slate-400 hover:text-rose-400 transition-all rounded-xl hover:bg-rose-400/5 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="font-bold text-[10px] uppercase tracking-widest">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

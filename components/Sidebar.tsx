import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { DashboardIcon, PopulationIcon, ActivityIcon, SocialAidIcon, DocumentIcon, AiIcon, LogoutIcon, SigmaIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    { path: '/population', label: 'Kependudukan', icon: PopulationIcon },
    { path: '/activities', label: 'Kegiatan', icon: ActivityIcon },
    { path: '/social-aid', label: 'Bantuan Sosial', icon: SocialAidIcon },
    { path: '/documents', label: 'Berkas', icon: DocumentIcon },
    { path: '/ai-assistant', label: 'Asisten AI', icon: AiIcon },
  ];

  const pageTitles: { [key: string]: string } = {
    '/': 'Dashboard',
    '/population': 'Manajemen Kependudukan',
    '/activities': 'Manajemen Kegiatan',
    '/social-aid': 'Bantuan Sosial',
    '/documents': 'Administrasi Berkas',
    '/ai-assistant': 'Asisten AI Cerdas'
  };

  React.useEffect(() => {
    onNavigate(pageTitles[location.pathname] || 'Dashboard');
  }, [location.pathname, onNavigate]);

  return (
    <div className="w-20 md:w-64 bg-secondary text-light flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start md:pl-4 h-20 border-b border-primary">
        <SigmaIcon className="h-9 w-9 flex-shrink-0" />
        <div className="hidden md:block ml-2">
          <h1 className="text-lg font-bold tracking-wider text-light leading-tight">SIGMA</h1>
          <p className="text-xs tracking-wider text-medium leading-tight">DEVELOPMENT</p>
        </div>
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-accent text-secondary' : 'hover:bg-primary'
              }`
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="hidden md:block ml-4 font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-2 md:px-4 py-4 border-t border-primary">
        <div className="flex items-center p-3 rounded-lg">
          <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=38BDF8&color=0F172A`} alt="User" className="h-10 w-10 rounded-full" />
          <div className="hidden md:block ml-4">
            <p className="font-semibold">{user?.name || 'Operator'}</p>
            <p className="text-xs text-medium">{user?.role || 'Admin Desa'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center p-3 mt-2 w-full rounded-lg transition-colors duration-200 text-medium hover:bg-red-500/20 hover:text-red-400"
        >
          <LogoutIcon className="h-6 w-6" />
          <span className="hidden md:block ml-4 font-semibold">Logout</span>
        </button>
        <div className="hidden md:block text-center mt-6">
          <p className="text-xs text-medium/70">© {new Date().getFullYear()} SIGMA DEVELOPMENT</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
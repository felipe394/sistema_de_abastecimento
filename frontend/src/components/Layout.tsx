import { useState } from 'react';
import { Menu, X, LayoutDashboard, Calculator, FileUp, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Calculator, label: 'Análise de ATMs', path: '/analysis' },
  { icon: FileUp, label: 'Importação', path: '/import' },
  { icon: Users, label: 'Usuários', path: '/users', adminOnly: true },
  { icon: Settings, label: 'Custódias', path: '/custodies', adminOnly: true },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Hardcoded for UI visualization, later from auth context
  const isAdmin = true; 

  const handleLogout = () => {
    // Aqui no futuro você limpa o token (ex: localStorage.removeItem('token'))
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col`}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="h-20 flex items-center justify-center px-6 border-b border-slate-100">
            <div className="flex items-center space-x-4">
              <img src={logoImage} alt="Logo" className="h-12 w-auto object-contain" />
              <span className="text-xl font-medium text-primary-900 tracking-widest uppercase font-serif">
                ATMs supply
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {sidebarItems.filter(i => !i.adminOnly || isAdmin).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group font-bold ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                      : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-bold text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 flex-1 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } min-h-screen flex flex-col bg-slate-50`}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center px-6 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-primary-600 uppercase tracking-wide">
              Sistema de Abastecimento
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary-900">Admin User</p>
              <p className="text-xs text-slate-500">admin@system.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shadow-sm border border-primary-200">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

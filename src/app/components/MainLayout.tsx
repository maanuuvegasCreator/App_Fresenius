import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Phone,
  Activity,
  Settings,
  Users,
  UsersRound,
  Hash,
  LogOut,
  ChevronDown,
  BarChart3,
  Circle,
  BookOpen,
  Headset,
} from 'lucide-react';
import { cn } from './ui/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import logoThinkia from '../../imports/Logo_Thinkia_Light.svg';
import { DashboardEscalationsProvider } from '@/context/DashboardEscalationsContext';
import { DashboardSocketBridge } from './DashboardSocketBridge';

interface MainLayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    icon: Phone,
    label: 'Centro de Llamadas',
    path: '/dashboard',
  },
  {
    icon: Headset,
    label: 'Marcador Twilio',
    path: '/agent-desk',
  },
  {
    icon: BookOpen,
    label: 'Contactos',
    path: '/contacts',
  },
  {
    icon: Hash,
    label: 'Números',
    path: '/numbers',
  },
  {
    icon: UsersRound,
    label: 'Usuarios y Equipos',
    path: '/teams',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
  },
  {
    icon: Activity,
    label: 'Historial de llamadas',
    path: '/call-history',
  },
  {
    icon: Settings,
    label: 'Configuración',
    path: '/settings',
  },
];

type UserStatus = 'available' | 'unavailable' | 'do-not-disturb' | 'be-right-back' | 'appear-away';

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userStatus, setUserStatus] = useState<UserStatus>('available');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === '/dashboard' || path === '/agent-desk') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case 'available':
        return { label: 'DISPONIBLE', color: 'emerald', bgColor: 'bg-emerald-500', borderColor: 'border-emerald-500', textColor: 'text-emerald-600' };
      case 'unavailable':
        return { label: 'NO DISPONIBLE', color: 'red', bgColor: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-600' };
      case 'do-not-disturb':
        return { label: 'NO MOLESTAR', color: 'red', bgColor: 'bg-red-500', borderColor: 'border-red-500', textColor: 'text-red-600' };
      case 'be-right-back':
        return { label: 'VUELVO ENSEGUIDA', color: 'yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500', textColor: 'text-yellow-600' };
      case 'appear-away':
        return { label: 'APARECER COMO AUSENTE', color: 'yellow', bgColor: 'bg-yellow-500', borderColor: 'border-yellow-500', textColor: 'text-yellow-600' };
    }
  };

  const currentStatusConfig = getStatusConfig(userStatus);

  return (
    <DashboardEscalationsProvider>
      <DashboardSocketBridge />
    <div className="size-full flex bg-background">
      {/* Main Sidebar */}
      <div className="w-64 min-w-64 border-r flex flex-col bg-white flex-shrink-0">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-6 border-b">
          <img src={logoThinkia} alt="Thinkia" className="h-10" style={{ filter: 'invert(1) brightness(0.2)' }} />
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-xl mb-2',
                  isActive
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className={`w-full flex items-center gap-3 mb-4 px-3 py-3 bg-slate-50 rounded-lg border-l-4 ${currentStatusConfig.borderColor} hover:bg-slate-100 transition-colors cursor-pointer`}
            >
              <div className="relative">
                <Avatar className={`h-10 w-10 ${currentStatusConfig.bgColor.replace('bg-', 'bg-')}-100`}>
                  <AvatarFallback className={`${currentStatusConfig.bgColor.replace('bg-', 'bg-')}-100 ${currentStatusConfig.textColor} text-sm font-semibold`}>A</AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 h-3 w-3 ${currentStatusConfig.bgColor} rounded-full border-2 border-white`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-900 truncate">agente_thinkia.com</p>
                <p className={`text-xs ${currentStatusConfig.textColor} font-semibold`}>{currentStatusConfig.label}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Status Menu Dropdown */}
            {isStatusMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusMenuOpen(false)} />
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border z-50 py-2">
                  <div className="px-3 py-2 border-b">
                    <p className="text-xs text-gray-500 font-medium uppercase">Estado</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserStatus('available');
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-3 text-left"
                  >
                    <Circle className="h-3 w-3 fill-current text-green-500" />
                    <span className="text-sm text-gray-900">Disponible</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserStatus('unavailable');
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-3 text-left"
                  >
                    <Circle className="h-3 w-3 fill-current text-red-500" />
                    <span className="text-sm text-gray-900">No disponible</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserStatus('do-not-disturb');
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-3 text-left"
                  >
                    <Circle className="h-3 w-3 fill-current text-red-500" />
                    <span className="text-sm text-gray-900">No molestar</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserStatus('be-right-back');
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-3 text-left"
                  >
                    <Circle className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-sm text-gray-900">Vuelvo enseguida</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserStatus('appear-away');
                      setIsStatusMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center gap-3 text-left"
                  >
                    <Circle className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-sm text-gray-900">Aparecer como ausente</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm h-10 gap-2"
            onClick={() => navigate('/')}
          >
            <LogOut className="h-4 w-4" />
            Finalizar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
    </DashboardEscalationsProvider>
  );
}
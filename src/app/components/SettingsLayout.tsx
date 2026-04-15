import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Settings as SettingsIcon,
  Plug
} from 'lucide-react';
import { cn } from './ui/utils';
import { Button } from './ui/button';

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsMenuItems = [
  {
    icon: SettingsIcon,
    label: 'Configuración',
    path: '/settings/call-settings',
  },
  {
    icon: Plug,
    label: 'Integraciones',
    path: '/settings/integrations',
  },
];

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="size-full flex bg-background">
      {/* Settings Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/dashboard')}
          >
            ← Volver al Dashboard
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          {settingsMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

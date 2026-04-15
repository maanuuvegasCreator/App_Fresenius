import { Phone, Users, Settings, Circle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface NumberCardProps {
  id: string;
  name: string;
  number: string;
  country: string;
  countryCode: string;
  status: 'active' | 'closed' | 'open';
  assignedUsers?: number;
}

const countryFlags: Record<string, string> = {
  AU: '🇦🇺',
  BE: '🇧🇪',
  CA: '🇨🇦',
  IE: '🇮🇪',
  ES: '🇪🇸',
  US: '🇺🇸',
  MX: '🇲🇽',
  GB: '🇬🇧',
};

export function NumberCard({ name, number, country, countryCode, status, assignedUsers = 0 }: NumberCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: 'En horario laboral',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        };
      case 'closed':
        return {
          label: 'Fuera de horario',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
        };
      case 'open':
        return {
          label: 'Siempre abierto',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        };
      default:
        return {
          label: 'Siempre cerrado',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl">{countryFlags[countryCode] || '🌐'}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{number}</p>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className={`h-2 w-2 fill-current ${statusConfig.color}`} />
          <span className="text-sm text-muted-foreground">{statusConfig.label}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{assignedUsers}</span>
        </div>
      </div>
    </Card>
  );
}

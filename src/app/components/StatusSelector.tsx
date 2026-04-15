import { Circle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface StatusSelectorProps {
  status: 'available' | 'unavailable' | 'do-not-disturb' | 'be-right-back' | 'appear-away';
  onStatusChange: (status: 'available' | 'unavailable' | 'do-not-disturb' | 'be-right-back' | 'appear-away') => void;
}

export function StatusSelector({ status, onStatusChange }: StatusSelectorProps) {
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'available':
        return 'text-green-500';
      case 'unavailable':
      case 'do-not-disturb':
        return 'text-red-500';
      case 'be-right-back':
      case 'appear-away':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'available':
        return 'Disponible';
      case 'unavailable':
        return 'No disponible';
      case 'do-not-disturb':
        return 'No molestar';
      case 'be-right-back':
        return 'Vuelvo enseguida';
      case 'appear-away':
        return 'Aparecer como ausente';
      default:
        return 'Desconocido';
    }
  };

  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger className="w-full">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Circle className={`h-3 w-3 fill-current ${getStatusColor(status)}`} />
            <span>{getStatusLabel(status)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="available">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-green-500" />
            <span>Disponible</span>
          </div>
        </SelectItem>
        <SelectItem value="unavailable">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-red-500" />
            <span>No disponible</span>
          </div>
        </SelectItem>
        <SelectItem value="do-not-disturb">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-red-500" />
            <span>No molestar</span>
          </div>
        </SelectItem>
        <SelectItem value="be-right-back">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-yellow-500" />
            <span>Vuelvo enseguida</span>
          </div>
        </SelectItem>
        <SelectItem value="appear-away">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-yellow-500" />
            <span>Aparecer como ausente</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
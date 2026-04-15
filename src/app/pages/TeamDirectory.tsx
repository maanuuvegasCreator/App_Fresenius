import { useState } from 'react';
import { Search, Phone } from 'lucide-react';
import { MainLayout } from '../components/MainLayout';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'unavailable';
  lastUpdate: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@thinkia.com',
    status: 'available',
    lastUpdate: '8/4, 15:54',
  },
  {
    id: '2',
    name: 'Javier Ruiz',
    email: 'javier.ruiz@thinkia.com',
    status: 'unavailable',
    lastUpdate: '8/4, 18:32',
  },
  {
    id: '3',
    name: 'Pedro Ramírez',
    email: 'pedro.ramirez@thinkia.com',
    status: 'unavailable',
    lastUpdate: '8/4, 15:54',
  },
  {
    id: '4',
    name: 'Elena Fernández',
    email: 'elena.fernandez@thinkia.com',
    status: 'available',
    lastUpdate: '8/4, 15:54',
  },
  {
    id: '5',
    name: 'Carmen Rodríguez',
    email: 'carmen.rodriguez@thinkia.com',
    status: 'available',
    lastUpdate: '8/4, 15:54',
  },
  {
    id: '6',
    name: 'Ana Martínez',
    email: 'ana.martinez@thinkia.com',
    status: 'available',
    lastUpdate: '8/4, 15:54',
  },
  {
    id: '7',
    name: 'Diego López',
    email: 'diego.lopez@thinkia.com',
    status: 'available',
    lastUpdate: '8/4, 18:30',
  },
];

export function TeamDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const availableCount = teamMembers.filter((m) => m.status === 'available').length;
  const unavailableCount = teamMembers.filter((m) => m.status === 'unavailable').length;

  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-semibold mb-1">Directorio del Equipo</h1>
          <p className="text-sm text-muted-foreground">
            Estado de presencia en tiempo real y acceso directo a llamadas internas.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-4">Usuarios</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gestiona presencia y llamadas internas en tiempo real.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar agente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="unavailable">No disponible</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 text-sm">
                <span className="px-3 py-2 bg-muted rounded-md">
                  {availableCount} disponibles
                </span>
                <span className="px-3 py-2 bg-muted rounded-md">
                  {unavailableCount} agentes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    NOMBRE
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    DISPONIBILIDAD
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    ACTUALIZADO
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    ACCIÓN
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className={getAvatarColor(member.name)}>
                          <AvatarFallback className="text-white">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={member.status === 'available' ? 'default' : 'secondary'}
                        className={
                          member.status === 'available'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-red-100 text-red-700 hover:bg-red-100'
                        }
                      >
                        {member.status === 'available' ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {member.lastUpdate}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

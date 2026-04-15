import { useState } from 'react';
import { Search, Plus, X, MoreVertical, Phone, Users as UsersIcon, Mail, ChevronDown, Clock, Upload, Lock, Globe, Hash, User, Bell, PhoneForwarded, Volume2, Timer, ChevronLeft } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { UserSettingsDialog } from '../components/UserSettingsDialog';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'administrador' | 'supervisor' | 'agente';
  availability: 'accept' | 'auto' | 'unavailable';
  phone?: string;
  team?: string;
  lastUpdated?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  assignedNumbers: string[];
}

const mockTeams: Team[] = [
  {
    id: '2',
    name: 'Atención al Cliente',
    description: 'Equipo de atención y soporte a clientes',
    members: [
      {
        id: 'm4',
        name: 'Laura Sánchez',
        email: 'laura.sanchez@thinkia.com',
        role: 'administrador',
        availability: 'accept',
        phone: '+34 912 345 601',
        lastUpdated: 'Hace 5 minutos',
      },
      {
        id: 'm5',
        name: 'Javier Ruiz',
        email: 'javier.ruiz@thinkia.com',
        role: 'supervisor',
        availability: 'auto',
        phone: '+34 912 345 602',
        lastUpdated: 'Hace 1 hora',
      },
      {
        id: 'm11',
        name: 'Pedro Ramírez',
        email: 'pedro.ramirez@thinkia.com',
        role: 'agente',
        availability: 'unavailable',
        phone: '+34 912 345 603',
        lastUpdated: 'Hace 3 horas',
      },
      {
        id: 'm12',
        name: 'Elena Fernández',
        email: 'elena.fernandez@thinkia.com',
        role: 'agente',
        availability: 'accept',
        phone: '+34 912 345 604',
        lastUpdated: 'Hace 30 minutos',
      },
    ],
    assignedNumbers: ['+34 915 678 901', '+52 55 1238 4573'],
  },
  {
    id: '1',
    name: 'Enfermería',
    description: 'Equipo de personal de enfermería',
    members: [
      {
        id: 'm1',
        name: 'Carmen Rodríguez',
        email: 'carmen.rodriguez@thinkia.com',
        role: 'administrador',
        availability: 'accept',
        phone: '+34 919 49 62 01',
        lastUpdated: 'Hace 10 minutos',
      },
      {
        id: 'm2',
        name: 'Ana Martínez',
        email: 'ana.martinez@thinkia.com',
        role: 'supervisor',
        availability: 'accept',
        phone: '+34 919 49 62 02',
        lastUpdated: 'Hace 2 horas',
      },
      {
        id: 'm3',
        name: 'Diego López',
        email: 'diego.lopez@thinkia.com',
        role: 'agente',
        availability: 'auto',
        phone: '+34 919 49 62 03',
        lastUpdated: 'Hace 45 minutos',
      },
      {
        id: 'm10',
        name: 'Isabel Moreno',
        email: 'isabel.moreno@thinkia.com',
        role: 'agente',
        availability: 'accept',
        phone: '+34 919 49 62 04',
        lastUpdated: 'Hace 1 día',
      },
    ],
    assignedNumbers: ['+34 912 345 678', '+34 919 49 62 88'],
  },
];

// Extraer todos los usuarios de los equipos
const getAllUsers = (teams: Team[]): (TeamMember & { teamName: string })[] => {
  const users: (TeamMember & { teamName: string })[] = [];
  teams.forEach((team) => {
    team.members.forEach((member) => {
      users.push({
        ...member,
        teamName: team.name,
      });
    });
  });
  return users;
};

export function Teams() {
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<(TeamMember & { teamName: string }) | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'administrador' | 'supervisor' | 'agente'>('agente');
  const [editingMember, setEditingMember] = useState<{ teamId: string; memberId: string } | null>(null);
  const [tempAvailability, setTempAvailability] = useState<'accept' | 'auto' | 'unavailable'>('accept');

  const allUsers = getAllUsers(teams);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: newTeamName,
        description: newTeamDescription,
        members: [],
        assignedNumbers: [],
      };
      setTeams([...teams, newTeam]);
      setNewTeamName('');
      setNewTeamDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleAddMember = (teamId: string) => {
    if (newMemberName.trim() && newMemberEmail.trim()) {
      const updatedTeams = teams.map((team) => {
        if (team.id === teamId) {
          const newMember: TeamMember = {
            id: Date.now().toString(),
            name: newMemberName,
            email: newMemberEmail,
            role: newMemberRole,
            availability: 'unavailable',
            lastUpdated: 'Ahora',
          };
          return {
            ...team,
            members: [...team.members, newMember],
          };
        }
        return team;
      });
      setTeams(updatedTeams);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberRole('agente');
      setIsAddMemberDialogOpen(false);
      if (selectedTeam) {
        const updatedTeam = updatedTeams.find((t) => t.id === teamId);
        if (updatedTeam) setSelectedTeam(updatedTeam);
      }
    }
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.filter((m) => m.id !== memberId),
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    if (selectedTeam && selectedTeam.id === teamId) {
      const updatedTeam = updatedTeams.find((t) => t.id === teamId);
      if (updatedTeam) setSelectedTeam(updatedTeam);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter((t) => t.id !== teamId));
    if (selectedTeam?.id === teamId) {
      setSelectedTeam(null);
    }
  };

  const handleChangeAvailability = (teamId: string, memberId: string, newAvailability: 'accept' | 'auto' | 'unavailable') => {
    const updatedTeams = teams.map((team) => {
      if (team.id === teamId) {
        return {
          ...team,
          members: team.members.map((m) =>
            m.id === memberId ? { ...m, availability: newAvailability, lastUpdated: 'Ahora' } : m
          ),
        };
      }
      return team;
    });
    setTeams(updatedTeams);
    if (selectedTeam && selectedTeam.id === teamId) {
      const updatedTeam = updatedTeams.find((t) => t.id === teamId);
      if (updatedTeam) setSelectedTeam(updatedTeam);
    }
    setEditingMember(null);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'accept':
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Disponible</span>
          </div>
        );
      case 'auto':
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-blue-700">Automático</span>
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm font-medium text-red-700">No disponible</span>
          </div>
        );
      default:
        return <Badge>{availability}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrador':
        return (
          <div>
            <div className="text-sm font-medium">ADMINISTRADOR</div>
            <div className="text-xs text-muted-foreground">Supervisión y configuración</div>
          </div>
        );
      case 'supervisor':
        return (
          <div>
            <div className="text-sm font-medium">SUPERVISOR</div>
            <div className="text-xs text-muted-foreground">Reporting y equipos</div>
          </div>
        );
      case 'agente':
        return (
          <div>
            <div className="text-sm font-medium">AGENTE</div>
            <div className="text-xs text-muted-foreground">Llamadas y conversación</div>
          </div>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header con pestañas */}
      <div className="border-b">
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-2xl font-semibold mb-4">Usuarios y Equipos</h1>
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'teams'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Equipos
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'users' ? (
        /* Vista de Usuarios */
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Todos los Usuarios</h2>
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="text-white hover:opacity-90"
                    style={{ backgroundColor: '#03091D' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir nuevo usuario</DialogTitle>
                    <DialogDescription>
                      Crea un nuevo usuario en el sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Nombre completo</Label>
                      <Input
                        id="user-name"
                        placeholder="ej. Juan Pérez"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="juan.perez@thinkia.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-phone">Teléfono</Label>
                      <Input
                        id="user-phone"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-team">Equipo</Label>
                      <Select>
                        <SelectTrigger id="user-team">
                          <SelectValue placeholder="Selecciona un equipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Rol</Label>
                      <Select defaultValue="agente">
                        <SelectTrigger id="user-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agente">Agente</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="administrador">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button className="text-white hover:opacity-90" style={{ backgroundColor: '#03091D' }}>
                      Crear usuario
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar usuarios por nombre, email o equipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="bg-white">
              <table className="w-full">
                <thead className="border-b bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Usuario
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Email
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Equipo
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Rol
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Disponibilidad
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                      Última actualización
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={`${user.teamName}-${user.id}`} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <span className="font-medium" style={{ color: '#001963' }}>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline">{user.teamName}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-6">
                        {getAvailabilityBadge(user.availability)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {user.lastUpdated || 'Sin actualizar'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            onClick={() => {
                              if (user.phone) {
                                window.location.href = `tel:${user.phone}`;
                              }
                            }}
                          >
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Llamar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedUserForProfile(user);
                              setIsProfileDialogOpen(true);
                            }}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex bg-gray-50">
          {/* Teams List */}
          <div className="w-96 bg-white border-r flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Equipos</h2>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: '#03091D' }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear nuevo equipo</DialogTitle>
                      <DialogDescription>
                        Los equipos trabajan juntos y se añaden a teléfonos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Nombre del equipo</Label>
                        <Input
                          id="team-name"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          placeholder="ej. Soporte Técnico"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team-description">Descripción</Label>
                        <Input
                          id="team-description"
                          value={newTeamDescription}
                          onChange={(e) => setNewTeamDescription(e.target.value)}
                          placeholder="Descripción del equipo"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateTeam} className="text-white hover:opacity-90" style={{ backgroundColor: '#03091D' }}>
                        Crear equipo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar equipos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full p-4 border-b text-left hover:bg-gray-50 transition-colors ${
                    selectedTeam?.id === team.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{team.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {team.members.length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{team.description}</p>
                  {team.assignedNumbers.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {team.assignedNumbers.length} número{team.assignedNumbers.length > 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              ))}
              {filteredTeams.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No se encontraron equipos
                </div>
              )}
            </div>
          </div>

          {/* Team Details */}
          <div className="flex-1 flex flex-col">
            {selectedTeam ? (
              <>
                <div className="bg-white border-b p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold">{selectedTeam.name}</h2>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar equipo</DropdownMenuItem>
                            <DropdownMenuItem>Asignar números</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteTeam(selectedTeam.id)}
                            >
                              Eliminar equipo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-muted-foreground mb-4">{selectedTeam.description}</p>
                      
                      {selectedTeam.assignedNumbers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedTeam.assignedNumbers.map((number, idx) => (
                            <Badge key={idx} variant="outline" className="gap-1">
                              <Phone className="h-3 w-3" />
                              {number}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Miembros ({selectedTeam.members.length})
                    </h3>
                    <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir persona
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Añadir miembro al equipo</DialogTitle>
                          <DialogDescription>
                            En los usuarios puedes definir si están disponibles
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="member-name">Nombre completo</Label>
                            <Input
                              id="member-name"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              placeholder="ej. Juan Pérez"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-email">Email</Label>
                            <Input
                              id="member-email"
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="juan.perez@thinkia.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="member-role">Rol</Label>
                            <Select value={newMemberRole} onValueChange={(value: 'administrador' | 'supervisor' | 'agente') => setNewMemberRole(value)}>
                              <SelectTrigger id="member-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="agente">Agente</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="administrador">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleAddMember(selectedTeam.id)}
                            className="text-white hover:opacity-90"
                            style={{ backgroundColor: '#03091D' }}
                          >
                            Añadir miembro
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="bg-white">
                    <table className="w-full">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                            Usuario
                          </th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                            Email
                          </th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                            Rol
                          </th>
                          <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                            Disponibilidad
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTeam.members.map((member) => (
                          <tr key={member.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                                    {getInitials(member.name)}
                                  </span>
                                </div>
                                <span className="font-medium" style={{ color: '#001963' }}>{member.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-muted-foreground">
                              {member.email}
                            </td>
                            <td className="py-4 px-6">
                              {getRoleBadge(member.role)}
                            </td>
                            <td className="py-4 px-6">
                              {editingMember?.teamId === selectedTeam.id && editingMember?.memberId === member.id ? (
                                <Dialog
                                  open={true}
                                  onOpenChange={(open) => {
                                    if (!open) setEditingMember(null);
                                  }}
                                >
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Cambiar disponibilidad</DialogTitle>
                                      <DialogDescription>
                                        Selecciona el estado de disponibilidad para {member.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 py-4">
                                      <button
                                        onClick={() => {
                                          handleChangeAvailability(selectedTeam.id, member.id, 'accept');
                                        }}
                                        className="w-full p-4 border-2 rounded-lg text-left hover:border-green-500 hover:bg-green-50 transition-colors"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="h-3 w-3 rounded-full bg-green-500" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-gray-900">Disponible</h4>
                                            <p className="text-sm text-gray-600">Listo para recibir llamadas</p>
                                          </div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleChangeAvailability(selectedTeam.id, member.id, 'auto');
                                        }}
                                        className="w-full p-4 border-2 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-gray-900">Automático</h4>
                                            <p className="text-sm text-gray-600">Basado en horario laboral programado</p>
                                          </div>
                                        </div>
                                      </button>

                                      <button
                                        onClick={() => {
                                          handleChangeAvailability(selectedTeam.id, member.id, 'unavailable');
                                        }}
                                        className="w-full p-4 border-2 rounded-lg text-left hover:border-red-500 hover:bg-red-50 transition-colors"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="h-3 w-3 rounded-full bg-red-500" />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-gray-900">No disponible</h4>
                                            <p className="text-sm text-gray-600">No puede recibir llamadas</p>
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : null}
                              {getAvailabilityBadge(member.availability)}
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMember({ teamId: selectedTeam.id, memberId: member.id });
                                    }}
                                  >
                                    Cambiar disponibilidad
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Editar permisos</DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                                  >
                                    Eliminar del equipo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Selecciona un equipo para ver sus miembros</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Diálogo de configuración de perfil */}
      {isProfileDialogOpen && selectedUserForProfile && (
        <UserSettingsDialog
          user={selectedUserForProfile}
          teams={teams.map(t => ({ id: t.id, name: t.name }))}
          onClose={() => setIsProfileDialogOpen(false)}
          onSave={() => {
            // Aquí se guardarían los cambios
            setIsProfileDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
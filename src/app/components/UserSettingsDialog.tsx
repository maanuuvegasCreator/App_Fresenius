import { useState } from 'react';
import { ChevronLeft, Upload, Bell, PhoneForwarded, Clock, Calendar, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'administrador' | 'supervisor' | 'agente';
  availability: 'accept' | 'auto' | 'unavailable';
  phone?: string;
  team?: string;
  lastUpdated?: string;
  teamName?: string;
}

interface Team {
  id: string;
  name: string;
}

type TabType = 'general' | 'availability' | 'preferences';

interface UserSettingsDialogProps {
  user: TeamMember;
  teams: Team[];
  onClose: () => void;
  onSave: () => void;
  onChangeRole?: (role: 'administrador' | 'supervisor' | 'agente') => void;
  onChangeAvailability?: (availability: 'accept' | 'unavailable' | 'auto' | 'do-not-disturb' | 'be-right-back' | 'appear-away') => void;
  onChangeTeam?: (teamId: string) => void;
  onDelete?: () => void;
}

export function UserSettingsDialog({ user, teams, onClose, onSave, onChangeRole, onChangeAvailability, onChangeTeam, onDelete }: UserSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [firstName, setFirstName] = useState(user.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [vacationName, setVacationName] = useState('');
  const [vacationStartDate, setVacationStartDate] = useState('');
  const [vacationEndDate, setVacationEndDate] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'availability', label: 'Disponibilidad' },
    { id: 'preferences', label: 'Preferencias de llamada' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-8 overflow-y-auto" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mb-8">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="font-semibold" style={{ color: '#001963' }}>
                  {getInitials(user.name)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#001963' }}>{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 border-b -mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`pb-3 border-b-2 transition-colors text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Perfil</h3>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="extension">Extensión</Label>
                  <Input id="extension" placeholder="815" />
                </div>

                {/* Personal Information */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Información Personal</h4>
                  
                  <div className="flex gap-6 mb-4">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-semibold" style={{ color: '#001963' }}>
                            {getInitials(user.name)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Nombre"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-teal-600 cursor-pointer hover:text-teal-700">
                    <Upload className="h-4 w-4" />
                    <span>Subir foto</span>
                  </div>
                </div>
              </div>

              {/* Roles & Permissions */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Roles y Permisos</h3>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Selecciona un rol</div>

                  {/* Agent Role */}
                  <button
                    onClick={() => onChangeRole?.('agente')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      user.role === 'agente'
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Agent</span>
                          {user.role === 'agente' && (
                            <Badge variant="secondary" className="text-xs">Rol actual</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Acceso para gestionar llamadas y conversaciones</p>
                      </div>
                      {user.role === 'agente' && (
                        <input type="radio" name="role" checked readOnly className="mt-1" />
                      )}
                    </div>
                  </button>

                  {/* Supervisor Role */}
                  <button
                    onClick={() => onChangeRole?.('supervisor')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      user.role === 'supervisor'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Supervisor</span>
                          {user.role === 'supervisor' && (
                            <Badge variant="secondary" className="text-xs">Rol actual</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Rol de agente + Acceso a llamadas de equipo y reportes</p>
                      </div>
                      {user.role === 'supervisor' && (
                        <input type="radio" name="role" checked readOnly className="mt-1" />
                      )}
                    </div>
                  </button>

                  {/* Admin Role */}
                  <button
                    onClick={() => onChangeRole?.('administrador')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                      user.role === 'administrador'
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Admin</span>
                          {user.role === 'administrador' && (
                            <Badge variant="secondary" className="text-xs">Rol actual</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Rol de supervisor + Gestión de configuración, usuarios y números</p>
                      </div>
                      {user.role === 'administrador' && (
                        <input type="radio" name="role" checked readOnly className="mt-1" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Cambiar disponibilidad */}
                  <div className="p-4 border rounded-lg">
                    <Label className="mb-3 block font-semibold">Disponibilidad</Label>
                    <Select
                      value={user.availability}
                      onValueChange={(value) => onChangeAvailability?.(value as 'accept' | 'unavailable' | 'auto' | 'do-not-disturb' | 'be-right-back' | 'appear-away')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accept">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Disponible</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="unavailable">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>No disponible</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="do-not-disturb">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>No molestar</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="be-right-back">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span>Vuelvo enseguida</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="appear-away">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span>Aparecer como ausente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cambiar equipo */}
                  <div className="p-4 border rounded-lg">
                    <Label className="mb-3 block font-semibold">Equipo</Label>
                    <Select
                      defaultValue={teams.find(t => t.name === user.teamName)?.id}
                      onValueChange={(value) => onChangeTeam?.(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={user.teamName || 'Seleccionar equipo'} />
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
                </div>

                {/* Eliminar usuario */}
                {!showDeleteConfirm ? (
                  <Button
                    size="sm"
                    className="mt-4 text-white"
                    style={{ backgroundColor: '#03091D' }}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Eliminar usuario
                  </Button>
                ) : (
                  <div className="mt-4 p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                      ¿Estás seguro de que quieres eliminar a <strong>{user.name}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: '#03091D' }}
                        onClick={() => {
                          onDelete?.();
                          onClose();
                        }}
                      >
                        Confirmar eliminación
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Disponibilidad</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => onChangeAvailability?.('accept')}
                    className={`w-full p-2 border rounded-md text-left transition-colors ${
                      user.availability === 'accept'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">Disponible</h4>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeAvailability?.('unavailable')}
                    className={`w-full p-2 border rounded-md text-left transition-colors ${
                      user.availability === 'unavailable'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">No disponible</h4>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeAvailability?.('do-not-disturb')}
                    className={`w-full p-2 border rounded-md text-left transition-colors ${
                      user.availability === 'do-not-disturb'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">No molestar</h4>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeAvailability?.('be-right-back')}
                    className={`w-full p-2 border rounded-md text-left transition-colors ${
                      user.availability === 'be-right-back'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">Vuelvo enseguida</h4>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeAvailability?.('appear-away')}
                    className={`w-full p-2 border rounded-md text-left transition-colors ${
                      user.availability === 'appear-away'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-gray-900">Aparecer como ausente</h4>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Horario laboral personalizado</h3>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Lunes a Viernes</span>
                    </div>
                    <span className="text-sm text-gray-600">09:00 - 18:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Sábado</span>
                    </div>
                    <span className="text-sm text-gray-600">10:00 - 14:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Domingo</span>
                    </div>
                    <span className="text-sm text-gray-600">Cerrado</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">Ausencias</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderColor: '#03091D', color: '#03091D' }}
                    onClick={() => setIsVacationDialogOpen(true)}
                  >
                    Añadir periodo
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">Vacaciones de verano</p>
                        <p className="text-xs text-gray-600">1 Ago 2026 - 15 Ago 2026</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-xs">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">Navidad</p>
                        <p className="text-xs text-gray-600">24 Dic 2026 - 6 Ene 2027</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-xs">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuración de llamadas</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caller-id">Número mostrado a las personas que llaman</Label>
                    <Select defaultValue="default">
                      <SelectTrigger id="caller-id">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">{user.phone || '+34 912 345 678'}</SelectItem>
                        <SelectItem value="other">+34 915 678 901</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prefix">Prefijo telefónico predeterminado</Label>
                    <Select defaultValue="es">
                      <SelectTrigger id="prefix">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">España (+34)</SelectItem>
                        <SelectItem value="mx">México (+52)</SelectItem>
                        <SelectItem value="ar">Argentina (+54)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ringtone">Tono de llamada</Label>
                    <Select defaultValue="default">
                      <SelectTrigger id="ringtone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Tono predeterminado</SelectItem>
                        <SelectItem value="classic">Clásico</SelectItem>
                        <SelectItem value="modern">Moderno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wrap-time">Tiempo de finalización tras la llamada</Label>
                    <Select defaultValue="30">
                      <SelectTrigger id="wrap-time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin tiempo de finalización</SelectItem>
                        <SelectItem value="15">15 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">60 segundos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Desvío de llamadas</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <PhoneForwarded className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Desvío a número externo</h4>
                        <p className="text-sm text-gray-600 mb-3">Reenviar llamadas a un número de teléfono externo cuando no puedas responder</p>
                        <Input placeholder="+34 600 000 000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            className="text-white hover:opacity-90"
            style={{ backgroundColor: '#03091D' }}
          >
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Vacation Dialog */}
      {isVacationDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-2">Añadir periodo de ausencia</h2>
            <p className="text-sm text-gray-500 mb-6">
              Configura el periodo en el que no estarás disponible
            </p>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="vacation-name">Nombre del periodo</Label>
                <Input
                  id="vacation-name"
                  placeholder="Ej: Vacaciones de verano"
                  value={vacationName}
                  onChange={(e) => setVacationName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={vacationStartDate}
                    onChange={(e) => setVacationStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Fecha fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={vacationEndDate}
                    onChange={(e) => setVacationEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsVacationDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#03091D' }}
                onClick={() => {
                  setIsVacationDialogOpen(false);
                  setVacationName('');
                  setVacationStartDate('');
                  setVacationEndDate('');
                }}
              >
                Añadir periodo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
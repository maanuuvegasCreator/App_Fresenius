import { useState } from 'react';
import { Search, ChevronDown, Download, MoreVertical, X, Phone, Settings as SettingsIcon, Users, Plug, ChevronLeft, Plus, Info } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

interface NumberData {
  id: string;
  name: string;
  number: string;
  country: string;
  countryCode: string;
  type: 'local' | 'toll-free' | 'mobile';
  status: 'always-open' | 'business-hours' | 'closed';
  users: number;
}

interface PortingRequest {
  id: string;
  name: string;
  number: string;
  country: string;
  countryCode: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  requestDate: string;
}

const mockNumbers: NumberData[] = [
  {
    id: '1',
    name: 'Pedro FR +45',
    number: '+33 1 89 71 33 82',
    country: 'Francia',
    countryCode: 'FR',
    type: 'local',
    status: 'always-open',
    users: 5,
  },
  {
    id: '2',
    name: 'Pedro Gomes (Demo)',
    number: '+34 919 49 62 88',
    country: 'España',
    countryCode: 'ES',
    type: 'local',
    status: 'always-open',
    users: 3,
  },
  {
    id: '3',
    name: 'Pedro Gomes Movil',
    number: '+34 623 02 16 97',
    country: 'España',
    countryCode: 'ES',
    type: 'mobile',
    status: 'always-open',
    users: 2,
  },
  {
    id: '4',
    name: 'Pedro MX',
    number: '+52 55 1238 4573',
    country: 'México',
    countryCode: 'MX',
    type: 'local',
    status: 'business-hours',
    users: 4,
  },
  {
    id: '5',
    name: 'Pedro Spain',
    number: '+34 919 49 64 26',
    country: 'España',
    countryCode: 'ES',
    type: 'toll-free',
    status: 'always-open',
    users: 8,
  },
  {
    id: '6',
    name: 'Soporte Principal',
    number: '+34 912 345 678',
    country: 'España',
    countryCode: 'ES',
    type: 'local',
    status: 'business-hours',
    users: 12,
  },
  {
    id: '7',
    name: 'Ventas Internacional',
    number: '+1 555 123 4567',
    country: 'Estados Unidos',
    countryCode: 'US',
    type: 'toll-free',
    status: 'always-open',
    users: 6,
  },
];

const mockPortingRequests: PortingRequest[] = [
  {
    id: 'p1',
    name: 'Número Corporativo',
    number: '+34 915 678 901',
    country: 'España',
    countryCode: 'ES',
    status: 'in-progress',
    requestDate: '2026-04-05',
  },
  {
    id: 'p2',
    name: 'Línea Atención Cliente',
    number: '+52 55 8765 4321',
    country: 'México',
    countryCode: 'MX',
    status: 'pending',
    requestDate: '2026-04-08',
  },
];

const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  ES: '🇪🇸',
  MX: '🇲🇽',
  US: '🇺🇸',
  GB: '🇬🇧',
  AU: '🇦🇺',
  BE: '🇧🇪',
  CA: '🇨🇦',
  IE: '🇮🇪',
};

export function Numbers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<NumberData | null>(null);
  const [configTab, setConfigTab] = useState<'distribution' | 'settings' | 'integrations' | 'teams'>('distribution');
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);

  const filteredNumbers = mockNumbers.filter((num) => {
    const matchesSearch =
      num.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      num.number.includes(searchQuery);
    const matchesCountry = countryFilter === 'all' || num.countryCode === countryFilter;
    const matchesType = typeFilter === 'all' || num.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || num.status === statusFilter;
    
    return matchesSearch && matchesCountry && matchesType && matchesStatus;
  });

  const filteredPortingRequests = mockPortingRequests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.number.includes(searchQuery);
    const matchesCountry = countryFilter === 'all' || req.countryCode === countryFilter;
    
    return matchesSearch && matchesCountry;
  });

  const handleReset = () => {
    setSearchQuery('');
    setCountryFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  const handleDownloadCSV = () => {
    console.log('Downloading CSV...');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'always-open':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Siempre abierto</Badge>;
      case 'business-hours':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Horario laboral</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cerrado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">En progreso</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'local':
        return 'Local';
      case 'toll-free':
        return 'Gratuito';
      case 'mobile':
        return 'Móvil';
      default:
        return type;
    }
  };

  const hasActiveFilters = countryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '';

  return (
    <div className="h-full flex flex-col bg-gray-50">{/* Header */}
      <div className="bg-white border-b">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Números</h1>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los países</SelectItem>
                <SelectItem value="ES">España</SelectItem>
                <SelectItem value="MX">México</SelectItem>
                <SelectItem value="FR">Francia</SelectItem>
                <SelectItem value="US">Estados Unidos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="toll-free">Gratuito</SelectItem>
                <SelectItem value="mobile">Móvil</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="always-open">Siempre abierto</SelectItem>
                <SelectItem value="business-hours">Horario laboral</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                Reset
              </Button>
            )}

            <div className="ml-auto text-sm text-muted-foreground">
              {filteredNumbers.length} números
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  País
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  Nombre
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  Número
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  Tipo
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  Usuarios
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">
                  Estado
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredNumbers.map((number) => (
                <tr key={number.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{countryFlags[number.countryCode] || '🌐'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium">{number.name}</span>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">
                    {number.number}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {getTypeLabel(number.type)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm">{number.users}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(number.status)}
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
                            setSelectedNumber(number);
                            setConfigTab('distribution');
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          Configuración
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredNumbers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron números
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de configuración del número */}
      {selectedNumber && (
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsConfigDialogOpen(false)}
                  className="hover:bg-gray-100 p-1 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <DialogTitle className="text-xl">
                    {selectedNumber.name}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedNumber.number} • {selectedNumber.country}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 mt-4 border-b -mb-4">
                <button
                  onClick={() => setConfigTab('distribution')}
                  className={`pb-3 border-b-2 transition-colors text-sm font-medium ${
                    configTab === 'distribution'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Distribución de llamadas
                </button>
                <button
                  onClick={() => setConfigTab('settings')}
                  className={`pb-3 border-b-2 transition-colors text-sm font-medium ${
                    configTab === 'settings'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ajustes
                </button>
                <button
                  onClick={() => setConfigTab('teams')}
                  className={`pb-3 border-b-2 transition-colors text-sm font-medium ${
                    configTab === 'teams'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Equipos y Usuarios
                </button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Call Distribution Tab */}
              {configTab === 'distribution' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Distribución de llamadas</h3>
                    <p className="text-sm text-gray-600 mb-4">Opciones</p>

                    <div className="space-y-4">
                      {/* Respect queuing time */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                              </label>
                              <span className="font-medium text-gray-900">Respetar el tiempo de espera</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-14">
                              Por defecto, el tiempo de espera se omite cuando todos los miembros del equipo no están disponibles o no responden. Esto permite una distribución más eficiente de las llamadas. Active la opción para restablecer el tiempo de espera en todos los casos.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                              </label>
                              <span className="font-medium text-gray-900">Prioridad</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-14">
                              Las llamadas entrantes recibidas en esta línea se despachan con prioridad a los agentes disponibles en comparación con las llamadas provenientes de una línea regular.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {configTab === 'settings' && (
                <div className="space-y-6">
                  {/* Call Recording */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Grabación de llamadas</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Las grabaciones de llamadas se almacenan en el Centro de Llamadas, en cada una de las llamadas.
                    </p>

                    {/* Incoming calls */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Llamadas entrantes</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                          </label>
                          <span className="text-sm text-gray-900">Iniciar grabación automática</span>
                        </div>

                        {/* Schedule Configuration */}
                        <div className="ml-14 p-4 border rounded-lg space-y-4">
                          <h5 className="text-sm font-medium">Configurar horario por día de la semana</h5>

                          <div className="space-y-3">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves'].map((day) => (
                              <div key={day} className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                                </label>
                                <span className="text-sm w-24">{day}</span>
                                <Input type="time" defaultValue="08:00" className="w-32" />
                                <span className="text-gray-500">a</span>
                                <Input type="time" defaultValue="17:00" className="w-32" />
                              </div>
                            ))}

                            <div className="flex items-center gap-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                              </label>
                              <span className="text-sm w-24">Viernes</span>
                              <Input type="time" defaultValue="08:00" className="w-32" />
                              <span className="text-gray-500">a</span>
                              <Input type="time" defaultValue="15:00" className="w-32" />
                            </div>

                            {['Sábado', 'Domingo'].map((day) => (
                              <div key={day} className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                                </label>
                                <span className="text-sm w-24">{day}</span>
                                <Input type="time" defaultValue="08:00" className="w-32" disabled />
                                <span className="text-gray-500">a</span>
                                <Input type="time" defaultValue="17:00" className="w-32" disabled />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Business Hours Message */}
                        <div className="ml-14 p-4 border rounded-lg space-y-4">
                          <h5 className="text-sm font-medium">Mensaje durante horario laboral</h5>

                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 mb-2">Texto a voz</div>
                            <Textarea
                              rows={3}
                              defaultValue="Su llamada está siendo grabada con fines de calidad y formación."
                              placeholder="Ingrese el mensaje que se reproducirá durante el horario laboral"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Idioma</Label>
                              <Select defaultValue="spanish">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spanish">Español</SelectItem>
                                  <SelectItem value="english">Inglés</SelectItem>
                                  <SelectItem value="french">Francés</SelectItem>
                                  <SelectItem value="german">Alemán</SelectItem>
                                  <SelectItem value="italian">Italiano</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Voz</Label>
                              <Select defaultValue="lucia">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lucia">Lucía (europea)</SelectItem>
                                  <SelectItem value="miguel">Miguel (latinoamericana)</SelectItem>
                                  <SelectItem value="marta">Marta (europea)</SelectItem>
                                  <SelectItem value="carlos">Carlos (europea)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Grabar mensaje personalizado
                            </Button>
                          </div>
                        </div>

                        {/* After Hours Message */}
                        <div className="ml-14 p-4 border rounded-lg space-y-4">
                          <h5 className="text-sm font-medium">Mensaje fuera de horario laboral</h5>

                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 mb-2">Texto a voz</div>
                            <Textarea
                              rows={3}
                              defaultValue="Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 y viernes de 8:00 a 15:00. Por favor, deje su mensaje."
                              placeholder="Ingrese el mensaje que se reproducirá fuera del horario laboral"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Idioma</Label>
                              <Select defaultValue="spanish">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spanish">Español</SelectItem>
                                  <SelectItem value="english">Inglés</SelectItem>
                                  <SelectItem value="french">Francés</SelectItem>
                                  <SelectItem value="german">Alemán</SelectItem>
                                  <SelectItem value="italian">Italiano</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Voz</Label>
                              <Select defaultValue="lucia">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lucia">Lucía (europea)</SelectItem>
                                  <SelectItem value="miguel">Miguel (latinoamericana)</SelectItem>
                                  <SelectItem value="marta">Marta (europea)</SelectItem>
                                  <SelectItem value="carlos">Carlos (europea)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Plus className="h-4 w-4" />
                              Grabar mensaje personalizado
                            </Button>
                          </div>

                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            Fuera de horario: Lunes-Jueves 17:00-8:00h, Viernes 15:00 - Lunes 8:00h
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-900">
                            Le recomendamos que indique en el mensaje de bienvenida que la llamada se grabará. Si desea eliminar las llamadas grabadas, póngase en contacto con el equipo de Soporte de Thinkia.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                          </label>
                          <span className="text-sm text-gray-900">Permitir a los agentes iniciar y pausar la grabación</span>
                        </div>
                      </div>
                    </div>

                    {/* Outgoing calls */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Llamadas salientes</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                          </label>
                          <span className="text-sm text-gray-900">Iniciar grabación automática</span>
                        </div>

                        <div className="ml-14 p-4 border rounded-lg space-y-4">
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                            </label>
                            <span className="text-sm font-medium text-gray-900">Reproducir anuncio de grabación de llamada</span>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Mensaje de grabación</Label>
                              <div className="text-sm text-gray-600 mb-2">Texto a voz</div>
                              <Textarea
                                rows={3}
                                defaultValue="Esta llamada será grabada con fines de calidad."
                                placeholder="Ingrese el mensaje que se reproducirá al inicio de las llamadas salientes"
                              />
                              <p className="text-xs text-gray-500">
                                Reproduce un mensaje que informa a la persona que contesta que la llamada se grabará.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Idioma</Label>
                                <Select defaultValue="spanish">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="spanish">Español</SelectItem>
                                    <SelectItem value="english">Inglés</SelectItem>
                                    <SelectItem value="french">Francés</SelectItem>
                                    <SelectItem value="german">Alemán</SelectItem>
                                    <SelectItem value="italian">Italiano</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Voz</Label>
                                <Select defaultValue="lucia">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lucia">Lucía (europea)</SelectItem>
                                    <SelectItem value="miguel">Miguel (latinoamericana)</SelectItem>
                                    <SelectItem value="marta">Marta (europea)</SelectItem>
                                    <SelectItem value="carlos">Carlos (europea)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Grabar mensaje personalizado
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                          </label>
                          <span className="text-sm text-gray-900">Permitir a los agentes iniciar y pausar la grabación</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Callbacks */}
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Devoluciones de llamada</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Las personas que llaman en cola pueden pulsar el asterisco (*) para solicitar una devolución de llamada.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                        </label>
                        <span className="text-sm font-medium text-gray-900">Permitir solicitudes de devolución de llamada</span>
                      </div>

                      <div className="ml-14 space-y-4">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                          </label>
                          <span className="text-sm font-medium text-gray-900">Devoluciones de llamada automáticas</span>
                        </div>

                        <p className="text-sm text-gray-600">
                          La solicitud de devolución de llamada hará sonar automáticamente al primer agente disponible.
                        </p>

                        <div className="space-y-2">
                          <Label htmlFor="retries" className="text-sm">Número de reintentos</Label>
                          <Select defaultValue="4">
                            <SelectTrigger id="retries">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Defina cuántas veces la devolución de llamada se reintentará automáticamente después de fallar.
                          </p>
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-3">Mensaje en espera</h4>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03091D]"></div>
                              </label>
                              <span className="text-sm font-medium text-gray-900">Activar mensaje en espera</span>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Retraso antes del mensaje (segundos)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="300"
                                defaultValue="30"
                                className="w-32"
                              />
                              <p className="text-xs text-gray-500">
                                El mensaje se reproducirá después de este tiempo en espera
                              </p>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">Texto a voz</div>

                            <div className="space-y-2">
                              <Textarea
                                id="message"
                                rows={3}
                                defaultValue="Por favor, permanezca a la espera. Un agente le atenderá en breve."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Idioma</Label>
                                <Select defaultValue="spanish">
                                  <SelectTrigger id="language">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="spanish">Español</SelectItem>
                                    <SelectItem value="english">Inglés</SelectItem>
                                    <SelectItem value="french">Francés</SelectItem>
                                    <SelectItem value="german">Alemán</SelectItem>
                                    <SelectItem value="italian">Italiano</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">Voz</Label>
                                <Select defaultValue="lucia">
                                  <SelectTrigger id="voice">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lucia">Lucía (europea)</SelectItem>
                                    <SelectItem value="miguel">Miguel (latinoamericana)</SelectItem>
                                    <SelectItem value="marta">Marta (europea)</SelectItem>
                                    <SelectItem value="carlos">Carlos (europea)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Grabar mensaje personalizado
                              </Button>
                              <Button variant="outline" size="sm" className="gap-2">
                                Ver mensajes guardados
                              </Button>
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800">
                                  Puedes grabar y gestionar mensajes pregrabados para utilizar como mensaje en espera. Los mensajes personalizados mejoran la experiencia del cliente mientras esperan.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Teams & Users Tab */}
              {configTab === 'teams' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Usuarios y equipos asignados</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Estos usuarios están asignados para recibir llamadas en este número. Puede editar esta lista en su distribución de llamadas en cualquier momento.
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">MT - SCL_LATAM</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        style={{ borderColor: '#7C3AED', color: '#7C3AED' }}
                        onClick={() => setIsAddTeamDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Agregar equipos o usuarios
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: '#7C3AED', color: '#7C3AED' }}
                      >
                        Ir a la página de equipos
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-2">Acceso a llamadas y datos</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Estos usuarios pueden realizar llamadas y monitorear la actividad de esta línea, pero no pueden recibirlas.
                    </p>

                    <div className="space-y-2 mb-4">
                      {[
                        { name: 'Emma Thompson', color: 'bg-purple-100', initial: 'ET', textColor: 'text-purple-700' },
                        { name: 'Michael Chen', color: 'bg-blue-100', initial: 'MC', textColor: 'text-blue-700' },
                        { name: 'Sarah Williams', color: 'bg-gray-100', initial: 'SW', textColor: 'text-gray-700' },
                        { name: 'James Rodriguez', color: 'bg-yellow-100', initial: 'JR', textColor: 'text-yellow-700' },
                        { name: 'Lisa Anderson', color: 'bg-green-100', initial: 'LA', textColor: 'text-green-700' },
                      ].map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full ${user.color} flex items-center justify-center`}>
                              <span className={`text-xs font-semibold ${user.textColor}`}>
                                {user.initial}
                              </span>
                            </div>
                            <span className="text-sm">{user.name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-red-600">
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select defaultValue="">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user1">John Doe</SelectItem>
                          <SelectItem value="user2">Jane Smith</SelectItem>
                          <SelectItem value="user3">Robert Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">Cancelar</Button>
                      <Button
                        className="text-white"
                        style={{ backgroundColor: '#03091D' }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#03091D' }}
                onClick={() => setIsConfigDialogOpen(false)}
              >
                Guardar cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Team/User Dialog */}
      <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar equipos o usuarios</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Equipos disponibles</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Atención al Cliente</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Enfermería</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Ventas</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="text-sm font-medium">Usuarios disponibles</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">LC</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Laura Castro</p>
                      <p className="text-xs text-gray-500">laura.castro@thinkia.com</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">JM</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Javier Martínez</p>
                      <p className="text-xs text-gray-500">javier.martinez@thinkia.com</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="rounded" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">MS</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">María Sánchez</p>
                      <p className="text-xs text-gray-500">maria.sanchez@thinkia.com</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="text-white"
              style={{ backgroundColor: '#03091D' }}
              onClick={() => setIsAddTeamDialogOpen(false)}
            >
              Agregar seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { Search, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, ChevronDown, ChevronUp, MoreVertical, RotateCcw, X, Plus, Users, BookOpen, Mail, Copy } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

interface CallRecord {
  id: string;
  type: 'inbound' | 'outbound' | 'missed';
  number: string;
  contact: string;
  createdBy: string;
  time: string;
  duration: string;
  status: 'closed' | 'owned' | 'pending';
  date: string;
  hasNote: boolean;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  mainNumber: string;
  otherNumbers: string[];
  emails: string[];
  integrations: Array<{
    name: string;
    icon: string;
  }>;
  lastContact?: string;
}

const mockCalls: CallRecord[] = [
  {
    id: '1',
    type: 'inbound',
    number: '+34 607 89 43 01',
    contact: 'María López García',
    createdBy: 'Pedro Castro Lara',
    time: '03:03 pm',
    duration: '5:23',
    status: 'closed',
    date: 'Today',
    hasNote: true,
  },
  {
    id: '2',
    type: 'inbound',
    number: '+34 983 66 05 55',
    contact: 'Juan Torres Ruiz',
    createdBy: 'Pedro Castro Lara',
    time: '03:01 pm',
    duration: '3:45',
    status: 'closed',
    date: 'Today',
    hasNote: false,
  },
  {
    id: '3',
    type: 'missed',
    number: '+34 912 345 678',
    contact: 'Ana Martínez Pérez',
    createdBy: 'Sistema',
    time: '02:45 pm',
    duration: '0:00',
    status: 'pending',
    date: 'Today',
    hasNote: false,
  },
  {
    id: '4',
    type: 'outbound',
    number: '+34 607 89 43 01',
    contact: 'Michael Cummins',
    createdBy: 'Pedro Castro Lara',
    time: '02:15 pm',
    duration: '8:12',
    status: 'closed',
    date: 'Today',
    hasNote: false,
  },
  {
    id: '5',
    type: 'inbound',
    number: '+34 607 89 43 01',
    contact: 'Santiago Martinez',
    createdBy: 'Pedro Castro Lara',
    time: '09:46 am',
    duration: '15:30',
    status: 'closed',
    date: 'Jun 27',
    hasNote: true,
  },
  {
    id: '6',
    type: 'outbound',
    number: '+34 607 89 43 01',
    contact: 'Marvin Marvin',
    createdBy: 'Pedro Castro Lara',
    time: '09:32 am',
    duration: '2:18',
    status: 'closed',
    date: 'Jun 27',
    hasNote: false,
  },
  {
    id: '7',
    type: 'inbound',
    number: '+34 607 89 43 01',
    contact: 'Pedro Castro',
    createdBy: 'Pedro Castro Lara',
    time: '10:10 am',
    duration: '4:56',
    status: 'closed',
    date: 'Jun 27',
    hasNote: false,
  },
  {
    id: '8',
    type: 'missed',
    number: '+34 607 89 43 01',
    contact: 'Oscar Simón',
    createdBy: 'Pedro Castro Lara',
    time: '09:28 am',
    duration: '0:00',
    status: 'pending',
    date: 'Jun 26',
    hasNote: false,
  },
];

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'María López García',
    company: 'Tech Solutions SL',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 912 345 678'],
    emails: ['maria.lopez@techsolutions.es'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    lastContact: 'Hoy a las 3:03 pm',
  },
  {
    id: '2',
    name: 'Juan Torres Ruiz',
    company: 'Industrias Martinez',
    mainNumber: '+34 983 66 05 55',
    otherNumbers: [],
    emails: ['j.torres@industriasmartinez.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    lastContact: 'Hoy a las 3:01 pm',
  },
  {
    id: '3',
    name: 'Ana Martínez Pérez',
    company: 'Consultoría Global',
    mainNumber: '+34 912 345 678',
    otherNumbers: ['+34 607 12 34 56'],
    emails: ['ana.martinez@consultoria.es', 'a.martinez@gmail.com'],
    integrations: [],
  },
  {
    id: '4',
    name: 'Michael Cummins',
    company: 'Global Enterprises',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['m.cummins@globalent.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: '5',
    name: 'Santiago Martinez',
    company: 'Martinez Consulting',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 913 45 67 89'],
    emails: ['santiago@martinezconsulting.es'],
    integrations: [],
  },
  {
    id: '6',
    name: 'Marvin Marvin',
    company: 'Tech Innovations',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['marvin@techinnovations.com'],
    integrations: [],
  },
  {
    id: '7',
    name: 'Pedro Castro',
    company: 'Castro & Asociados',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['pedro@castroasociados.es'],
    integrations: [],
  },
  {
    id: '8',
    name: 'Oscar Simón',
    company: 'Simón Solutions',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 915 67 89 01'],
    emails: ['oscar@simonsolutions.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
];

const mockTeammates: Contact[] = [
  {
    id: 't1',
    name: 'Laura Sánchez',
    company: 'Thinkia',
    mainNumber: '+34 691 23 45 67',
    otherNumbers: [],
    emails: ['laura.sanchez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't2',
    name: 'Javier Ruiz',
    company: 'Thinkia',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['javier.ruiz@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't3',
    name: 'Pedro Ramírez',
    company: 'Thinkia',
    mainNumber: '+34 678 90 12 34',
    otherNumbers: [],
    emails: ['pedro.ramirez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't4',
    name: 'Elena Fernández',
    company: 'Thinkia',
    mainNumber: '+34 655 44 33 22',
    otherNumbers: [],
    emails: ['elena.fernandez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't5',
    name: 'Carmen Rodríguez',
    company: 'Thinkia',
    mainNumber: '+34 644 55 66 77',
    otherNumbers: [],
    emails: ['carmen.rodriguez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't6',
    name: 'Ana Martínez',
    company: 'Thinkia',
    mainNumber: '+34 633 22 11 00',
    otherNumbers: [],
    emails: ['ana.martinez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
  {
    id: 't7',
    name: 'Diego López',
    company: 'Thinkia',
    mainNumber: '+34 622 11 00 99',
    otherNumbers: [],
    emails: ['diego.lopez@thinkia.com'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
  },
];

const recentContactIds = ['1', '2', '3'];

export function CallCenter() {
  const [activeSection, setActiveSection] = useState<'calls' | 'contacts'>('calls');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallRecord>(mockCalls[4]);
  const [filterType, setFilterType] = useState<'all' | 'missed' | 'callbacks' | 'followup'>('all');
  const [sortBy, setSortBy] = useState('newest');

  // Contacts state
  const [contactsTab, setContactsTab] = useState<'contacts' | 'teammates'>('contacts');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isIntegrationsExpanded, setIsIntegrationsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredCalls = mockCalls.filter((call) => {
    const matchesSearch =
      call.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.number.includes(searchQuery);

    let matchesFilter = true;
    if (filterType === 'missed') matchesFilter = call.type === 'missed';
    if (filterType === 'callbacks') matchesFilter = call.hasNote;

    return matchesSearch && matchesFilter;
  });

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.mainNumber.includes(contactSearchQuery)
  );

  const filteredTeammates = mockTeammates.filter(
    (teammate) =>
      teammate.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      teammate.mainNumber.includes(contactSearchQuery)
  );

  const recentContacts = filteredContacts.filter((c) => recentContactIds.includes(c.id));
  const allContacts = contactsTab === 'contacts' ? filteredContacts : filteredTeammates;

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'inbound':
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case 'outbound':
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      default:
        return <Phone className="h-4 w-4" />;
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDeleteContact = () => {
    setIsDeleteDialogOpen(false);
    setSelectedContact(null);
  };

  const missedCount = mockCalls.filter(c => c.type === 'missed').length;

  return (
    <div className="h-full flex bg-white">
      {/* Submenu Lateral */}
      <div className="w-20 border-r bg-white flex flex-col items-center py-6 gap-6">
        <button
          onClick={() => setActiveSection('calls')}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            activeSection === 'calls'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title="Llamadas"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">Llamadas</span>
        </button>

        <button
          onClick={() => {
            setActiveSection('contacts');
            setSelectedContact(null);
          }}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            activeSection === 'contacts'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title="Contacts"
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs">Contacts</span>
        </button>
      </div>

      {/* Left Sidebar - Context dependent */}
      {activeSection === 'contacts' ? (
        // Contacts List
        <div className="w-96 border-r flex flex-col bg-white">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Contactos</h1>
              <Button
                size="sm"
                className="h-8 gap-2 text-white"
                style={{ backgroundColor: '#03091D' }}
              >
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setContactsTab('contacts')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  contactsTab === 'contacts'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={contactsTab === 'contacts' ? { backgroundColor: '#03091D' } : {}}
              >
                Contactos
              </button>
              <button
                onClick={() => setContactsTab('teammates')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  contactsTab === 'teammates'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={contactsTab === 'teammates' ? { backgroundColor: '#03091D' } : {}}
              >
                Colegas
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre o número"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {/* Recent Contacts */}
            {contactsTab === 'contacts' && recentContacts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 px-4 py-2">Contactos recientes</h3>
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                          {getInitials(contact.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500 truncate">{contact.mainNumber}</p>
                      </div>
                      {contact.integrations.filter(i => i.name.includes('Dynamics')).length > 0 && (
                        <div className="flex gap-1">
                          {contact.integrations.filter(i => i.name.includes('Dynamics')).slice(0, 2).map((integration, idx) => (
                            <span key={idx} className="text-sm">
                              {integration.icon}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Contacts */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 px-4 py-2">Todos los contactos</h3>
              {allContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                        {getInitials(contact.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.mainNumber}</p>
                    </div>
                    {contact.integrations.length > 0 && (
                      <div className="flex gap-1">
                        {contact.integrations.slice(0, 2).map((integration, idx) => (
                          <span key={idx} className="text-sm">
                            {integration.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron contactos</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Call List
        <div className="w-80 border-r flex flex-col bg-gray-50">
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Llamadas</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Búsqueda por número o contacto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={filterType === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="h-8 text-xs"
              >
                Todas
              </Button>
              <Button
                variant={filterType === 'missed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('missed')}
                className="h-8 text-xs relative"
              >
                Llamadas Perdidas
                {missedCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {missedCount}
                  </span>
                )}
              </Button>
              <Button
                variant={filterType === 'callbacks' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType('callbacks')}
                className="h-8 text-xs"
              >
                Callback
              </Button>
            </div>

            <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-start">
              <div className="w-4 h-4 rounded border mr-2" />
              Seleccionar llamada/s
            </Button>
          </div>

          <div className="px-4 py-2 border-b bg-white flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ordenar por Recientes</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-7 w-28 text-xs border-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedCall?.id === call.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getCallIcon(call.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{call.number}</span>
                      <span className="text-xs text-muted-foreground">{call.time}</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{call.contact}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Llamada respondida por {call.createdBy}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs h-5 ${
                            call.status === 'closed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : call.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            call.status === 'closed' ? 'bg-green-500' :
                            call.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          {call.status === 'closed' ? 'Closed' : call.status === 'pending' ? 'Pending' : 'Owned'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - Context dependent */}
      {activeSection === 'contacts' ? (
        // Contact Details
        selectedContact ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-6 border-b">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <span className="text-xl font-semibold" style={{ color: '#001963' }}>
                    {getInitials(selectedContact.name)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold mb-1">{selectedContact.name}</h2>
                <p className="text-sm text-gray-600">{selectedContact.company}</p>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                <Button
                  size="lg"
                  className="h-12 w-12 rounded-xl text-white"
                  style={{ backgroundColor: '#03091D' }}
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contact
                </h3>

                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <span className="text-gray-400">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="text-sm font-medium">{selectedContact.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <span className="text-gray-400">🏢</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Company</p>
                    <p className="text-sm font-medium">{selectedContact.company}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Main Number</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{selectedContact.mainNumber}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(selectedContact.mainNumber)}
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedContact.otherNumbers.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 flex justify-center pt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Other Numbers</p>
                      {selectedContact.otherNumbers.map((number, idx) => (
                        <div key={idx} className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{number}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(number)}
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContact.emails.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 flex justify-center pt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Emails</p>
                      {selectedContact.emails.map((email, idx) => (
                        <div key={idx} className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{email}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(email)}
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContact.integrations.filter(i => i.name.includes('Dynamics')).length > 0 && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setIsIntegrationsExpanded(!isIntegrationsExpanded)}
                      className="flex items-center justify-between w-full text-left py-2"
                      style={{ color: '#00A884' }}
                    >
                      <span className="text-sm font-medium">Contact integrations</span>
                      {isIntegrationsExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {isIntegrationsExpanded && (
                      <div className="mt-3 space-y-2 pl-4">
                        {selectedContact.integrations.filter(i => i.name.includes('Dynamics')).map((integration, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">via</span>
                            <span className="text-base">{integration.icon}</span>
                            <span className="font-medium">{integration.name}</span>
                            <span className="text-gray-400">↗</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Selecciona un contacto para ver los detalles</p>
            </div>
          </div>
        )
      ) : (
        // Call Detail
        selectedCall && (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="font-semibold" style={{ color: '#001963' }}>
                      {selectedCall.contact.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: '#001963' }}>{selectedCall.contact}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{selectedCall.number}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="lg"
                    className="h-10 gap-2 text-white hover:opacity-90"
                    style={{ backgroundColor: '#03091D' }}
                  >
                    <Phone className="h-4 w-4" />
                    Llamada
                  </Button>
                  <Button variant="outline" className="h-10 gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reabrir
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm border-b -mb-px">
                <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                  Timeline
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-xs font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border">
                    {selectedCall.date} • {selectedCall.time} • Duración: {selectedCall.duration}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="bg-white rounded-lg border p-6 mb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getCallIcon(selectedCall.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Llamada respondida por Pedro Castro</span>
                      </div>
                      {selectedCall.status === 'closed' && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Transcripción</div>
                            <div className="text-sm text-muted-foreground space-y-3">
                              <p><strong>Agente:</strong> Hola, buenos días. Gracias por llamar. ¿En qué puedo ayudarle?</p>
                              <p><strong>Cliente:</strong> Buenos días. Estoy interesado en organizar una reunión para hablar sobre el tema de la sucursal. ¿Sería posible?</p>
                              <p><strong>Agente:</strong> Por supuesto. ¿Tiene alguna preferencia de fecha y hora?</p>
                              <p><strong>Cliente:</strong> Preferiría algo a las 15:30 si es posible. También me gustaría que me enviaran un vídeo explicativo sobre los detalles de la sucursal.</p>
                              <p><strong>Agente:</strong> Entendido. Organizaremos la reunión para esa hora y le enviaremos el material por correo electrónico. ¿Hay alguien más que deba participar en la reunión?</p>
                              <p><strong>Cliente:</strong> Sí, hay una persona clave que es responsable de tomar la decisión. Les enviaré su información de contacto.</p>
                              <p><strong>Agente:</strong> Perfecto. Le enviaré un enlace para confirmar la reserva de la reunión. Iniciáremos el proceso desde su ordenador.</p>
                              <p><strong>Cliente:</strong> Excelente, muchas gracias por su ayuda.</p>
                              <p><strong>Agente:</strong> De nada. ¿Hay algo más en lo que pueda ayudarle?</p>
                              <p><strong>Cliente:</strong> No, eso es todo por ahora. Hasta luego.</p>
                              <p><strong>Agente:</strong> Hasta luego, que tenga un buen día.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Delete Contact Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar contacto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a {selectedContact?.name}? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteContact}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

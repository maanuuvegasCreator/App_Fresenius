import { useState } from 'react';
import { Search, Phone, MessageSquare, Mail, Copy, ChevronDown, ChevronUp, Plus, Users, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

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
  hospital?: string;
  team?: string;
  type?: 'Paciente' | 'Proveedor' | 'Otro';
  primaryAgent?: string;
  secondaryAgent?: string;
  role?: string;
  department?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'María López García',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 912 345 678'],
    emails: ['maria.lopez@fresenius.es'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    lastContact: 'Hoy a las 3:03 pm',
    hospital: 'Hospital Universitario La Paz',
    type: 'Paciente',
    primaryAgent: 'Pedro Ramírez',
    secondaryAgent: 'Elena Fernández',
  },
  {
    id: '2',
    name: 'Juan Torres Ruiz',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 983 66 05 55',
    otherNumbers: [],
    emails: ['j.torres@fresenius.es'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    lastContact: 'Hoy a las 3:01 pm',
    hospital: 'Hospital Clínico San Carlos',
    type: 'Paciente',
    primaryAgent: 'Elena Fernández',
    secondaryAgent: 'Pedro Ramírez',
  },
  {
    id: '3',
    name: 'Ana Martínez Pérez',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 912 345 678',
    otherNumbers: ['+34 607 12 34 56'],
    emails: ['ana.martinez@fresenius.es'],
    integrations: [],
    hospital: 'Hospital Gregorio Marañón',
    type: 'Paciente',
    primaryAgent: 'Pedro Ramírez',
    secondaryAgent: 'Elena Fernández',
  },
  {
    id: '4',
    name: 'Michael Cummins',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['m.cummins@fresenius.es'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    hospital: 'Hospital Ramón y Cajal',
    type: 'Paciente',
    primaryAgent: 'Elena Fernández',
    secondaryAgent: 'Pedro Ramírez',
  },
  {
    id: '5',
    name: 'Santiago Martinez',
    company: 'Suministros Médicos SA',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 913 45 67 89'],
    emails: ['santiago@suministrosmedicos.es'],
    integrations: [],
    type: 'Proveedor',
  },
  {
    id: '6',
    name: 'Marvin Marvin',
    company: 'Tech Innovations',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['marvin@techinnovations.com'],
    integrations: [],
    type: 'Otro',
  },
  {
    id: '7',
    name: 'Pedro Ramírez',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['pedro.ramirez@fresenius.es'],
    integrations: [],
    hospital: 'Hospital Fundación Jiménez Díaz',
    type: 'Paciente',
    primaryAgent: 'Pedro Ramírez',
    secondaryAgent: 'Elena Fernández',
  },
  {
    id: '8',
    name: 'Oscar Simón',
    company: 'Fresenius Medical Care',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: ['+34 915 67 89 01'],
    emails: ['oscar.simon@fresenius.es'],
    integrations: [
      { name: 'Microsoft Dynamics 365', icon: '🔷' },
    ],
    hospital: 'Hospital Puerta de Hierro',
    type: 'Paciente',
    primaryAgent: 'Elena Fernández',
    secondaryAgent: 'Pedro Ramírez',
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
    integrations: [],
    department: 'Atención al Cliente',
    role: 'Administrador',
  },
  {
    id: 't2',
    name: 'Javier Ruiz',
    company: 'Thinkia',
    mainNumber: '+34 607 89 43 01',
    otherNumbers: [],
    emails: ['javier.ruiz@thinkia.com'],
    integrations: [],
    department: 'Atención al Cliente',
    role: 'Supervisor',
  },
  {
    id: 't3',
    name: 'Pedro Ramírez',
    company: 'Thinkia',
    mainNumber: '+34 678 90 12 34',
    otherNumbers: [],
    emails: ['pedro.ramirez@thinkia.com'],
    integrations: [],
    department: 'Atención al Cliente',
    role: 'Agente',
  },
  {
    id: 't4',
    name: 'Elena Fernández',
    company: 'Thinkia',
    mainNumber: '+34 655 44 33 22',
    otherNumbers: [],
    emails: ['elena.fernandez@thinkia.com'],
    integrations: [],
    department: 'Atención al Cliente',
    role: 'Agente',
  },
  {
    id: 't5',
    name: 'Carmen Rodríguez',
    company: 'Thinkia',
    mainNumber: '+34 644 55 66 77',
    otherNumbers: [],
    emails: ['carmen.rodriguez@thinkia.com'],
    integrations: [],
    department: 'Enfermería',
    role: 'Administrador',
  },
  {
    id: 't6',
    name: 'Ana Martínez',
    company: 'Thinkia',
    mainNumber: '+34 633 22 11 00',
    otherNumbers: [],
    emails: ['ana.martinez@thinkia.com'],
    integrations: [],
    department: 'Enfermería',
    role: 'Supervisor',
  },
  {
    id: 't7',
    name: 'Diego López',
    company: 'Thinkia',
    mainNumber: '+34 622 11 00 99',
    otherNumbers: [],
    emails: ['diego.lopez@thinkia.com'],
    integrations: [],
    department: 'Enfermería',
    role: 'Agente',
  },
];

const recentContactIds = ['1', '2', '3'];

export function Contacts() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'teammates'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isIntegrationsExpanded, setIsIntegrationsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);

  // Form state for new contact
  const [newContactName, setNewContactName] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactMainNumber, setNewContactMainNumber] = useState('');
  const [newContactOtherNumber, setNewContactOtherNumber] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactHospital, setNewContactHospital] = useState('');
  const [newContactTeam, setNewContactTeam] = useState('');
  const [newContactType, setNewContactType] = useState<'Paciente' | 'Proveedor' | 'Otro'>('Paciente');
  const [newContactPrimaryAgent, setNewContactPrimaryAgent] = useState('');
  const [newContactSecondaryAgent, setNewContactSecondaryAgent] = useState('');
  const [newContactDepartment, setNewContactDepartment] = useState('');
  const [newContactRole, setNewContactRole] = useState('');

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.mainNumber.includes(searchQuery)
  );

  const filteredTeammates = mockTeammates.filter(
    (teammate) =>
      teammate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teammate.mainNumber.includes(searchQuery)
  );

  const recentContacts = filteredContacts.filter((c) => recentContactIds.includes(c.id));
  const allContacts = activeTab === 'contacts' ? filteredContacts : filteredTeammates;

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
    // Here you would actually delete the contact
  };

  const handleAddContact = () => {
    // Here you would actually add the contact
    setIsAddContactDialogOpen(false);
    resetAddContactForm();
  };

  const resetAddContactForm = () => {
    setNewContactName('');
    setNewContactCompany('');
    setNewContactMainNumber('');
    setNewContactOtherNumber('');
    setNewContactEmail('');
    setNewContactHospital('');
    setNewContactTeam('');
    setNewContactType('Paciente');
    setNewContactPrimaryAgent('');
    setNewContactSecondaryAgent('');
    setNewContactDepartment('');
    setNewContactRole('');
  };

  return (
    <div className="h-full flex bg-white">
      {/* Left Panel - Contact List */}
      <div className="w-96 border-r flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Contactos</h1>
            <Button
              size="sm"
              className="h-8 gap-2 text-white"
              style={{ backgroundColor: '#03091D' }}
              onClick={() => setIsAddContactDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Añadir
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeTab === 'contacts' ? { backgroundColor: '#03091D' } : {}}
            >
              Contactos
            </button>
            <button
              onClick={() => setActiveTab('teammates')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'teammates'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeTab === 'teammates' ? { backgroundColor: '#03091D' } : {}}
            >
              Colegas
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, company, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {/* Recent Contacts */}
          {recentContacts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 px-4 py-2">Recent contacts</h3>
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: activeTab === 'contacts'
                            ? (contact.type === 'Paciente' ? '#E3F2FD' : contact.type === 'Proveedor' ? '#FFF3E0' : '#F5F5F5')
                            : '#E6EBF5'
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                          {getInitials(contact.name)}
                        </span>
                      </div>
                      {activeTab === 'contacts' && contact.type && (
                        <span className="text-[9px] text-gray-500 mt-1 font-medium">{contact.type}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => setSelectedContact(contact)}>
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.mainNumber}</p>
                    </div>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full flex-shrink-0 text-white"
                      style={{ backgroundColor: '#03091D' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle call action
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Contacts */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 px-4 py-2">
              {activeTab === 'contacts' ? 'Todos los contactos' : 'Todos los colegas'}
            </h3>
            {allContacts.map((contact) => (
              <div
                key={contact.id}
                className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: activeTab === 'contacts'
                          ? (contact.type === 'Paciente' ? '#E3F2FD' : contact.type === 'Proveedor' ? '#FFF3E0' : '#F5F5F5')
                          : '#E6EBF5'
                      }}
                    >
                      <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                        {getInitials(contact.name)}
                      </span>
                    </div>
                    {activeTab === 'contacts' && contact.type && (
                      <span className="text-[9px] text-gray-500 mt-1 font-medium">{contact.type}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => setSelectedContact(contact)}>
                    <p className="font-medium text-sm truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.mainNumber}</p>
                    {activeTab === 'contacts' && contact.hospital && (
                      <p className="text-xs text-gray-400 truncate">{contact.hospital}</p>
                    )}
                    {activeTab === 'teammates' && contact.department && (
                      <p className="text-xs text-gray-400 truncate">{contact.department}{contact.role ? ` • ${contact.role}` : ''}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full flex-shrink-0 text-white"
                    style={{ backgroundColor: '#03091D' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle call action
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
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

      {/* Right Panel - Contact Details */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
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

            {/* Action Buttons */}
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

          {/* Contact Information */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </h3>

              {/* Name */}
              <div className="flex items-start gap-3">
                <div className="w-6 flex justify-center pt-1">
                  <span className="text-gray-400">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="text-sm font-medium">{selectedContact.name}</p>
                </div>
              </div>

              {/* Company */}
              <div className="flex items-start gap-3">
                <div className="w-6 flex justify-center pt-1">
                  <span className="text-gray-400">🏢</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Company</p>
                  <p className="text-sm font-medium">{selectedContact.company}</p>
                </div>
              </div>

              {/* Type */}
              {activeTab === 'contacts' && selectedContact.type && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <span className="text-gray-400">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Tipo de contacto</p>
                    <p className="text-sm font-medium">{selectedContact.type}</p>
                  </div>
                </div>
              )}

              {/* Hospital */}
              {selectedContact.hospital && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <span className="text-gray-400">🏥</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Hospital de referencia</p>
                    <p className="text-sm font-medium">{selectedContact.hospital}</p>
                  </div>
                </div>
              )}

              {/* Primary Agent */}
              {activeTab === 'contacts' && selectedContact.primaryAgent && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Agente Principal</p>
                    <p className="text-sm font-medium">{selectedContact.primaryAgent}</p>
                  </div>
                </div>
              )}

              {/* Secondary Agent */}
              {activeTab === 'contacts' && selectedContact.secondaryAgent && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Agente Secundario</p>
                    <p className="text-sm font-medium">{selectedContact.secondaryAgent}</p>
                  </div>
                </div>
              )}

              {/* Department (for teammates) */}
              {activeTab === 'teammates' && selectedContact.department && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Departamento</p>
                    <p className="text-sm font-medium">{selectedContact.department}</p>
                  </div>
                </div>
              )}

              {/* Role (for teammates) */}
              {activeTab === 'teammates' && selectedContact.role && (
                <div className="flex items-start gap-3">
                  <div className="w-6 flex justify-center pt-1">
                    <span className="text-gray-400">💼</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Rol</p>
                    <p className="text-sm font-medium">{selectedContact.role}</p>
                  </div>
                </div>
              )}

              {/* Main Number */}
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

              {/* Other Numbers */}
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

              {/* Emails */}
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

              {/* Contact Integrations */}
              {selectedContact.integrations.length > 0 && (
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
                      {selectedContact.integrations.map((integration, idx) => (
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

              {/* Delete Contact */}
              <div className="pt-4 border-t">
                <Button
                  className="h-9 gap-2 text-white bg-red-600 hover:bg-red-700"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar contacto
                </Button>
              </div>
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
      )}

      {/* Delete Confirmation Dialog */}
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

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactDialogOpen} onOpenChange={setIsAddContactDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir contacto</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo contacto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Ej: María López García"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                placeholder="Ej: Tech Solutions SL"
                value={newContactCompany}
                onChange={(e) => setNewContactCompany(e.target.value)}
              />
            </div>

            {/* Type (only for contacts) */}
            {activeTab === 'contacts' && (
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de contacto</Label>
                <Select value={newContactType} onValueChange={(value: 'Paciente' | 'Proveedor' | 'Otro') => setNewContactType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paciente">Paciente</SelectItem>
                    <SelectItem value="Proveedor">Proveedor</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Hospital (only for contacts) */}
            {activeTab === 'contacts' && (
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital de referencia</Label>
                <Input
                  id="hospital"
                  placeholder="Ej: Hospital Universitario La Paz"
                  value={newContactHospital}
                  onChange={(e) => setNewContactHospital(e.target.value)}
                />
              </div>
            )}

            {/* Primary Agent (only for contacts) */}
            {activeTab === 'contacts' && (
              <div className="space-y-2">
                <Label htmlFor="primaryAgent">Agente Principal</Label>
                <Input
                  id="primaryAgent"
                  placeholder="Ej: Laura Martínez"
                  value={newContactPrimaryAgent}
                  onChange={(e) => setNewContactPrimaryAgent(e.target.value)}
                />
              </div>
            )}

            {/* Secondary Agent (only for contacts) */}
            {activeTab === 'contacts' && (
              <div className="space-y-2">
                <Label htmlFor="secondaryAgent">Agente Secundario</Label>
                <Input
                  id="secondaryAgent"
                  placeholder="Ej: Carlos Ruiz"
                  value={newContactSecondaryAgent}
                  onChange={(e) => setNewContactSecondaryAgent(e.target.value)}
                />
              </div>
            )}

            {/* Department (only for teammates) */}
            {activeTab === 'teammates' && (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  placeholder="Ej: Atención al Paciente"
                  value={newContactDepartment}
                  onChange={(e) => setNewContactDepartment(e.target.value)}
                />
              </div>
            )}

            {/* Role (only for teammates) */}
            {activeTab === 'teammates' && (
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  placeholder="Ej: Agente Principal"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                />
              </div>
            )}

            {/* Main Number */}
            <div className="space-y-2">
              <Label htmlFor="mainNumber">Número principal</Label>
              <Input
                id="mainNumber"
                placeholder="Ej: +34 607 89 43 01"
                value={newContactMainNumber}
                onChange={(e) => setNewContactMainNumber(e.target.value)}
              />
            </div>

            {/* Other Number */}
            <div className="space-y-2">
              <Label htmlFor="otherNumber">Otro número (opcional)</Label>
              <Input
                id="otherNumber"
                placeholder="Ej: +34 912 345 678"
                value={newContactOtherNumber}
                onChange={(e) => setNewContactOtherNumber(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ej: contacto@empresa.es"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddContactDialogOpen(false);
                resetAddContactForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              className="text-white"
              style={{ backgroundColor: '#03091D' }}
              onClick={handleAddContact}
            >
              Añadir contacto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

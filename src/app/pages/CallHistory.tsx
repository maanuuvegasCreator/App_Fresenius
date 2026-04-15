import { useEffect, useMemo, useState } from 'react';
import { fetchAgents, fetchCalls } from '@/lib/api-client';
import type { BackendCall } from '@/types/backend';
import { buildContactsFromCalls, mapAgentsToTeammates, mapToHistoryCalls } from '@/lib/call-mappers';
import type { HistoryCall } from '@/lib/call-mappers';
import {
  Search,
  Phone,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  MessageSquare,
  Star,
  Clock,
  Tag,
  FileText,
  CheckSquare,
  X,
  Plus,
  Mail,
  Copy,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';

type CallType = 'missed' | 'incoming' | 'outgoing';
type CallStatus = 'missed' | 'callback' | 'followup' | 'closed';

interface Call {
  id: string;
  contact: string;
  phone: string;
  type: CallType;
  status: CallStatus;
  duration: string;
  timestamp: string;
  description: string;
  tags: string[];
  hasRecording: boolean;
  summary?: string;
  keyTopics?: string[];
  actionItems?: string[];
  notes?: string;
  assignedAgent?: string;
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

function mapHistoryToPageCall(h: HistoryCall): Call {
  return {
    id: h.id,
    contact: h.contact,
    phone: h.phone,
    type: h.type,
    status: h.status,
    duration: h.duration,
    timestamp: h.timestamp,
    description: h.description,
    tags: h.tags,
    hasRecording: h.hasRecording,
    summary: h.summary,
    notes: h.notes,
  };
}

export default function CallHistory() {
  const [activeTab, setActiveTab] = useState<'calls' | 'contacts'>('calls');
  const [filterStatus, setFilterStatus] = useState<'all' | CallStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Contacts state
  const [contactsTab, setContactsTab] = useState<'contacts' | 'teammates'>('contacts');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isIntegrationsExpanded, setIsIntegrationsExpanded] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [rawCalls, setRawCalls] = useState<BackendCall[]>([]);
  const [teammatesState, setTeammatesState] = useState<Contact[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, agents] = await Promise.all([fetchCalls(500), fetchAgents()]);
        if (!cancelled) {
          setRawCalls(c);
          setTeammatesState(mapAgentsToTeammates(agents) as Contact[]);
        }
      } catch {
        if (!cancelled) {
          setRawCalls([]);
          setTeammatesState([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const calls = useMemo(
    () => mapToHistoryCalls(rawCalls).map(mapHistoryToPageCall),
    [rawCalls],
  );
  const contactsFromCalls = useMemo(
    () => buildContactsFromCalls(rawCalls) as Contact[],
    [rawCalls],
  );
  const recentContactIds = useMemo(
    () => contactsFromCalls.slice(0, 3).map((c) => c.id),
    [contactsFromCalls],
  );

  useEffect(() => {
    if (calls.length === 0) {
      setSelectedCall(null);
      return;
    }
    setSelectedCall((prev) => {
      if (!prev) return calls[0];
      const still = calls.find((x) => x.id === prev.id);
      return still ?? calls[0];
    });
  }, [calls]);

  const getCallIcon = (type: CallType, status: CallStatus) => {
    if (status === 'missed') return <PhoneMissed className="h-4 w-4 text-red-500" />;
    if (type === 'incoming') return <PhoneIncoming className="h-4 w-4 text-blue-500" />;
    return <PhoneOutgoing className="h-4 w-4 text-emerald-500" />;
  };

  const getStatusBadge = (status: CallStatus) => {
    const styles = {
      missed: 'bg-red-50 text-red-700 border-red-200',
      callback: 'bg-orange-50 text-orange-700 border-orange-200',
      followup: 'bg-blue-50 text-blue-700 border-blue-200',
      closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    const labels = {
      missed: 'Perdida',
      callback: 'Devolver llamada',
      followup: 'Seguimiento',
      closed: 'Cerrada',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phone.includes(searchQuery) ||
      (call.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || call.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredContacts = contactsFromCalls.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.mainNumber.includes(contactSearchQuery),
  );

  const filteredTeammates = teammatesState.filter(
    (contact) =>
      contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      contact.mainNumber.includes(contactSearchQuery),
  );

  const recentContacts = filteredContacts.filter((c) => recentContactIds.includes(c.id));
  const allContacts = contactsTab === "contacts" ? filteredContacts : filteredTeammates;

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

  const missedCount = calls.filter((c) => c.status === "missed").length;
  const callbackCount = calls.filter((c) => c.status === "callback").length;
  const followupCount = calls.filter((c) => c.status === "followup").length;

  return (
    <div className="size-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <h1 className="text-2xl font-semibold text-slate-900">Historial de llamadas</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Call List or Contact List */}
        <div className="w-96 bg-white border-r flex flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => {
                setActiveTab('calls');
                setSelectedContact(null);
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'calls'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Llamadas
            </button>
            <button
              onClick={() => {
                setActiveTab('contacts');
                setSelectedCall(null);
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Contactos
            </button>
          </div>

          {activeTab === 'calls' && (
            <>
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número o contacto"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="px-4 py-3 border-b flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todas {calls.length}
                </button>
                <button
                  onClick={() => setFilterStatus('missed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterStatus === 'missed'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Perdidas {missedCount}
                </button>
                <button
                  onClick={() => setFilterStatus('callback')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filterStatus === 'callback'
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  Callback {callbackCount}
                </button>
              </div>

              {/* Call List */}
              <div className="flex-1 overflow-y-auto">
                {filteredCalls.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Phone className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No se encontraron llamadas</p>
                  </div>
                ) : (
                  filteredCalls.map((call) => (
                    <button
                      key={call.id}
                      onClick={() => setSelectedCall(call)}
                      className={`w-full p-4 border-b text-left hover:bg-slate-50 transition-colors ${
                        selectedCall?.id === call.id ? 'bg-slate-50 border-l-4 border-l-slate-900' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold" style={{ color: '#001963' }}>
                            {call.contact
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-slate-900 text-sm truncate">{call.contact}</p>
                            <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">{call.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{call.phone}</p>
                          <p className="text-xs text-slate-500 mb-2 truncate">{call.description}</p>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {getStatusBadge(call.status)}
                            {call.duration !== '00:00' && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {call.duration}
                              </span>
                            )}
                            {call.hasRecording && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ backgroundColor: '#E6EBF5', color: '#001963' }}>
                                <Play className="h-3 w-3" />
                                Grabación
                              </span>
                            )}
                          </div>
                          {call.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {call.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'contacts' && (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg font-semibold">Contacts</h1>
                  <Button
                    size="sm"
                    className="h-8 gap-2 text-white"
                    style={{ backgroundColor: '#03091D' }}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setContactsTab('contacts')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      contactsTab === 'contacts'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={contactsTab === 'contacts' ? { backgroundColor: '#00A884' } : {}}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => setContactsTab('teammates')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      contactsTab === 'teammates'
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={contactsTab === 'teammates' ? { backgroundColor: '#00A884' } : {}}
                  >
                    Teammates
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, company, or number..."
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
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
                )}

                {/* All Contacts */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 px-4 py-2">All contacts</h3>
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
            </>
          )}
        </div>

        {/* Right Panel - Call Details or Contact Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'contacts' ? (
            // Contact Details
            selectedContact ? (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
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
                        style={{ backgroundColor: '#00A884' }}
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-12 rounded-xl"
                        style={{ borderColor: '#001963' }}
                      >
                        <MessageSquare className="h-5 w-5" style={{ color: '#001963' }} />
                      </Button>
                    </div>
                  </div>
  
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                      Contact
                    </h3>
  
                    <div className="space-y-6">
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
  
                      <div className="pt-4">
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          Delete contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="size-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Phone className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium mb-2">Selecciona un contacto</p>
                  <p className="text-sm">Ver detalles e información de contacto</p>
                </div>
              </div>
            )
          ) : (
            // Call Details
            selectedCall ? (
              <>
                {/* Header */}
                <div className="p-6 border-b bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-semibold" style={{ color: '#001963' }}>
                          {selectedCall.contact.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#001963' }}>{selectedCall.contact}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">{selectedCall.phone}</span>
                          {getStatusBadge(selectedCall.status)}
                          <span className="text-sm text-slate-500">{selectedCall.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCall(null)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>

                  {selectedCall.hasRecording && (
                    <div className="flex items-center gap-3 p-4 rounded-lg border mb-4" style={{ backgroundColor: '#E6EBF5', borderColor: '#03091D' }}>
                      <Button size="sm" className="gap-2 text-white hover:opacity-90" style={{ backgroundColor: '#03091D' }}>
                        <Play className="h-4 w-4" />
                        Reproducir grabación
                      </Button>
                      <span className="text-sm" style={{ color: '#03091D' }}>Duración: {selectedCall.duration}</span>
                    </div>
                  )}

                  {/* Timeline Tab */}
                  <div className="flex items-center gap-6 text-sm border-b -mb-px">
                    <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                      Timeline
                    </button>
                  </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-xs font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border">
                        {selectedCall.timestamp}
                      </div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="bg-white rounded-lg border p-6 mb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {getCallIcon(selectedCall.type, selectedCall.status)}
                        </div>
                        <div className="flex-1">
                          {selectedCall.type === 'missed' ? (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                Llamada perdida por agente {selectedCall.assignedAgent || 'No asignado'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">Llamada atendida por agente</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <User className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Clock className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {selectedCall.status === 'closed' && (
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-medium mb-2">Transcripción</div>
                                <div className="text-sm text-muted-foreground space-y-3">
                                  <p><strong>Agente:</strong> Hola, buenos días. Gracias por llamar. ¿En qué puedo ayudarle?</p>
                                  <p><strong>Cliente:</strong> Buenos días. Necesito ayuda con mi cuenta y revisar mi última factura.</p>
                                  <p><strong>Agente:</strong> Por supuesto, estaré encantado de ayudarle. Permítame un momento para revisar su información.</p>
                                  <p><strong>Cliente:</strong> Perfecto, gracias.</p>
                                  <p><strong>Agente:</strong> Ya he revisado su cuenta. ¿Qué necesita saber sobre su factura?</p>
                                  <p><strong>Cliente:</strong> Hay un cargo que no reconozco del mes pasado.</p>
                                  <p><strong>Agente:</strong> Entiendo su preocupación. Déjeme verificar ese cargo específico.</p>
                                  <p><strong>Cliente:</strong> De acuerdo, gracias por su ayuda.</p>
                                  <p><strong>Agente:</strong> He verificado el cargo y veo que corresponde al servicio adicional que contrató. ¿Le gustaría que le enviara un desglose detallado?</p>
                                  <p><strong>Cliente:</strong> Sí, por favor. Eso sería muy útil.</p>
                                  <p><strong>Agente:</strong> Perfecto, se lo enviaré a su correo electrónico en los próximos minutos. ¿Hay algo más en lo que pueda ayudarle?</p>
                                  <p><strong>Cliente:</strong> No, eso es todo. Muchas gracias por su asistencia.</p>
                                  <p><strong>Agente:</strong> Ha sido un placer ayudarle. Que tenga un excelente día.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-xs font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border">
                      Earlier
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
              </>
            ) : (
              <div className="size-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Phone className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium mb-2">Selecciona una llamada</p>
                  <p className="text-sm">Ver detalles, resumen y grabaciones</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

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

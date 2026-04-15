import { useState } from 'react';
import { 
  Search, 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  X,
  PhoneMissed,
  Headphones,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

interface LiveCall {
  id: string;
  agent: {
    name: string;
    avatar: string;
  };
  location: string;
  customer: string;
  phone: string;
  type: 'incoming' | 'outgoing';
  status: 'ringing' | 'in-call' | 'coaching';
  duration: string;
  startTime: string;
}

interface UserStatus {
  name: string;
  status: 'available' | 'busy' | 'offline';
  duration: string;
}

const mockLiveCalls: LiveCall[] = [
  {
    id: '1',
    agent: { name: 'Isabel Rivera', avatar: 'IR' },
    location: 'Ibáñez, New Jersey',
    customer: 'Mira Rosales',
    phone: '+34 601 234 567',
    type: 'incoming',
    status: 'coaching',
    duration: '5:45:42',
    startTime: '5:45:42 PM'
  },
  {
    id: '2',
    agent: { name: 'Florian Rossignol', avatar: 'FR' },
    location: 'Fla-UK',
    customer: 'James Baker',
    phone: '+44 20 7946 0958',
    type: 'incoming',
    status: 'in-call',
    duration: '5:45:42',
    startTime: '5:45:42 PM'
  },
  {
    id: '3',
    agent: { name: 'Lennart Schott', avatar: 'LS' },
    location: 'SDA Lennart Schott, Berlin',
    customer: 'Lorenzo Silo',
    phone: '+49 30 901820',
    type: 'in-call',
    status: 'ringing',
    duration: '5:45:42',
    startTime: '5:45:42 PM'
  },
  {
    id: '4',
    agent: { name: 'Yasmine Kassis', avatar: 'YK' },
    location: 'Yasmine Kassis',
    customer: 'PATRICK NELLAN',
    phone: '+33 1 42 86 82 00',
    type: 'incoming',
    status: 'in-call',
    duration: '5:05:28',
    startTime: '5:05:28 PM'
  },
  {
    id: '5',
    agent: { name: 'Lauren Alexander', avatar: 'LA' },
    location: 'Prod. Sol. AV vs. EN (BRIC PROS) D...',
    customer: '+44 7796 456080',
    phone: '+44 7796 456080',
    type: 'incoming',
    status: 'in-call',
    duration: '4:59:45',
    startTime: '4:59:45 PM'
  },
  {
    id: '6',
    agent: { name: 'Juliette Angivent', avatar: 'JA' },
    location: 'Juliette Angivent',
    customer: 'Michael Guilbert',
    phone: '+33 1 42 86 82 00',
    type: 'outgoing',
    status: 'ringing',
    duration: '5:45:42',
    startTime: '5:45:42 PM'
  },
  {
    id: '7',
    agent: { name: 'Martina Barriga', avatar: 'MB' },
    location: 'Martina [Madrid]',
    customer: '+34 674 49 12 35',
    phone: '+34 674 49 12 35',
    type: 'outgoing',
    status: 'in-call',
    duration: '5:52:34',
    startTime: '5:52:34 PM'
  }
];

const mockUserStatus: UserStatus[] = [
  { name: 'Alex Morales', status: 'available', duration: '2h' },
  { name: 'Juan Duits', status: 'busy', duration: '15m' },
  { name: 'Kevin Montealegre', status: 'busy', duration: '15m' },
  { name: 'Lina Smith', status: 'available', duration: '1h' },
  { name: 'Anne Kathleen Koch', status: 'busy', duration: '32m' },
  { name: 'Guillermo Castella...', status: 'offline', duration: '6m' },
  { name: 'Martina Lima', status: 'offline', duration: '8m' },
  { name: 'Oscar Bartra', status: 'available', duration: '45m' },
  { name: 'Yakrit Gouveia', status: 'busy', duration: '12m' },
  { name: 'Thomas Guilbot', status: 'available', duration: '3h' },
  { name: 'Paulina Sánchez', status: 'offline', duration: '1h' },
  { name: 'Maria Torres', status: 'available', duration: '22m' },
  { name: 'Camelia Esperón', status: 'busy', duration: '26m' },
  { name: 'José Reyes', status: 'available', duration: '11m' }
];

export default function LiveMonitoring() {
  const [activeFilter, setActiveFilter] = useState<'calls' | 'users' | 'numbers'>('calls');
  const [showUserStatus, setShowUserStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const availableCount = mockUserStatus.filter(u => u.status === 'available').length;
  const busyCount = mockUserStatus.filter(u => u.status === 'busy').length;
  const offlineCount = mockUserStatus.filter(u => u.status === 'offline').length;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-emerald-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-slate-300';
      default: return 'bg-slate-300';
    }
  };

  const getCallIcon = (type: string) => {
    if (type === 'incoming') return <PhoneIncoming className="h-4 w-4 text-emerald-600" />;
    if (type === 'outgoing') return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
    return <Phone className="h-4 w-4 text-slate-600" />;
  };

  return (
    <div className="size-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Monitorización en Vivo</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              Hoy
            </Button>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800">
              Guardar
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-6 gap-6">
          {/* Active Calls */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 uppercase tracking-wide">Activas</span>
              <div className="relative h-12 w-12">
                <svg className="transform -rotate-90 h-12 w-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#ef4444"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(35/50) * 125.6} 125.6`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">35</span>
              </div>
            </div>
            <div className="text-xs text-slate-500">de 50</div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-xs text-slate-600 uppercase tracking-wide block mb-2">Usuarios</span>
            <div className="text-2xl font-semibold text-slate-900 mb-1">1,560</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>394</span>
            </div>
          </div>

          {/* Teams */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-xs text-slate-600 uppercase tracking-wide block mb-2">Equipos</span>
            <div className="text-2xl font-semibold text-slate-900 mb-1">1,166</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>130</span>
            </div>
          </div>

          {/* Time to answer */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-xs text-slate-600 uppercase tracking-wide block mb-2">Time to answer</span>
            <div className="text-2xl font-semibold text-slate-900 mb-1">11s</div>
            <div className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              <span>264 current</span>
            </div>
          </div>

          {/* Calls waiting */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-xs text-slate-600 uppercase tracking-wide block mb-2">Calls waiting</span>
            <div className="text-2xl font-semibold text-slate-900 mb-1">0</div>
            <div className="text-xs text-slate-500">-</div>
          </div>

          {/* Missed calls */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-xs text-slate-600 uppercase tracking-wide block mb-2">Missed calls</span>
            <div className="text-2xl font-semibold text-slate-900 mb-1">226</div>
            <div className="text-xs text-red-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>22%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Call List */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Filters and Search */}
          <div className="px-8 py-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveFilter('calls')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === 'calls'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="h-4 w-4 inline mr-2" />
                  Calls
                </button>
                <button
                  onClick={() => setActiveFilter('users')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === 'users'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Users
                </button>
                <button
                  onClick={() => setActiveFilter('numbers')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === 'numbers'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Numbers
                </button>
              </div>

              <div className="text-sm text-slate-600">
                <span className="font-medium">1556</span> calls
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="px-8 py-3 border-b bg-slate-50">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-600 uppercase tracking-wide">
              <div className="col-span-1"></div>
              <div className="col-span-2">User</div>
              <div className="col-span-3">Number</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Dir</div>
              <div className="col-span-2">Started at</div>
              <div className="col-span-1"></div>
            </div>
          </div>

          {/* Call Rows */}
          <div className="flex-1 overflow-y-auto">
            {mockLiveCalls.map((call) => (
              <div key={call.id} className="px-8 py-4 border-b hover:bg-slate-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 flex justify-center">
                    {getCallIcon(call.type)}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-slate-200">
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                          {call.agent.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-900 font-medium">{call.agent.name}</span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://flagcdn.com/w20/${call.location.includes('UK') ? 'gb' : call.location.includes('Berlin') ? 'de' : call.location.includes('Madrid') ? 'es' : 'fr'}.png`}
                        alt=""
                        className="h-4 w-5 rounded object-cover"
                      />
                      <span className="text-sm text-slate-700">{call.location}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-sm text-slate-900">{call.customer}</div>
                    <div className="text-xs text-slate-500">{call.phone}</div>
                  </div>

                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      {call.type === 'incoming' ? (
                        <PhoneIncoming className="h-3 w-3 text-slate-400" />
                      ) : (
                        <PhoneOutgoing className="h-3 w-3 text-slate-400" />
                      )}
                      <span className="text-xs text-slate-500">
                        {call.type === 'incoming' ? 'In' : 'Out'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-slate-700">{call.startTime}</span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    {call.status === 'coaching' && (
                      <Button size="sm" variant="outline" className="gap-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                        <Headphones className="h-4 w-4" />
                        Coach
                      </Button>
                    )}
                    {call.status === 'in-call' && (
                      <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Status Panel */}
        {showUserStatus && (
          <div className="w-80 bg-white border-l flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">User status</h3>
              <button
                onClick={() => setShowUserStatus(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Status Summary */}
            <div className="px-6 py-6 border-b">
              <div className="text-center mb-4">
                <div className="text-4xl font-semibold text-slate-900 mb-2">804</div>
                <div className="text-sm text-slate-600">Calls waiting</div>
              </div>

              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="absolute left-0 top-0 h-full bg-emerald-500" 
                  style={{ width: `${(availableCount / mockUserStatus.length) * 100}%` }}
                />
                <div 
                  className="absolute top-0 h-full bg-orange-500" 
                  style={{ 
                    left: `${(availableCount / mockUserStatus.length) * 100}%`,
                    width: `${(busyCount / mockUserStatus.length) * 100}%` 
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">Available</span>
                  </div>
                  <span className="font-semibold text-slate-900">{availableCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-slate-600">Busy</span>
                  </div>
                  <span className="font-semibold text-slate-900">{busyCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="text-slate-600">Offline</span>
                  </div>
                  <span className="font-semibold text-slate-900">{offlineCount}</span>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {mockUserStatus.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8 bg-slate-200">
                          <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                      </div>
                      <span className="text-sm text-slate-900">{user.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{user.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!showUserStatus && (
          <button
            onClick={() => setShowUserStatus(true)}
            className="fixed right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-3 rounded-l-lg shadow-lg hover:bg-slate-800 transition-colors"
          >
            <Users className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

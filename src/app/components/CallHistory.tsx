import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useState } from 'react';

interface CallRecord {
  id: string;
  contact: string;
  phone: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: string;
  timestamp: string;
  tags: string[];
  notes?: string;
}

interface CallHistoryProps {
  onCall: (phone: string, name: string) => void;
}

const callHistory: CallRecord[] = [
  {
    id: '1',
    contact: 'Alice Johnson',
    phone: '+1 (555) 123-4567',
    type: 'incoming',
    duration: '05:23',
    timestamp: '2 hours ago',
    tags: ['support', 'urgent'],
    notes: 'Customer inquiry about billing',
  },
  {
    id: '2',
    contact: 'Bob Smith',
    phone: '+1 (555) 234-5678',
    type: 'outgoing',
    duration: '12:45',
    timestamp: '5 hours ago',
    tags: ['sales'],
    notes: 'Follow-up on proposal',
  },
  {
    id: '3',
    contact: 'Carol Williams',
    phone: '+1 (555) 345-6789',
    type: 'missed',
    duration: '',
    timestamp: 'Yesterday',
    tags: [],
  },
  {
    id: '4',
    contact: 'David Brown',
    phone: '+1 (555) 456-7890',
    type: 'outgoing',
    duration: '03:12',
    timestamp: 'Yesterday',
    tags: ['demo'],
    notes: 'Product demonstration completed',
  },
  {
    id: '5',
    contact: 'Emma Davis',
    phone: '+1 (555) 567-8901',
    type: 'incoming',
    duration: '08:56',
    timestamp: '2 days ago',
    tags: ['support'],
  },
  {
    id: '6',
    contact: 'Frank Miller',
    phone: '+1 (555) 678-9012',
    type: 'outgoing',
    duration: '01:34',
    timestamp: '2 days ago',
    tags: ['follow-up'],
  },
  {
    id: '7',
    contact: 'Grace Wilson',
    phone: '+1 (555) 789-0123',
    type: 'incoming',
    duration: '15:22',
    timestamp: '3 days ago',
    tags: ['sales', 'new-customer'],
    notes: 'Interested in enterprise plan',
  },
];

export function CallHistory({ onCall }: CallHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = callHistory.filter(record => 
    record.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.phone.includes(searchQuery) ||
    record.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing':
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case 'missed':
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search call history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {filteredHistory.map((record) => (
            <div
              key={record.id}
              className="p-4 rounded-lg hover:bg-accent transition-colors border"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getCallIcon(record.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-medium">{record.contact}</p>
                      <p className="text-sm text-muted-foreground">{record.phone}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {record.timestamp}
                    </span>
                  </div>
                  
                  {record.duration && (
                    <p className="text-sm text-muted-foreground mb-2">Duration: {record.duration}</p>
                  )}
                  
                  {record.notes && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{record.notes}</p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {record.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full flex-shrink-0"
                  onClick={() => onCall(record.phone, record.contact)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
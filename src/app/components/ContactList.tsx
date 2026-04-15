import { Phone, Mail, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
}

interface ContactListProps {
  onCall: (phone: string, name: string) => void;
}

const contacts: Contact[] = [
  { 
    id: '1', 
    name: 'Alice Johnson', 
    phone: '+1 (555) 123-4567', 
    email: 'alice.j@company.com',
    company: 'Acme Corp',
    tags: ['VIP', 'Enterprise']
  },
  { 
    id: '2', 
    name: 'Bob Smith', 
    phone: '+1 (555) 234-5678', 
    email: 'bob.smith@email.com',
    company: 'TechStart Inc',
    tags: ['Lead']
  },
  { 
    id: '3', 
    name: 'Carol Williams', 
    phone: '+1 (555) 345-6789', 
    email: 'carol.w@business.com',
    company: 'Global Solutions',
    tags: ['Support']
  },
  { 
    id: '4', 
    name: 'David Brown', 
    phone: '+1 (555) 456-7890', 
    email: 'david.b@startup.io',
    tags: ['Demo']
  },
  { 
    id: '5', 
    name: 'Emma Davis', 
    phone: '+1 (555) 567-8901', 
    email: 'emma.d@example.com',
    company: 'Digital Agency',
    tags: ['Customer']
  },
  { 
    id: '6', 
    name: 'Frank Miller', 
    phone: '+1 (555) 678-9012', 
    email: 'frank.m@company.net',
    tags: ['Partner']
  },
  { 
    id: '7', 
    name: 'Grace Wilson', 
    phone: '+1 (555) 789-0123', 
    email: 'grace.w@firm.com',
    company: 'Marketing Pro',
    tags: ['VIP', 'Lead']
  },
  { 
    id: '8', 
    name: 'Henry Moore', 
    phone: '+1 (555) 890-1234', 
    email: 'henry.m@enterprise.com',
    company: 'Enterprise LLC',
    tags: ['Enterprise']
  },
];

export function ContactList({ onCall }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent transition-colors border"
            >
              <Avatar className="mt-1">
                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    {contact.company && (
                      <p className="text-sm text-muted-foreground">{contact.company}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="default"
                size="icon"
                className="rounded-full flex-shrink-0"
                onClick={() => onCall(contact.phone, contact.name)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
import { Phone, Mail, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useMemo, useState } from "react";

export type ContactListRow = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
};

interface ContactListProps {
  onCall: (phone: string, name: string) => void;
  /** Contactos derivados de llamadas reales (API). */
  contacts?: ContactListRow[];
}

export function ContactList({ onCall, contacts = [] }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone.includes(searchQuery) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.company || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [contacts, searchQuery],
  );

  const getInitials = (name: string) => {
    const parts = name.split(" ");
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
            placeholder="Buscar contactos…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-6 text-center">
              No hay contactos derivados de llamadas o aún no se han cargado datos del API.
            </p>
          ) : null}
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
                    {contact.company ? <p className="text-sm text-muted-foreground">{contact.company}</p> : null}
                  </div>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.email ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  ) : null}
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

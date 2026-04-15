import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import type { HistoryCall } from "@/lib/call-mappers";

interface CallHistoryProps {
  onCall: (phone: string, name: string) => void;
  /** Historial desde la API (Twilio + ElevenLabs). Si falta, la lista queda vacía. */
  records?: HistoryCall[];
}

export function CallHistory({ onCall, records = [] }: CallHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(
    () =>
      records.filter(
        (record) =>
          record.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.phone.includes(searchQuery) ||
          record.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (record.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [records, searchQuery],
  );

  const getCallIcon = (type: string) => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case "outgoing":
        return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case "missed":
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
            placeholder="Buscar en historial…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {filteredHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2 py-6 text-center">
              No hay llamadas en el historial o aún no se han cargado desde el API.
            </p>
          ) : null}
          {filteredHistory.map((record) => (
            <div key={record.id} className="p-4 rounded-lg hover:bg-accent transition-colors border">
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

                  {record.duration ? (
                    <p className="text-sm text-muted-foreground mb-2">Duración: {record.duration}</p>
                  ) : null}

                  {(record.notes || record.description) ? (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {record.notes || record.description}
                    </p>
                  ) : null}

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

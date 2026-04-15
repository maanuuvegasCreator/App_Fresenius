import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Users, History, X, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialpad } from '../components/Dialpad';
import { EnhancedActiveCall } from '../components/EnhancedActiveCall';
import { ContactList } from '../components/ContactList';
import { CallHistory } from '../components/CallHistory';
import { StatusSelector } from '../components/StatusSelector';

export function Dashboard() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [activeContact, setActiveContact] = useState('');
  const [activePhone, setActivePhone] = useState('');
  const [activeView, setActiveView] = useState<'dialpad' | 'contacts' | 'history'>('dialpad');
  const [userStatus, setUserStatus] = useState<'available' | 'busy' | 'away'>('available');

  const handleCall = (number?: string, name?: string) => {
    const numberToCall = number || phoneNumber;
    if (numberToCall) {
      setActiveContact(name || numberToCall);
      setActivePhone(number || phoneNumber);
      setIsInCall(true);
      setPhoneNumber('');
    }
  };

  const handleEndCall = (notes: string, tags: string[]) => {
    console.log('Call ended with notes:', notes, 'and tags:', tags);
    setIsInCall(false);
    setActiveContact('');
    setActivePhone('');
  };

  const handleClearInput = () => {
    setPhoneNumber('');
  };

  if (isInCall) {
    return (
      <div className="size-full bg-background">
        <EnhancedActiveCall 
          contact={activeContact} 
          phone={activePhone}
          onEndCall={handleEndCall} 
        />
      </div>
    );
  }

  return (
    <div className="size-full flex bg-background">
      {/* Sidebar */}
      <div className="w-20 border-r flex flex-col items-center py-6 gap-6 bg-muted/30">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Phone className="h-5 w-5 text-primary-foreground" />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <Button
            variant={activeView === 'dialpad' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('dialpad')}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === 'contacts' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('contacts')}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant={activeView === 'history' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg"
            onClick={() => setActiveView('history')}
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg"
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">
              {activeView === 'dialpad' && 'Marcador'}
              {activeView === 'contacts' && 'Contactos'}
              {activeView === 'history' && 'Historial de Llamadas'}
            </h1>
          </div>
          <div className="w-48">
            <StatusSelector status={userStatus} onStatusChange={setUserStatus} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'dialpad' && (
            <div className="h-full flex items-center justify-center p-6">
              <Card className="w-full max-w-md p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ingresa número de teléfono"
                      className="text-center text-xl h-14 pr-10"
                      readOnly
                    />
                    {phoneNumber && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={handleClearInput}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Dialpad value={phoneNumber} onChange={setPhoneNumber} />
                
                <div className="flex justify-center mt-6">
                  <Button
                    size="lg"
                    className="rounded-full h-16 w-16"
                    onClick={() => handleCall()}
                    disabled={!phoneNumber}
                  >
                    <Phone className="h-6 w-6" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeView === 'contacts' && (
            <div className="h-full">
              <ContactList onCall={handleCall} />
            </div>
          )}

          {activeView === 'history' && (
            <div className="h-full">
              <CallHistory onCall={handleCall} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
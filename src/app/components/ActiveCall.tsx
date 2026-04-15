import { Phone, Mic, MicOff, Volume2, VolumeX, PhoneOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useEffect, useState } from 'react';

interface ActiveCallProps {
  contact: string;
  onEndCall: () => void;
}

export function ActiveCall({ contact, onEndCall }: ActiveCallProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarFallback className="text-2xl">{getInitials(contact)}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl mb-2">{contact}</h2>
        <p className="text-muted-foreground">{formatDuration(duration)}</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center gap-6">
          <Button
            variant={isMuted ? 'default' : 'outline'}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button
            variant={isSpeaker ? 'default' : 'outline'}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => setIsSpeaker(!isSpeaker)}
          >
            {isSpeaker ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            variant="destructive"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={onEndCall}
          >
            <PhoneOff className="h-7 w-7" />
          </Button>
        </div>
      </div>
    </div>
  );
}

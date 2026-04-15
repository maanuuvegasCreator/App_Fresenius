import { Delete } from 'lucide-react';
import { Button } from './ui/button';

interface DialpadProps {
  value: string;
  onChange: (value: string) => void;
}

const buttons = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export function Dialpad({ value, onChange }: DialpadProps) {
  const handleDigit = (digit: string) => {
    onChange(value + digit);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleLongPress = (digit: string) => {
    if (digit === '0') {
      onChange(value + '+');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-3 p-4">
        {buttons.map((button) => (
          <Button
            key={button.digit}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center hover:bg-accent"
            onClick={() => handleDigit(button.digit)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleLongPress(button.digit);
            }}
          >
            <span className="text-2xl">{button.digit}</span>
            {button.letters && (
              <span className="text-xs text-muted-foreground">{button.letters}</span>
            )}
          </Button>
        ))}
      </div>
      <div className="flex justify-center mt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackspace}
          disabled={!value}
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
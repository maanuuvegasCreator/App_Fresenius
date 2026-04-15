import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

interface ScheduleConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  [key: string]: ScheduleConfig;
}

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [autoRecordingEnabled, setAutoRecordingEnabled] = useState(true);
  const [pauseRecordingEnabled, setPauseRecordingEnabled] = useState(true);
  const [outboundRecordingEnabled, setOutboundRecordingEnabled] = useState(true);
  const [holdMessageEnabled, setHoldMessageEnabled] = useState(true);
  const [holdMessageDelay, setHoldMessageDelay] = useState('30');

  const [businessHoursMessage, setBusinessHoursMessage] = useState('Su llamada está siendo grabada con fines de calidad y formación.');
  const [afterHoursMessage, setAfterHoursMessage] = useState('Nuestro horario de atención es de lunes a jueves de 8:00 a 17:00 y viernes de 8:00 a 15:00. Por favor, deje su mensaje.');
  const [outboundRecordingMessage, setOutboundRecordingMessage] = useState('Esta llamada será grabada con fines de calidad.');
  const [holdMessage, setHoldMessage] = useState('Por favor, permanezca a la espera. Un agente le atenderá en breve.');

  const [scheduleExpanded, setScheduleExpanded] = useState(true);

  const [schedule, setSchedule] = useState<DaySchedule>({
    lunes: { enabled: true, startTime: '08:00', endTime: '17:00' },
    martes: { enabled: true, startTime: '08:00', endTime: '17:00' },
    miercoles: { enabled: true, startTime: '08:00', endTime: '17:00' },
    jueves: { enabled: true, startTime: '08:00', endTime: '17:00' },
    viernes: { enabled: true, startTime: '08:00', endTime: '15:00' },
    sabado: { enabled: false, startTime: '08:00', endTime: '17:00' },
    domingo: { enabled: false, startTime: '08:00', endTime: '17:00' },
  });

  const handleScheduleChange = (day: string, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const dayNames: { [key: string]: string } = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">Ajustes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-8">

          {/* Números Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6" style={{ color: '#03091D' }}>Números</h2>

            {/* Llamadas Entrantes */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Llamadas entrantes</h3>

              {/* Auto Recording Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-sm font-medium">Grabación automática</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Iniciar grabación automáticamente al recibir llamadas
                  </p>
                </div>
                <Switch
                  checked={autoRecordingEnabled}
                  onCheckedChange={setAutoRecordingEnabled}
                />
              </div>

              {autoRecordingEnabled && (
                <>
                  {/* Schedule Configuration */}
                  <div className="mb-6">
                    <button
                      onClick={() => setScheduleExpanded(!scheduleExpanded)}
                      className="flex items-center justify-between w-full mb-4"
                    >
                      <Label className="text-sm font-medium">Configurar horario por día de la semana</Label>
                      {scheduleExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {scheduleExpanded && (
                      <div className="space-y-4 bg-white rounded-lg p-4">
                        {Object.keys(schedule).map((day) => (
                          <div key={day} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 w-32">
                              <Switch
                                checked={schedule[day].enabled}
                                onCheckedChange={(checked) => handleScheduleChange(day, 'enabled', checked)}
                              />
                              <Label className="text-sm">{dayNames[day]}</Label>
                            </div>

                            {schedule[day].enabled && (
                              <>
                                <Input
                                  type="time"
                                  value={schedule[day].startTime}
                                  onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                                  className="w-32"
                                />
                                <span className="text-gray-500">a</span>
                                <Input
                                  type="time"
                                  value={schedule[day].endTime}
                                  onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                                  className="w-32"
                                />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Business Hours Message */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">
                      Mensaje durante horario laboral
                    </Label>
                    <textarea
                      value={businessHoursMessage}
                      onChange={(e) => setBusinessHoursMessage(e.target.value)}
                      className="w-full p-3 border rounded-lg text-sm min-h-[80px] resize-none"
                      placeholder="Ingrese el mensaje que se reproducirá durante el horario laboral"
                    />
                  </div>

                  {/* After Hours Message */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">
                      Mensaje fuera de horario laboral
                    </Label>
                    <textarea
                      value={afterHoursMessage}
                      onChange={(e) => setAfterHoursMessage(e.target.value)}
                      className="w-full p-3 border rounded-lg text-sm min-h-[80px] resize-none"
                      placeholder="Ingrese el mensaje que se reproducirá fuera del horario laboral"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Fuera de horario: Lunes-Jueves 17:00-8:00h, Viernes 15:00 - Lunes 8:00h
                    </p>
                  </div>
                </>
              )}

              {/* Pause Recording */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Pausar grabación durante llamada</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Permitir pausar y reanudar la grabación manualmente
                  </p>
                </div>
                <Switch
                  checked={pauseRecordingEnabled}
                  onCheckedChange={setPauseRecordingEnabled}
                />
              </div>
            </div>

            {/* Llamadas Salientes */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Llamadas salientes</h3>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-sm font-medium">Mensaje de grabación</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Reproducir mensaje al inicio de llamadas salientes
                  </p>
                </div>
                <Switch
                  checked={outboundRecordingEnabled}
                  onCheckedChange={setOutboundRecordingEnabled}
                />
              </div>

              {outboundRecordingEnabled && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Mensaje de grabación
                  </Label>
                  <textarea
                    value={outboundRecordingMessage}
                    onChange={(e) => setOutboundRecordingMessage(e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm min-h-[80px] resize-none"
                    placeholder="Ingrese el mensaje que se reproducirá al inicio de las llamadas salientes"
                  />
                </div>
              )}
            </div>

            {/* Mensaje en espera */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Mensaje en espera</h3>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <Label className="text-sm font-medium">Activar mensaje en espera</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Reproducir mensaje cuando el cliente está en espera
                  </p>
                </div>
                <Switch
                  checked={holdMessageEnabled}
                  onCheckedChange={setHoldMessageEnabled}
                />
              </div>

              {holdMessageEnabled && (
                <>
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">
                      Mensaje en espera
                    </Label>
                    <textarea
                      value={holdMessage}
                      onChange={(e) => setHoldMessage(e.target.value)}
                      className="w-full p-3 border rounded-lg text-sm min-h-[80px] resize-none"
                      placeholder="Ingrese el mensaje que se reproducirá mientras el cliente espera"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Retraso antes del mensaje (segundos)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max="300"
                        value={holdMessageDelay}
                        onChange={(e) => setHoldMessageDelay(e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">
                        El mensaje se reproducirá después de {holdMessageDelay} segundos en espera
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-gray-50">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: '#03091D' }}
            onClick={onClose}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

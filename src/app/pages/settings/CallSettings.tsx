import { useState } from 'react';
import { SettingsLayout } from '../../components/SettingsLayout';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Clock, PhoneForwarded, Mic, Eye, PhoneOff, Plus, MoreVertical, X, PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';
import IVRFlowBuilder from '../../components/IVRFlowBuilder';

interface ScheduleConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  [key: string]: ScheduleConfig;
}

export function CallSettings() {
  const [wrapUpTime, setWrapUpTime] = useState('30');
  const [autoClose, setAutoClose] = useState(false);
  const [autoEndWrapUp, setAutoEndWrapUp] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [externalNumber, setExternalNumber] = useState('');
  const [blockedNumbers, setBlockedNumbers] = useState([
    { id: '1', number: '+1 661 763', country: 'US' },
    { id: '2', number: '+61 490 692', country: 'AU' },
    { id: '3', number: '+61 430 065', country: 'AU' },
    { id: '4', number: '+33 6 63 62 13', country: 'FR' },
    { id: '5', number: '+33 1 87 66 87', country: 'FR' },
    { id: '6', number: '+212 608', country: 'MA' },
    { id: '7', number: '+1 844 584', country: 'US' },
    { id: '8', number: '+971 54 508', country: 'AE' },
    { id: '9', number: '+41 872', country: 'CH' },
  ]);
  const [isAddBlockedNumberOpen, setIsAddBlockedNumberOpen] = useState(false);
  const [newBlockedNumber, setNewBlockedNumber] = useState('');
  const [isIVRBuilderOpen, setIsIVRBuilderOpen] = useState(false);

  // Settings from Centro de llamadas / Ajustes
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
    <SettingsLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Configuración de llamadas</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl space-y-8">
            {/* Tiempo de finalización */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Clock className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Tiempo de finalización</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Establece un tiempo para completar tareas después de terminar una conversación. Durante este tiempo, no recibirás nuevas llamadas entrantes hasta que el temporizador termine o lo detengas manualmente.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="wrap-time">Duración del tiempo de finalización</Label>
                    <Select value={wrapUpTime} onValueChange={setWrapUpTime}>
                      <SelectTrigger id="wrap-time" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin tiempo de finalización</SelectItem>
                        <SelectItem value="15">15 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">60 segundos</SelectItem>
                        <SelectItem value="90">90 segundos</SelectItem>
                        <SelectItem value="120">2 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Cerrar automáticamente la conversación */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Clock className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Cerrar automáticamente la conversación tras la llamada</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoClose}
                        onChange={(e) => setAutoClose(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: autoClose ? '#001963' : undefined }}></div>
                    </label>
                  </div>
                  <p className="text-sm text-slate-600">
                    Las conversaciones se cierran automáticamente al finalizar la llamada, en lugar de permanecer abiertas.
                  </p>
                </div>
              </div>
            </div>

            {/* Finalizar automáticamente el tiempo de finalización */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Clock className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Finalizar automáticamente el tiempo de finalización al completar el trabajo post-llamada</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoEndWrapUp}
                        onChange={(e) => setAutoEndWrapUp(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: autoEndWrapUp ? '#001963' : undefined }}></div>
                    </label>
                  </div>
                  <p className="text-sm text-slate-600">
                    El tiempo de finalización termina automáticamente una vez completadas todas las tareas post-llamada.
                  </p>
                </div>
              </div>
            </div>

            {/* Mantener la aplicación siempre visible */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Eye className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">Mantener la aplicación siempre visible</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alwaysOnTop}
                        onChange={(e) => setAlwaysOnTop(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: alwaysOnTop ? '#001963' : undefined }}></div>
                    </label>
                  </div>
                  <p className="text-sm text-slate-600">
                    Aircall Workspace se mantiene visible por encima de otras ventanas (solo en la aplicación de escritorio).
                  </p>
                </div>
              </div>
            </div>

            {/* Reenviar a número externo */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <PhoneForwarded className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Reenviar a número externo</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Configura un número de teléfono externo para reenviar las llamadas recibidas en Aircall.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="external-number">Número de teléfono externo</Label>
                    <Input
                      id="external-number"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={externalNumber}
                      onChange={(e) => setExternalNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de IVR */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <PhoneCall className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Configuración de flujo IVR</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Configura el sistema de respuesta interactiva de voz (IVR) para dirigir las llamadas entrantes según las opciones seleccionadas por el llamante.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    style={{ borderColor: '#03091D', color: '#03091D' }}
                    onClick={() => setIsIVRBuilderOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Configurar flujo IVR
                  </Button>
                </div>
              </div>
            </div>

            {/* Llamadas Entrantes - Grabación */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Mic className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-4">Llamadas entrantes</h3>

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
                          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
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
              </div>
            </div>

            {/* Llamadas Salientes */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <PhoneCall className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-4">Llamadas salientes</h3>

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
              </div>
            </div>

            {/* Mensaje en espera */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <Clock className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-4">Mensaje en espera</h3>

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

            {/* Números bloqueados */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E6EBF5' }}>
                  <PhoneOff className="h-5 w-5" style={{ color: '#001963' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Números bloqueados</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Solo los administradores pueden configurar una lista de bloqueo de números de teléfono. Las llamadas entrantes de estos números serán bloqueadas (desconectadas de inmediato).
                  </p>

                  {/* Lista de números bloqueados */}
                  <div className="space-y-2 mb-4">
                    {blockedNumbers.map((blocked) => (
                      <div
                        key={blocked.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {blocked.country}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{blocked.number}</span>
                        </div>
                        <button
                          onClick={() => setBlockedNumbers(blockedNumbers.filter(b => b.id !== blocked.id))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Botón añadir número */}
                  {!isAddBlockedNumberOpen ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddBlockedNumberOpen(true)}
                      className="gap-2"
                      style={{ borderColor: '#03091D', color: '#03091D' }}
                    >
                      <Plus className="h-4 w-4" />
                      Añadir número bloqueado
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={newBlockedNumber}
                        onChange={(e) => setNewBlockedNumber(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newBlockedNumber.trim()) {
                            setBlockedNumbers([
                              ...blockedNumbers,
                              {
                                id: Date.now().toString(),
                                number: newBlockedNumber,
                                country: 'ES',
                              },
                            ]);
                            setNewBlockedNumber('');
                            setIsAddBlockedNumberOpen(false);
                          }
                        }}
                        className="text-white"
                        style={{ backgroundColor: '#03091D' }}
                      >
                        Añadir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewBlockedNumber('');
                          setIsAddBlockedNumberOpen(false);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-8 py-4 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button className="text-white" style={{ backgroundColor: '#03091D' }}>
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* IVR Flow Builder Overlay */}
      {isIVRBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="sm"
              onClick={() => setIsIVRBuilderOpen(false)}
              className="gap-2 text-white"
              style={{ backgroundColor: '#03091D', boxShadow: 'none' }}
            >
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
          <IVRFlowBuilder businessHoursSchedule={schedule} />
        </div>
      )}
    </SettingsLayout>
  );
}

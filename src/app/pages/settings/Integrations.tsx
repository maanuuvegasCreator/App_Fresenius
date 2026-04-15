import { useState } from 'react';
import { SettingsLayout } from '../../components/SettingsLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Search, Check, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: 'available' | 'connected' | 'coming-soon';
  category: string;
}

const integrations: Integration[] = [
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    description: 'Integración con Microsoft Dynamics 365 CRM para gestión completa de clientes y sincronización de contactos',
    logo: '🔷',
    status: 'available',
    category: 'CRM',
  },
];

export function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfigDialogOpen(true);
  };

  return (
    <SettingsLayout>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b px-8 py-6">
          <h1 className="text-2xl font-semibold text-slate-900">Integraciones</h1>
          <p className="text-sm text-slate-600 mt-2">
            Conecta AI Contact Experience con tus herramientas favoritas
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar integraciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Integraciones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  {/* Logo y estado */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                      {integration.logo}
                    </div>
                    {integration.status === 'connected' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <Check className="h-3 w-3" />
                        Conectado
                      </div>
                    )}
                    {integration.status === 'coming-soon' && (
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Próximamente
                      </div>
                    )}
                  </div>

                  {/* Nombre y categoría */}
                  <h3 className="font-semibold text-slate-900 mb-1">{integration.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{integration.category}</p>

                  {/* Descripción */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {integration.description}
                  </p>

                  {/* Acción */}
                  {integration.status === 'available' && (
                    <Button
                      size="sm"
                      className="w-full text-white"
                      style={{ backgroundColor: '#03091D' }}
                      onClick={() => handleConnect(integration)}
                    >
                      Conectar
                    </Button>
                  )}
                  {integration.status === 'connected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleConnect(integration)}
                    >
                      Configurar
                    </Button>
                  )}
                  {integration.status === 'coming-soon' && (
                    <Button size="sm" variant="outline" className="w-full" disabled>
                      Próximamente
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No se encontraron integraciones</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de configuración */}
      {selectedIntegration && (
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedIntegration.logo}</span>
                <span>Configurar {selectedIntegration.name}</span>
              </DialogTitle>
              <DialogDescription>
                {selectedIntegration.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              {selectedIntegration.id === 'dynamics' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dynamics-url">URL de Dynamics 365</Label>
                    <Input
                      id="dynamics-url"
                      placeholder="https://tu-empresa.crm.dynamics.com"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dynamics-client-id">Client ID</Label>
                    <Input
                      id="dynamics-client-id"
                      placeholder="Ingresa tu Client ID de Azure AD"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dynamics-client-secret">Client Secret</Label>
                    <Input
                      id="dynamics-client-secret"
                      placeholder="Ingresa tu Client Secret de Azure AD"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dynamics-tenant-id">Tenant ID</Label>
                    <Input
                      id="dynamics-tenant-id"
                      placeholder="Ingresa tu Tenant ID de Azure AD"
                      type="text"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> Para obtener tus credenciales, ve a Azure Portal y registra una aplicación en Azure Active Directory.
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-slate-900 mb-3">Configuración de sincronización</h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-slate-700">Sincronizar contactos automáticamente</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm text-slate-700">Registrar llamadas en Dynamics</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-slate-700">Crear actividades automáticamente</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="text-white"
                style={{ backgroundColor: '#03091D' }}
                onClick={() => {
                  setIsConfigDialogOpen(false);
                  // Aquí iría la lógica para guardar la configuración
                }}
              >
                Guardar y conectar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SettingsLayout>
  );
}

import { MainLayout } from '../components/MainLayout';

export function Activity() {
  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b p-6">
          <h1 className="text-2xl font-semibold mb-1">Registro de Actividad</h1>
          <p className="text-sm text-muted-foreground">
            Historial completo de actividades y eventos del sistema.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Sección en desarrollo</p>
            <p className="text-sm mt-2">Próximamente disponible</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { SettingsLayout } from '../../components/SettingsLayout';

interface SettingsPlaceholderProps {
  title: string;
  description?: string;
}

export function SettingsPlaceholder({ title, description }: SettingsPlaceholderProps) {
  return (
    <SettingsLayout>
      <div className="h-full flex flex-col">
        <div className="border-b bg-background p-6">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Esta sección está en desarrollo</p>
            <p className="text-sm mt-2">Próximamente disponible</p>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}

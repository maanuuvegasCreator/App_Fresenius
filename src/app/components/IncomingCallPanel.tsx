import { PhoneIncoming, PhoneOff, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import type { MockPatient } from "@/lib/mock-patients";
import type { CallEscalatedDashboardEvent } from "@/types/dashboard-events";
import { AlertTriangle } from "lucide-react";

type IncomingCallPanelProps = {
  callerNumber: string;
  patient: MockPatient | null;
  /** Si el CallSid coincide con un escalado reciente desde la IA. */
  iaEscalation?: CallEscalatedDashboardEvent | null;
  onAccept: () => void;
  onReject: () => void;
};

export function IncomingCallPanel({
  callerNumber,
  patient,
  iaEscalation,
  onAccept,
  onReject,
}: IncomingCallPanelProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <Card className="w-full max-w-lg overflow-hidden border-2 border-primary/30 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-primary px-6 py-4 text-primary-foreground flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
            <PhoneIncoming className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium opacity-90">Llamada entrante</p>
            <p className="text-lg font-semibold tracking-tight">Centralita</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {iaEscalation ? (
            <div
              role="alert"
              className="rounded-lg border border-orange-600/40 bg-gradient-to-br from-red-600 to-orange-600 p-4 text-white shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/90">
                    Transferencia desde asistente IA
                  </p>
                  <div>
                    <p className="text-xs font-medium text-white/80">Motivo de transferencia</p>
                    <p className="text-sm font-medium leading-snug">
                      {iaEscalation.motivo_transferencia?.trim() || "No indicado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80">Resumen del contexto</p>
                    <p className="max-h-36 overflow-y-auto text-sm leading-relaxed text-white/95 whitespace-pre-wrap">
                      {iaEscalation.resumen_contexto?.trim() || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Número / Cliente</p>
              <p className="font-mono text-base font-medium">{callerNumber || "Desconocido"}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 animate-pulse">
              Sonando
            </Badge>
          </div>

          {patient ? (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paciente (mock)</p>
                  <p className="text-lg font-semibold text-foreground">{patient.fullName}</p>
                </div>
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  {patient.mrn}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Centro</dt>
                  <dd>{patient.center}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Nac.</dt>
                  <dd>{patient.dateOfBirth}</dd>
                </div>
              </dl>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Historial de pedidos (simulado)</p>
                <ul className="max-h-28 overflow-y-auto space-y-1.5 text-sm border rounded-md p-2 bg-muted/20">
                  {patient.orders.slice(0, 4).map((o) => (
                    <li key={o.id} className="flex justify-between gap-2">
                      <span className="truncate text-muted-foreground">{o.description}</span>
                      <span className="shrink-0 text-xs font-medium">{o.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {patient.clinicalNote ? (
                <p className="text-xs text-muted-foreground border-t pt-2">{patient.clinicalNote}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Sin coincidencia en pacientes mock para este número. Aún puedes aceptar la llamada.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-12 gap-2" onClick={onReject}>
              <PhoneOff className="h-4 w-4" />
              Rechazar
            </Button>
            <Button className="flex-1 h-12 gap-2" onClick={onAccept}>
              <Phone className="h-4 w-4" />
              Aceptar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

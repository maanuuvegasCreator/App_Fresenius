import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Phone } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { apiUrl } from "@/lib/api-base";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const mockRes = await fetch(apiUrl("/api/auth/mock-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (mockRes.ok) {
        navigate("/dashboard");
        return;
      }

      try {
        const supabase = getSupabaseBrowser();
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signErr) {
          setError(signErr.message || "Credenciales inválidas");
          return;
        }
        navigate("/dashboard");
      } catch {
        setError("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para login con Supabase, o usa credenciales mock.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 lg:flex">
        <div>
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-white">Fresenius · Thinkia</span>
          </div>

          <div className="max-w-md">
            <h1 className="mb-6 text-4xl font-bold text-white">Centralita con backend real</h1>
            <p className="text-lg text-slate-300">
              Twilio Voice, Supabase y ElevenLabs conectados al API del proyecto. En desarrollo ejecuta{" "}
              <code className="rounded bg-white/10 px-1">pnpm dev</code> (Vite + servidor API).
            </p>
          </div>
        </div>

        <div className="text-sm text-slate-400">© 2026 Fresenius Medical Care · Thinkia</div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md p-8">
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Fresenius · Thinkia</span>
            </div>

            <h2 className="mb-2 text-2xl font-semibold">Iniciar sesión</h2>
            <p className="text-muted-foreground">Supabase Auth o credenciales mock (Thinkia)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Button type="button" variant="link" className="h-auto px-0 text-sm font-normal">
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="h-11 w-full" disabled={isLoading}>
              {isLoading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes acceso? <Button variant="link" className="h-auto px-1 font-normal">Solicitar acceso</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

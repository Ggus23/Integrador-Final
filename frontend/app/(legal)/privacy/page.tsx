import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, FileText, UserCheck, Server } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-border space-y-4 border-b pb-8 text-center">
        <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Shield className="text-primary h-8 w-8" />
        </div>
        <h1 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
          Su confianza es nuestro activo más valioso. Así es como protegemos su identidad y sus
          datos clínicos.
        </p>
        <div className="text-primary bg-primary/5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
          <Lock className="h-3 w-3" /> Encriptación de Punta a Punta
        </div>
      </div>

      {/* Section 1: Data Collection */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <Database className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold">1. ¿Qué datos recolectamos?</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-l-4 border-l-blue-500 p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold">Identificación Académica</h3>
                <p className="text-muted-foreground text-sm">
                  Información básica necesaria para validar su estatus de estudiante: Nombre
                  completo, correo institucional, carrera y semestre actual.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-purple-500 p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-bold">Historial Clínico</h3>
                <p className="text-muted-foreground text-sm">
                  Datos sensibles generados en la plataforma: Resultados de pruebas psicométricas,
                  registros diarios de ánimo (check-ins) y notas de sesiones.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Section 2: Usage */}
      <section className="bg-muted/30 border-border rounded-2xl border p-8">
        <div className="mb-6 flex items-center gap-3">
          <Server className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold">2. ¿Para qué usamos sus datos?</h2>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-foreground/90">
              <strong>Análisis de Bienestar:</strong> Generar visualizaciones de su progreso
              emocional a lo largo del tiempo.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-foreground/90">
              <strong>Detección de Riesgos (IA):</strong> Nuestros algoritmos buscan patrones
              anónimos que puedan indicar ansiedad o depresión para alertar preventivamente.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <p className="text-foreground/90">
              <strong>Soporte Profesional:</strong> Permitir que los psicólogos asignados tengan
              contexto antes de una intervención.
            </p>
          </li>
        </ul>
        <div className="bg-background border-border/50 mt-6 rounded-lg border p-4 text-center">
          <p className="text-primary text-sm font-bold tracking-wide uppercase">
            🚫 Tolerancia Cero al Comercio de Datos
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Nunca vendemos, alquilamos ni compartimos su información con anunciantes o terceros.
          </p>
        </div>
      </section>

      {/* Section 3: Rights */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <Eye className="text-primary h-6 w-6" />
          <h2 className="text-2xl font-bold">3. Sus Derechos (ARCO)</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {['Acceso', 'Rectificación', 'Cancelación'].map((right) => (
            <div
              key={right}
              className="border-border hover:bg-muted/50 rounded-xl border p-4 text-center transition-colors"
            >
              <div className="mb-1 text-lg font-bold">{right}</div>
              <span className="text-muted-foreground text-xs">
                Tiene control total sobre sus datos.
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

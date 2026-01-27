import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, User, Gavel, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-border space-y-4 border-b pb-8">
        <h1 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
          Términos de Uso
        </h1>
        <p className="text-muted-foreground text-xl">
          Reglas claras para una comunidad segura y respetuosa.
        </p>
      </div>

      {/* Critical Disclaimer */}
      <div className="bg-destructive/5 border-destructive/20 flex items-start gap-4 rounded-2xl border p-6">
        <div className="bg-destructive/10 shrink-0 rounded-xl p-3">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>
        <div>
          <h2 className="text-destructive mb-2 text-xl font-bold">
            Aviso Importante: No es un servicio de emergencia
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            MenTaLink es una herramienta de <strong>soporte y detección</strong>. Si usted o alguien
            que conoce está en peligro inmediato de autolesión o violencia, no utilice esta
            aplicación. Contacte inmediatamente al <strong>911</strong> o acuda a la sala de
            emergencias más cercana.
          </p>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            <h2 className="text-2xl font-bold">1. Naturaleza del Servicio</h2>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm leading-relaxed">
              La plataforma proporciona análisis automatizados basados en psicología y herramientas
              de seguimiento. Estos resultados son orientativos y{' '}
              <strong>no constituyen un diagnóstico clínico médico</strong>. Siempre deben ser
              validados por un profesional licenciado.
            </p>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            <h2 className="text-2xl font-bold">2. Elegibilidad</h2>
          </div>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm leading-relaxed">
              El acceso está estrictamente limitado a estudiantes activos, facultad y personal
              administrativo autorizado de nuestra institución universitaria asociada. El uso
              compartido de cuentas está prohibido.
            </p>
          </Card>
        </section>
      </div>

      {/* User Responsibilities - Checklist Style */}
      <section className="bg-muted/30 border-border rounded-2xl border p-8">
        <div className="mb-6 flex items-center gap-2">
          <Gavel className="text-primary h-5 w-5" />
          <h2 className="text-2xl font-bold">3. Código de Conducta</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            'Proporcionar información honesta y precisa en las evaluaciones.',
            'Mantener la confidencialidad de su contraseña.',
            'No intentar vulnerar la seguridad de la plataforma.',
            'Respetar la privacidad de otros usuarios.',
            'No usar la herramienta para acoso o fraude.',
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border-border/50 flex items-center gap-3 rounded-lg border p-4"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Action */}
      <div className="pt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Si tiene dudas sobre estos términos, por favor contáctenos antes de continuar.
        </p>
        <Link href="/contact">
          <Button variant="outline" className="font-bold">
            Contactar Soporte Legal
          </Button>
        </Link>
      </div>
    </div>
  );
}

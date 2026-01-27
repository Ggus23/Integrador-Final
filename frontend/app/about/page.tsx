import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen font-sans">
      {/* Navbar mimic or back button */}
      <header className="absolute top-0 z-10 flex w-full items-center justify-between p-6">
        <Link href="/" className="font-serif text-xl font-bold">
          MenTaLink
        </Link>
        <Link href="/">
          <Button variant="ghost">Volver al Inicio</Button>
        </Link>
      </header>

      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <section className="text-center">
            <h1 className="mb-6 font-serif text-4xl font-bold md:text-5xl">Nuestra Misión</h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Democratizar el acceso al apoyo psicológico preventivo en el entorno universitario,
              utilizando tecnología de vanguardia para detectar riesgos antes de que se vuelvan
              crisis.
            </p>
          </section>

          <section className="space-y-6">
            <Card className="bg-muted/30 border-none p-8">
              <h2 className="text-primary mb-4 text-2xl font-bold">El Problema</h2>
              <p className="text-muted-foreground">
                La vida universitaria presenta desafíos únicos: presión académica, aislamiento
                social y transiciones vitales importantes. A menudo, los estudiantes no buscan ayuda
                hasta que la situación es crítica, y los servicios tradicionales de bienestar pueden
                estar saturados o ser difíciles de acceder.
              </p>
            </Card>

            <Card className="bg-primary/5 border-none p-8">
              <h2 className="text-primary mb-4 text-2xl font-bold">Nuestra Solución</h2>
              <p className="text-foreground/80 mb-4">
                MenTaLink no reemplaza a los psicólogos; los potencia. Nuestra plataforma actúa como
                un puente inteligente:
              </p>
              <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                <li>
                  <strong>Detección Proactiva:</strong> Cuestionarios breves y psicometría validada.
                </li>
                <li>
                  <strong>Análisis de IA:</strong> Algoritmos que identifican patrones de riesgo
                  (ansiedad, estrés, depresión).
                </li>
                <li>
                  <strong>Intervención Oportuna:</strong> Alertas automáticas para que los
                  profesionales prioricen los casos urgentes.
                </li>
              </ul>
            </Card>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold">Compromiso Ético</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-bold">Confidencialidad</h3>
                <p className="text-muted-foreground text-sm">
                  Cumplimos con estrictos estándares de protección de datos. Tu información clínica
                  solo es accesible por el personal de salud mental autorizado.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-bold">Transparencia</h3>
                <p className="text-muted-foreground text-sm">
                  Siempre sabrás qué datos recolectamos y para qué. El consentimiento informado es
                  la base de nuestra relación contigo.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

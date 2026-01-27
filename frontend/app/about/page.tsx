import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Navbar mimic or back button */}
            <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <Link href="/" className="font-serif font-bold text-xl">MenTaLink</Link>
                <Link href="/">
                    <Button variant="ghost">Volver al Inicio</Button>
                </Link>
            </header>

            <div className="container mx-auto px-6 pt-32 pb-20">
                <div className="max-w-3xl mx-auto space-y-12">
                    <section className="text-center">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Nuestra Misión</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Democratizar el acceso al apoyo psicológico preventivo en el entorno universitario, utilizando tecnología de vanguardia para detectar riesgos antes de que se vuelvan crisis.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <Card className="p-8 border-none bg-muted/30">
                            <h2 className="text-2xl font-bold mb-4 text-primary">El Problema</h2>
                            <p className="text-muted-foreground">
                                La vida universitaria presenta desafíos únicos: presión académica, aislamiento social y transiciones vitales importantes. A menudo, los estudiantes no buscan ayuda hasta que la situación es crítica, y los servicios tradicionales de bienestar pueden estar saturados o ser difíciles de acceder.
                            </p>
                        </Card>

                        <Card className="p-8 border-none bg-primary/5">
                            <h2 className="text-2xl font-bold mb-4 text-primary">Nuestra Solución</h2>
                            <p className="text-foreground/80 mb-4">
                                MenTaLink no reemplaza a los psicólogos; los potencia. Nuestra plataforma actúa como un puente inteligente:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Detección Proactiva:</strong> Cuestionarios breves y psicometría validada.</li>
                                <li><strong>Análisis de IA:</strong> Algoritmos que identifican patrones de riesgo (ansiedad, estrés, depresión).</li>
                                <li><strong>Intervención Oportuna:</strong> Alertas automáticas para que los profesionales prioricen los casos urgentes.</li>
                            </ul>
                        </Card>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Compromiso Ético</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold mb-2">Confidencialidad</h3>
                                <p className="text-sm text-muted-foreground">
                                    Cumplimos con estrictos estándares de protección de datos. Tu información clínica solo es accesible por el personal de salud mental autorizado.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold mb-2">Transparencia</h3>
                                <p className="text-sm text-muted-foreground">
                                    Siempre sabrás qué datos recolectamos y para qué. El consentimiento informado es la base de nuestra relación contigo.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

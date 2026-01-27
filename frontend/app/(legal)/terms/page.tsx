import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, User, Gavel, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="space-y-12">

            {/* Header */}
            <div className="space-y-4 border-b border-border pb-8">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Términos de Uso</h1>
                <p className="text-xl text-muted-foreground">
                    Reglas claras para una comunidad segura y respetuosa.
                </p>
            </div>

            {/* Critical Disclaimer */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-destructive/10 p-3 rounded-xl shrink-0">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-destructive mb-2">Aviso Importante: No es un servicio de emergencia</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        MenTaLink es una herramienta de <strong>soporte y detección</strong>. Si usted o alguien que conoce está en peligro inmediato de autolesión o violencia, no utilice esta aplicación. Contacte inmediatamente al <strong>911</strong> o acuda a la sala de emergencias más cercana.
                    </p>
                </div>
            </div>

            {/* Terms Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold">1. Naturaleza del Servicio</h2>
                    </div>
                    <Card className="p-6">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            La plataforma proporciona análisis automatizados basados en psicología y herramientas de seguimiento. Estos resultados son orientativos y <strong>no constituyen un diagnóstico clínico médico</strong>. Siempre deben ser validados por un profesional licenciado.
                        </p>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold">2. Elegibilidad</h2>
                    </div>
                    <Card className="p-6">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            El acceso está estrictamente limitado a estudiantes activos, facultad y personal administrativo autorizado de nuestra institución universitaria asociada. El uso compartido de cuentas está prohibido.
                        </p>
                    </Card>
                </section>
            </div>

            {/* User Responsibilities - Checklist Style */}
            <section className="bg-muted/30 p-8 rounded-2xl border border-border">
                <div className="flex items-center gap-2 mb-6">
                    <Gavel className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-bold">3. Código de Conducta</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        "Proporcionar información honesta y precisa en las evaluaciones.",
                        "Mantener la confidencialidad de su contraseña.",
                        "No intentar vulnerar la seguridad de la plataforma.",
                        "Respetar la privacidad de otros usuarios.",
                        "No usar la herramienta para acoso o fraude."
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-background p-4 rounded-lg border border-border/50">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span className="text-sm font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Action */}
            <div className="text-center pt-8">
                <p className="text-muted-foreground mb-4">Si tiene dudas sobre estos términos, por favor contáctenos antes de continuar.</p>
                <Link href="/contact">
                    <Button variant="outline" className="font-bold">Contactar Soporte Legal</Button>
                </Link>
            </div>

        </div>
    );
}

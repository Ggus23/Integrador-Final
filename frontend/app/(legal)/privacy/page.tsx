import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, FileText, UserCheck, Server } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="space-y-12">

            {/* Header */}
            <div className="text-center space-y-4 border-b border-border pb-8">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Política de Privacidad</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Su confianza es nuestro activo más valioso. Así es como protegemos su identidad y sus datos clínicos.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Encriptación de Punta a Punta
                </div>
            </div>

            {/* Section 1: Data Collection */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">1. ¿Qué datos recolectamos?</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-500/10 p-2 rounded-lg">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Identificación Académica</h3>
                                <p className="text-muted-foreground text-sm">
                                    Información básica necesaria para validar su estatus de estudiante: Nombre completo, correo institucional, carrera y semestre actual.
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-500/10 p-2 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Historial Clínico</h3>
                                <p className="text-muted-foreground text-sm">
                                    Datos sensibles generados en la plataforma: Resultados de pruebas psicométricas, registros diarios de ánimo (check-ins) y notas de sesiones.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Section 2: Usage */}
            <section className="bg-muted/30 p-8 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-6">
                    <Server className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">2. ¿Para qué usamos sus datos?</h2>
                </div>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <p className="text-foreground/90"><strong>Análisis de Bienestar:</strong> Generar visualizaciones de su progreso emocional a lo largo del tiempo.</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <p className="text-foreground/90"><strong>Detección de Riesgos (IA):</strong> Nuestros algoritmos buscan patrones anónimos que puedan indicar ansiedad o depresión para alertar preventivamente.</p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <p className="text-foreground/90"><strong>Soporte Profesional:</strong> Permitir que los psicólogos asignados tengan contexto antes de una intervención.</p>
                    </li>
                </ul>
                <div className="mt-6 p-4 bg-background border border-border/50 rounded-lg text-center">
                    <p className="font-bold text-sm text-primary uppercase tracking-wide">🚫 Tolerancia Cero al Comercio de Datos</p>
                    <p className="text-xs text-muted-foreground mt-1">Nunca vendemos, alquilamos ni compartimos su información con anunciantes o terceros.</p>
                </div>
            </section>

            {/* Section 3: Rights */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Eye className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">3. Sus Derechos (ARCO)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Acceso', 'Rectificación', 'Cancelación'].map((right) => (
                        <div key={right} className="p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-center">
                            <div className="font-bold text-lg mb-1">{right}</div>
                            <span className="text-xs text-muted-foreground">Tiene control total sobre sus datos.</span>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

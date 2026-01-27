
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-serif font-bold">Contacto y Soporte</h1>
            <p className="lead text-xl text-muted-foreground">
                ¿Tienes preguntas técnicas o necesitas orientación sobre cómo usar la plataforma? Estamos aquí para ayudarte.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="space-y-6">
                    <Card className="p-6 transition-all hover:shadow-md border-l-4 border-l-primary/50">
                        <div className="flex items-start gap-4">
                            <Mail className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-bold text-lg">Soporte Técnico</h3>
                                <p className="text-sm text-muted-foreground mb-3">Para problemas con la app o tu cuenta.</p>
                                <a href="mailto:pacaragustin@gmail.com" className="font-medium text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full text-sm">
                                    pacaragustin@gmail.com
                                </a>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 transition-all hover:shadow-md border-l-4 border-l-green-500/50">
                        <div className="flex items-start gap-4">
                            <Phone className="w-6 h-6 text-green-600 mt-1" />
                            <div>
                                <h3 className="font-bold text-lg">Contacto Directo</h3>
                                <p className="text-sm text-muted-foreground mb-4">Atención personalizada inmediata.</p>
                                <a
                                    href="https://wa.me/59179717725"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="font-bold bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                                        Chat en WhatsApp (+591 79717725)
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-bold">Ubicación</h3>
                                <p className="text-sm text-muted-foreground">
                                    Campus Central, Edificio de Bienestar Estudiantil.<br />
                                    Oficina 204.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre</label>
                                <Input placeholder="Tu nombre" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input placeholder="tu@email.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Asunto</label>
                            <Input placeholder="¿En qué podemos ayudarte?" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mensaje</label>
                            <Textarea placeholder="Describe tu consulta..." rows={5} />
                        </div>
                        <Button className="w-full font-bold">Enviar Mensaje</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}

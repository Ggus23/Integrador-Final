import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl font-bold">Contacto y Soporte</h1>
      <p className="lead text-muted-foreground text-xl">
        ¿Tienes preguntas técnicas o necesitas orientación sobre cómo usar la plataforma? Estamos
        aquí para ayudarte.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-l-primary/50 border-l-4 p-6 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <Mail className="text-primary mt-1 h-6 w-6" />
              <div>
                <h3 className="text-lg font-bold">Soporte Técnico</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Para problemas con la app o tu cuenta.
                </p>
                <a
                  href="mailto:pacaragustin@gmail.com"
                  className="text-primary bg-primary/10 rounded-full px-3 py-1 text-sm font-medium hover:underline"
                >
                  pacaragustin@gmail.com
                </a>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500/50 p-6 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <Phone className="mt-1 h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold">Contacto Directo</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Atención personalizada inmediata.
                </p>
                <a href="https://wa.me/59179717725" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-green-600 font-bold text-white hover:bg-green-700 sm:w-auto">
                    Chat en WhatsApp (+591 79717725)
                  </Button>
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <MapPin className="text-primary mt-1 h-6 w-6" />
              <div>
                <h3 className="font-bold">Ubicación</h3>
                <p className="text-muted-foreground text-sm">
                  Campus Central, Edificio de Bienestar Estudiantil.
                  <br />
                  Oficina 204.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="mb-6 text-2xl font-bold">Envíanos un mensaje</h2>
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

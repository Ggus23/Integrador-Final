'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, HeartPulse, BrainCircuit, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

// MentaLink: Sistema de monitoreo de bienestar universitario
export default function LandingPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 flex min-h-screen flex-col font-sans">
      {/* Navbar */}
      <header className="bg-background/80 fixed z-50 w-full border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-lg p-2">
              <Activity className="text-primary h-6 w-6" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">MenTaLink</span>
          </div>

          <nav className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="hover:text-primary transition-colors">
              Características
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              Cómo funciona
            </a>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && user ? (
              <Link href="/dashboard">
                <Button className="font-bold">
                  Ir al Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-muted/50 font-medium">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="shadow-primary/20 hover:shadow-primary/30 font-bold shadow-lg transition-all">
                    Comenzar Ahora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2">
          <div className="bg-primary/20 absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full blur-[100px]" />
          <div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="bg-muted/50 animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Plataforma Activa y Segura
            </span>
          </div>

          <h1 className="from-foreground via-foreground/90 to-foreground/50 mx-auto mb-6 max-w-4xl bg-gradient-to-r bg-clip-text font-serif text-5xl leading-[1.1] font-bold tracking-tight text-transparent md:text-7xl">
            Bienestar Estudiantil <br />
            <span className="text-primary italic">Reinagurado.</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl leading-relaxed">
            Una herramienta inteligente diseñada para conectar a estudiantes con el apoyo
            psicológico que necesitan, justo cuando lo necesitan.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="shadow-primary/25 hover:shadow-primary/40 h-14 w-full rounded-full px-8 text-lg font-bold shadow-xl transition-all hover:-translate-y-0.5 sm:w-auto"
              >
                Crear Cuenta Estudiantil
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="hover:bg-muted/50 h-14 w-full rounded-full border-2 px-8 text-lg font-medium sm:w-auto"
              >
                Saber más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof Strips */}
      <div className="bg-muted/20 border-y border-white/5 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-6 py-8 text-center md:grid-cols-4">
          <div>
            <div className="text-foreground mb-1 text-3xl font-black">24/7</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Monitoreo
            </div>
          </div>
          <div>
            <div className="text-foreground mb-1 text-3xl font-black">100%</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Confidencial
            </div>
          </div>
          <div>
            <div className="text-foreground mb-1 text-3xl font-black">IA</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Detección Temprana
            </div>
          </div>
          <div>
            <div className="text-foreground mb-1 text-3xl font-black">Pro</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Soporte Clínico
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="bg-muted/10 py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
              Tecnología al servicio de tu mente
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xl">
              Combinamos algoritmos avanzados con un enfoque humano para crear un ecosistema de
              apoyo integral.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="group bg-card border-border hover:border-primary/50 hover:shadow-primary/5 rounded-2xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <BrainCircuit className="text-primary h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Inteligencia Artificial</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro sistema analiza patrones en tus respuestas para detectar sutiles cambios en
                tu bienestar emocional antes de que se conviertan en problemas mayores.
              </p>
            </div>

            <div className="group bg-card border-border hover:border-primary/50 hover:shadow-primary/5 rounded-2xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <HeartPulse className="text-primary h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Seguimiento Continuo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Realiza check-ins diarios de estado de ánimo y evaluaciones psicométricas
                periódicas. Tu progreso se visualiza en tiempo real.
              </p>
            </div>

            <div className="group bg-card border-border hover:border-primary/50 hover:shadow-primary/5 rounded-2xl border p-8 transition-all hover:shadow-lg">
              <div className="bg-primary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                <ShieldCheck className="text-primary h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Privacidad Total</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todos tus datos personales y clínicos están encriptados. El acceso está
                estrictamente restringido a profesionales autorizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">¿Cómo funciona?</h2>
            <p className="text-muted-foreground mx-auto max-w-xl">
              Un proceso simple diseñado para ser tu acompañante silencioso pero efectivo.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connecting Line (Desktop) */}
            <div className="bg-border absolute top-12 left-0 -z-10 hidden h-0.5 w-full md:block" />

            <div className="bg-background pt-4 md:pt-0">
              <div className="bg-primary text-primary-foreground border-background relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl font-bold">
                1
              </div>
              <h3 className="mb-2 text-center text-lg font-bold">Registro</h3>
              <p className="text-muted-foreground text-center text-sm">
                Crea tu cuenta institucional y completa tu perfil de estudiante.
              </p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="bg-primary text-primary-foreground border-background relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl font-bold">
                2
              </div>
              <h3 className="mb-2 text-center text-lg font-bold">Check-in</h3>
              <p className="text-muted-foreground text-center text-sm">
                Responde brevemente cómo te sientes cada día. Toma menos de 1 minuto.
              </p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="bg-primary text-primary-foreground border-background relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl font-bold">
                3
              </div>
              <h3 className="mb-2 text-center text-lg font-bold">Análisis</h3>
              <p className="text-muted-foreground text-center text-sm">
                Nuestra IA monitorea tendencias. Si detecta riesgo, avisa discretamente a un
                profesional.
              </p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="bg-primary text-primary-foreground border-background relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl font-bold">
                4
              </div>
              <h3 className="mb-2 text-center text-lg font-bold">Apoyo</h3>
              <p className="text-muted-foreground text-center text-sm">
                Recibes orientación proactiva o citas con psicólogos si es necesario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="relative overflow-hidden py-24">
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="mb-8 font-serif text-4xl font-bold md:text-5xl">
            ¿Listo para priorizarte?
          </h2>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
            No tienes que enfrentar los desafíos universitarios en soledad. Únete a MenTaLink y toma
            el control.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="shadow-primary/30 h-16 rounded-full px-10 text-xl font-bold shadow-2xl transition-transform hover:scale-105"
            >
              Registrarse Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-border border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Activity className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground font-serif font-bold">MenTaLink</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 MenTaLink. Todos los derechos reservados.
          </div>
          <div className="text-muted-foreground flex gap-6 text-sm font-medium">
            <Link href="/terms" className="hover:text-primary">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacidad
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, HeartPulse, BrainCircuit, Activity, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// MentaLink: Sistema de monitoreo de bienestar universitario
export default function LandingPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="text-foreground selection:bg-primary/20 transparent flex min-h-screen flex-col font-sans">
      <header className="bg-background/80 border-border/50 fixed z-50 w-full border-b backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 md:h-24">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="bg-primary/10 flex-shrink-0 overflow-hidden rounded-xl p-2 md:p-2.5">
              <Image
                src="/icon_logo.png"
                alt="MentaLink Logo"
                width={36}
                height={36}
                className="h-9 w-9 flex-shrink-0 rounded-md object-cover md:h-11 md:w-11"
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight whitespace-nowrap md:text-2xl">
              MenTaLink
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="text-muted-foreground hidden items-center justify-center gap-10 text-sm font-medium lg:flex">
            <a
              href="#features"
              className="hover:text-primary whitespace-nowrap underline-offset-4 transition-colors hover:underline"
            >
              Características
            </a>
            <a
              href="#how-it-works"
              className="hover:text-primary whitespace-nowrap underline-offset-4 transition-colors hover:underline"
            >
              Cómo funciona
            </a>
            <Link
              href="/privacy"
              className="hover:text-primary whitespace-nowrap underline-offset-4 transition-colors hover:underline"
            >
              Privacidad
            </Link>
          </nav>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden items-center gap-4 sm:flex">
              {mounted && user ? (
                <Link href="/dashboard">
                  <Button className="h-11 px-6 font-bold shadow-md">
                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:bg-muted/50 hover:text-foreground h-11 px-5 font-medium whitespace-nowrap transition-colors"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="btn-radiant h-11 px-8 text-base font-bold whitespace-nowrap">
                      Comenzar
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="bg-background/95 animate-in fade-in slide-in-from-top-4 border-border fixed top-16 left-0 h-screen w-full border-t backdrop-blur-md lg:hidden">
            <nav className="flex flex-col space-y-6 p-6">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="border-border border-b pb-2 text-lg font-bold"
              >
                Características
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMenuOpen(false)}
                className="border-border border-b pb-2 text-lg font-bold"
              >
                Cómo funciona
              </a>
              <Link
                href="/privacy"
                onClick={() => setIsMenuOpen(false)}
                className="border-border border-b pb-2 text-lg font-bold"
              >
                Privacidad
              </Link>
              {mounted && user ? (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button className="h-12 w-full text-lg font-bold">Ir al Dashboard</Button>
                </Link>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="h-12 w-full text-lg font-medium">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="h-12 w-full text-lg font-bold">Registrarse ahora</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* El fondo Aurora gestionado globalmente en RootLayout proporcionará la iluminación de esta sección */}

        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="text-foreground mx-auto mb-6 max-w-4xl font-serif text-5xl leading-[1.15] font-bold tracking-tight md:text-7xl">
            Bienestar Estudiantil <br />
            <span className="text-primary">tu espacio seguro.</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl leading-relaxed">
            Una herramienta inteligente diseñada para conectar a estudiantes con el apoyo
            psicológico que necesitan, justo cuando lo necesitan.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="btn-radiant h-14 w-full rounded-full px-8 text-lg font-bold sm:w-auto"
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

      <div className="border-border/10 bg-background/30 border-y backdrop-blur-md">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-6 py-8 text-center md:grid-cols-4">
          <div>
            <div className="text-primary mb-1 font-serif text-3xl font-black">24/7</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Monitoreo
            </div>
          </div>
          <div>
            <div className="text-primary mb-1 font-serif text-3xl font-black">100%</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Confidencial
            </div>
          </div>
          <div>
            <div className="text-accent mb-1 font-serif text-3xl font-black">IA</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Detección Temprana
            </div>
          </div>
          <div>
            <div className="text-support-medium mb-1 font-serif text-3xl font-black">Pro</div>
            <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Soporte Clínico
            </div>
          </div>
        </div>
      </div>

      <section id="features" className="py-24">
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
            <div className="group bg-card/80 dark:bg-card/40 border-border hover:border-primary/40 hover:shadow-warm rounded-2xl border p-8 backdrop-blur-2xl transition-all hover:-translate-y-1">
              <div className="bg-primary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                <BrainCircuit className="text-primary h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-bold">Inteligencia Artificial</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro sistema analiza patrones en tus respuestas para detectar sutiles cambios en
                tu bienestar emocional antes de que se conviertan en problemas mayores.
              </p>
            </div>

            <div className="group bg-card/80 dark:bg-card/40 border-border hover:border-accent/40 hover:shadow-warm rounded-2xl border p-8 backdrop-blur-2xl transition-all hover:-translate-y-1">
              <div className="bg-accent/10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                <HeartPulse className="text-accent h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-bold">Seguimiento Continuo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Realiza check-ins diarios de estado de ánimo y evaluaciones psicométricas
                periódicas. Tu progreso se visualiza en tiempo real.
              </p>
            </div>

            <div className="group bg-card/80 dark:bg-card/40 border-border hover:border-support-medium/40 hover:shadow-warm rounded-2xl border p-8 backdrop-blur-2xl transition-all hover:-translate-y-1">
              <div className="bg-support-medium/10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                <ShieldCheck className="text-support-medium h-7 w-7" />
              </div>
              <h3 className="mb-3 font-serif text-xl font-bold">Privacidad Total</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todos tus datos personales y clínicos están encriptados. El acceso está
                estrictamente restringido a profesionales autorizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-border/10 bg-background/20 border-t py-24 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold md:text-4xl">¿Cómo funciona?</h2>
            <p className="text-muted-foreground mx-auto max-w-xl">
              Un proceso simple diseñado para ser tu acompañante silencioso pero efectivo.
            </p>
          </div>

          <div className="relative grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-3">
            <div className="bg-border/30 absolute top-12 left-0 -z-10 hidden h-px w-full lg:block" />

            {[
              {
                n: '1',
                title: 'Acceso a la App',
                desc: 'Regístrate con tu correo institucional y accede desde la web o tu dispositivo móvil.',
              },
              {
                n: '2',
                title: 'Check-in Diario',
                desc: 'Registra tu estado de ánimo, sueño y nivel de energía en menos de un minuto.',
              },
              {
                n: '3',
                title: 'Diario Emocional',
                desc: 'Escribe libremente tus pensamientos para reflexionar y desahogarte.',
              },
              {
                n: '4',
                title: 'Análisis con IA',
                desc: 'La IA analiza de forma privada tus patrones emocionales y niveles de estrés.',
              },
              {
                n: '5',
                title: 'Alertas Preventivas',
                desc: 'Si la app detecta riesgo, notifica de forma segura al equipo de psicología.',
              },
              {
                n: '6',
                title: 'Apoyo y Citas',
                desc: 'Recibe sugerencias de bienestar o coordina citas con profesionales de forma ágil.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="bg-card/60 border-border/40 rounded-2xl border p-4 pt-6 text-center shadow-sm backdrop-blur-sm sm:p-6"
              >
                <div
                  className="border-background relative z-10 mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-4 text-xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #c0684a 0%, #e07b5f 100%)',
                    boxShadow: '0 4px 12px rgba(192,104,74,0.30)',
                  }}
                >
                  {step.n}
                </div>
                <h3 className="mb-2 text-center font-serif text-lg font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-center text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="transparent relative overflow-hidden py-32">
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-foreground mb-8 font-serif text-4xl font-bold md:text-5xl">
            ¿Listo para priorizarte?
          </h2>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-xl">
            No tienes que enfrentar los desafíos universitarios en soledad. Únete a MenTaLink y
            encuentra tu espacio de calma y apoyo.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground h-16 rounded-full px-10 text-xl font-bold shadow-lg transition-all hover:scale-105 hover:opacity-90"
            >
              Registrarse Gratis
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-border bg-background/20 border-t py-12 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover" />
            </div>
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

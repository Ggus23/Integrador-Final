'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, HeartPulse, BrainCircuit, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">

      {/* Navbar */}
      <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">MenTaLink</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Cómo funciona</a>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
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
                  <Button variant="ghost" className="font-medium hover:bg-muted/50">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Comenzar Ahora
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-white/10 backdrop-blur-sm mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Plataforma Activa y Segura</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50 max-w-4xl mx-auto leading-[1.1]">
            Bienestar Estudiantil <br />
            <span className="text-primary italic">Reinagurado.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Una herramienta inteligente diseñada para conectar a estudiantes con el apoyo psicológico que necesitan, justo cuando lo necesitan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                Crear Cuenta Estudiantil
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 font-medium hover:bg-muted/50 w-full sm:w-auto">
                Saber más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof Strips */}
      <div className="border-y border-white/5 bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-foreground mb-1">24/7</div>
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Monitoreo</div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-1">100%</div>
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Confidencial</div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-1">IA</div>
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Detección Temprana</div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-1">Pro</div>
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Soporte Clínico</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tecnología al servicio de tu mente</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Combinamos algoritmos avanzados con un enfoque humano para crear un ecosistema de apoyo integral.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inteligencia Artificial</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro sistema analiza patrones en tus respuestas para detectar sutiles cambios en tu bienestar emocional antes de que se conviertan en problemas mayores.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Seguimiento Continuo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Realiza check-ins diarios de estado de ánimo y evaluaciones psicométricas periódicas. Tu progreso se visualiza en tiempo real.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacidad Total</h3>
              <p className="text-muted-foreground leading-relaxed">
                Todos tus datos personales y clínicos están encriptados. El acceso está estrictamente restringido a profesionales autorizados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un proceso simple diseñado para ser tu acompañante silencioso pero efectivo.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-border -z-10" />

            <div className="bg-background pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-6 border-4 border-background relative z-10">1</div>
              <h3 className="font-bold text-lg mb-2 text-center">Registro</h3>
              <p className="text-sm text-muted-foreground text-center">Crea tu cuenta institucional y completa tu perfil de estudiante.</p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-6 border-4 border-background relative z-10">2</div>
              <h3 className="font-bold text-lg mb-2 text-center">Check-in</h3>
              <p className="text-sm text-muted-foreground text-center">Responde brevemente cómo te sientes cada día. Toma menos de 1 minuto.</p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-6 border-4 border-background relative z-10">3</div>
              <h3 className="font-bold text-lg mb-2 text-center">Análisis</h3>
              <p className="text-sm text-muted-foreground text-center">Nuestra IA monitorea tendencias. Si detecta riesgo, avisa discretamente a un profesional.</p>
            </div>

            <div className="bg-background pt-4 md:pt-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-6 border-4 border-background relative z-10">4</div>
              <h3 className="font-bold text-lg mb-2 text-center">Apoyo</h3>
              <p className="text-sm text-muted-foreground text-center">Recibes orientación proactiva o citas con psicólogos si es necesario.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">¿Listo para priorizarte?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            No tienes que enfrentar los desafíos universitarios en soledad. Únete a MenTaLink y toma el control.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full font-bold shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
              Registrarse Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <span className="font-serif font-bold text-muted-foreground">MenTaLink</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 MenTaLink. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/terms" className="hover:text-primary">Términos</Link>
            <Link href="/privacy" className="hover:text-primary">Privacidad</Link>
            <Link href="/contact" className="hover:text-primary">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

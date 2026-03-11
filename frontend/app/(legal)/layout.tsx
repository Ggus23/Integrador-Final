import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen font-sans">
      <header className="bg-background/80 fixed z-50 w-full border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight">MenTaLink Legal</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-6 pt-32 pb-20">
        <div className="prose prose-slate dark:prose-invert max-w-none">{children}</div>
      </main>
    </div>
  );
}

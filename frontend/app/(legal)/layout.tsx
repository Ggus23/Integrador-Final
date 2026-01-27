
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <span className="font-serif text-xl font-bold tracking-tight">MenTaLink Legal</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}

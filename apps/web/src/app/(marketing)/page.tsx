import Link from 'next/link';
import { ArrowRight, CheckSquare, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">Attimo</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            Organize your life with{' '}
            <span className="text-accent">Attimo</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted">
            A modern, beautiful task and note management application. Stay organized,
            boost productivity, and never miss a beat.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Task Management</h3>
                <p className="text-muted">
                  Create, organize, and track your tasks with ease. Set priorities,
                  due dates, and never miss a deadline.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Smart Notes</h3>
                <p className="text-muted">
                  Capture ideas instantly with rich text formatting. Search, tag, and
                  organize your thoughts effortlessly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
                <p className="text-muted">
                  Built with modern technology for blazing fast performance. Works
                  seamlessly across all your devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted">
          <p>&copy; 2026 Attimo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

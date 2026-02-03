'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckSquare,
  FileText,
  Sparkles,
  Shield,
  Check,
  Brain,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <h1 className="text-xl font-bold">NoteAI</h1>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold hover:bg-surface2">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-accent text-white font-semibold hover:bg-accent/90">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <Badge className="bg-accent/10 text-accent border-accent/20 font-semibold">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-Powered
                </Badge>
              </motion.div>

              <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Your thoughts,
                <br />
                <span className="bg-gradient-to-r from-accent via-accent to-[#0ea5e9] bg-clip-text text-transparent">
                  amplified by AI
                </span>
              </h1>

              <p className="mb-6 max-w-xl text-lg text-muted md:text-xl">
                Capture ideas, organize tasks, and let AI help you stay productive.
                NoteAI transforms how you work with intelligent suggestions and seamless
                organization.
              </p>

              <div className="mb-6 flex items-center gap-3">
                <Link
                  href="https://github.com/Erfan-FK/attimo-task"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2 font-semibold hover:bg-[#24292e] hover:text-white hover:border-[#24292e] dark:hover:bg-[#f6f8fa] dark:hover:text-[#24292e] dark:hover:border-[#f6f8fa] transition-all"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-accent text-white font-semibold hover:bg-accent/90">
                    Start Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="font-medium">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="font-medium">Free forever</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl" />
              <div className="relative space-y-4">
                <Card className="overflow-hidden border-border/50 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Today's Tasks</h3>
                      <Badge variant="secondary">3 left</Badge>
                    </div>
                    <div className="space-y-3">
                      {[
                        { text: 'Review Q1 presentation', done: true },
                        { text: 'Team sync at 2pm', done: false },
                        { text: 'Finish project proposal', done: false },
                      ].map((task, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center gap-3 rounded-lg bg-surface2 p-3"
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                              task.done
                                ? 'border-success bg-success'
                                : 'border-border'
                            }`}
                          >
                            {task.done && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span
                            className={`text-sm ${
                              task.done ? 'text-muted line-through' : ''
                            }`}
                          >
                            {task.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-accent" />
                      <h3 className="text-sm font-semibold">AI Suggestion</h3>
                    </div>
                    <p className="text-sm text-muted">
                      Based on your notes, you might want to schedule a follow-up
                      meeting about the Q1 results...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-t border-border/40 bg-surface2/50 py-20">
          <div className="container mx-auto px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything you need to stay organized
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted">
                Powerful features designed to help you capture, organize, and act on your
                ideas with AI assistance.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  icon: CheckSquare,
                  title: 'Smart Tasks',
                  description:
                    'Organize tasks with priorities, due dates, and AI-powered suggestions for better productivity.',
                  color: 'accent',
                },
                {
                  icon: FileText,
                  title: 'Rich Notes',
                  description:
                    'Capture ideas with rich formatting, tags, and instant search. Your thoughts, beautifully organized.',
                  color: 'primary',
                },
                {
                  icon: Brain,
                  title: 'AI Assistant',
                  description:
                    'Get intelligent suggestions, auto-categorization, and smart reminders powered by AI.',
                  color: 'accent',
                },
                {
                  icon: Shield,
                  title: 'Secure & Private',
                  description:
                    'Your data is encrypted and isolated per user. We take your privacy seriously.',
                  color: 'success',
                },
              ].map((feature, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className="group h-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-accent/50">
                    <CardContent className="p-6">
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}/10 text-${feature.color} transition-transform group-hover:scale-110`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted font-medium">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="border-t border-border/40 py-20">
          <div className="container mx-auto px-6 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to boost your productivity?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted font-medium">
                Join thousands of users who are already organizing their lives with NoteAI.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-accent text-white font-semibold hover:bg-accent/90">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-surface py-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">NoteAI</h3>
              <p className="text-sm text-muted font-medium">
                Your AI-powered productivity companion.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Product</h4>
              <ul className="space-y-2 text-sm text-muted font-medium">
                <li>
                  <Link href="#features" className="hover:text-text transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-text transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-text transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted font-medium">
                <li>
                  <a href="#" className="hover:text-text transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-text transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-text transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted font-medium">
                <li>
                  <a
                    href="https://github.com/Erfan-FK/attimo-task"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-text transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted font-medium">
            <p>&copy; 2026 NoteAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Lock, FileText, Download, Brain } from 'lucide-react';
import { PDF_TOOLS } from '@toolshub/shared';

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Process files in seconds with our optimized pipeline.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Files are encrypted and auto-deleted after 1 hour.' },
  { icon: Lock, title: 'No Signup Needed', desc: 'Jump straight in — no account or payment required.' },
];

const EXTRA_TOOLS = [
  { id: 'downloader', title: 'Media Downloader', description: 'Download YouTube, Instagram & Twitter videos in MP4 or MP3.', icon: '⬇️', href: '/downloader', color: 'from-emerald-500 to-teal-500', category: 'media' },
  { id: 'plagiarism', title: 'AI Plagiarism Checker', description: 'Detect plagiarism with Claude AI. Get detailed originality scores.', icon: '🤖', href: '/plagiarism', color: 'from-violet-500 to-purple-600', category: 'ai' },
];

const ALL_TOOLS = [...PDF_TOOLS.map(t => ({ ...t, href: `/tools/${t.id}` })), ...EXTRA_TOOLS];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-[300px] w-[300px] rounded-full bg-violet-500/8 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-pink-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400"
          >
            <Zap className="h-3.5 w-3.5" /> All-in-One Productivity Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl"
          >
            Every Tool You Need,{' '}
            <span className="text-gradient">One Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto"
          >
            Merge, compress, convert PDFs · Download YouTube & Instagram videos ·
            Check plagiarism with AI — all free, all instant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/tools/merge-pdf" className="btn-gradient text-base px-8 py-3.5">
              Start for Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/plagiarism" className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold border border hover:bg-accent transition-colors">
              <Brain className="h-4 w-4 text-violet-400" /> Try AI Checker
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto"
          >
            {[['14+', 'Tools'], ['100%', 'Free'], ['< 1hr', 'File Expiry']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">{val}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tools Grid ────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">All Tools</h2>
            <p className="mt-3 text-muted-foreground">Everything you need, right here.</p>
          </div>

          <motion.div
            variants={stagger.container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {ALL_TOOLS.map((tool) => (
              <motion.div key={tool.id} variants={stagger.item}>
                <Link href={tool.href} className="tool-card group flex flex-col h-full">
                  {/* Gradient top strip */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-2xl shadow-lg`}>
                    {tool.icon}
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-brand-400 transition-colors">{tool.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground flex-1">{tool.description}</p>
                  <div className="mt-4 flex items-center text-xs font-medium text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20 bg-card/30">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Why ToolsHub?</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10">
                  <f.icon className="h-6 w-6 text-brand-400" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:py-20 bg-card/10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-3 text-muted-foreground">Clear answers to common questions.</p>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is ToolsHub really free?', a: 'Yes! All tools on ToolsHub are 100% free to use. We built this platform for the betterment of the public, and there are no hidden fees or subscriptions.' },
              { q: 'Are my files secure?', a: 'Absolutely. All file processing happens in secure, temporary environments. We use an automated cleanup script that permanently deletes all files exactly 1 hour after processing.' },
              { q: 'Do I need to create an account?', a: 'No signup is required. You can use all PDF tools, the media downloader, and the AI checker without providing any personal information.' },
              { q: 'What video platforms are supported?', a: 'Our downloader currently supports YouTube, Instagram, Twitter (X), and TikTok. We are constantly adding support for more platforms.' },
              { q: 'How does the AI Plagiarism Checker work?', a: 'It uses advanced LLMs (Claude AI) to analyze your text, identify common patterns, and generate a detailed originality report with flagged sentences.' },
            ].map((faq, i) => (
              <details key={i} className="group rounded-2xl border border bg-card p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-brand-500/30 transition-colors">
                <summary className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-violet-500/5 to-pink-500/10 p-12">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-muted-foreground">No account needed. Just pick a tool and go.</p>
            <Link href="/tools/merge-pdf" className="btn-gradient mt-8 inline-flex text-base px-8 py-3.5">
              Try it Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

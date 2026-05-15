'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PDF_TOOLS } from '@toolshub/shared';

const EXTRA = [
  { id: 'downloader', title: 'Media Downloader', description: 'Download YouTube, Instagram & Twitter videos in MP4/MP3.', icon: '⬇️', href: '/downloader', color: 'from-emerald-500 to-teal-500', category: 'media' as const },
  { id: 'plagiarism', title: 'AI Plagiarism Checker', description: 'Detect copied content with Claude AI.', icon: '🤖', href: '/plagiarism', color: 'from-violet-500 to-purple-600', category: 'ai' as const },
];

const CATEGORIES = [
  { label: 'PDF Tools', id: 'pdf' },
  { label: 'Media', id: 'media' },
  { label: 'AI Tools', id: 'ai' },
];

export default function ToolsIndexPage() {
  const allTools = [
    ...PDF_TOOLS.map(t => ({ ...t, href: `/tools/${t.id}`, category: 'pdf' as const })),
    ...EXTRA,
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold">All Tools</h1>
        <p className="mt-3 text-muted-foreground text-lg">14+ free tools. No signup required.</p>
      </div>

      {CATEGORIES.map(cat => {
        const tools = allTools.filter(t => t.category === cat.id);
        if (!tools.length) return null;
        return (
          <section key={cat.id} className="mb-14">
            <h2 className="font-display text-2xl font-semibold mb-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              {cat.label}
              <span className="h-px flex-1 bg-border" />
            </h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {tools.map(tool => (
                <motion.div
                  key={tool.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link href={tool.href} className="tool-card group flex flex-col h-full">
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
          </section>
        );
      })}
    </div>
  );
}

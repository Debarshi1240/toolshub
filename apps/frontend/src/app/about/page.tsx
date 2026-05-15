import { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Github, Shield, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ToolsHub',
  description: 'Learn about ToolsHub — the all-in-one platform for PDF tools, media downloading, and AI plagiarism detection.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-xl">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold">About ToolsHub</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A free, open-source, all-in-one productivity platform.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-3">What is ToolsHub?</h2>
          <p className="text-muted-foreground">
            ToolsHub is a comprehensive web platform offering 14+ tools for everyday productivity —
            PDF manipulation, media downloading from major platforms, and AI-powered plagiarism detection.
            No signup, no payment, no nonsense.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Privacy First', desc: 'All files are deleted within 1 hour. We never store your data.' },
            { icon: Clock, title: 'Always Fast', desc: 'Optimized pipeline processes most files in under 10 seconds.' },
            { icon: Github, title: 'Open Source', desc: 'Full source code available on GitHub. Audit it yourself.' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                <f.icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold mb-3">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Express.js', 'Python Flask', 'yt-dlp', 'pdf-lib', 'Claude AI', 'Cloudflare R2', 'Supabase'].map((t) => (
              <span key={t} className="rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="btn-gradient">← Back to Tools</Link>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Github, Twitter, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ToolsHub team.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-3xl shadow-xl">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">We'd love to hear from you</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Mail, label: 'Email', value: 'hello@toolshub.dev', href: 'mailto:hello@toolshub.dev', color: 'text-brand-400' },
          { icon: Github, label: 'GitHub', value: 'github.com/toolshub', href: 'https://github.com/toolshub', color: 'text-foreground' },
          { icon: Twitter, label: 'Twitter/X', value: '@toolshubapp', href: 'https://twitter.com/toolshubapp', color: 'text-sky-400' },
        ].map((c) => (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border bg-card p-5 hover:border-brand-400/40 hover:bg-brand-500/5 transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="font-medium text-foreground group-hover:text-brand-400 transition-colors">{c.value}</p>
            </div>
          </a>
        ))}

        <div className="rounded-2xl border border bg-card p-6 mt-6">
          <h2 className="font-semibold mb-4">Send a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input id="contact-name" type="text" placeholder="Your name" className="rounded-xl border border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              <input id="contact-email" type="email" placeholder="your@email.com" className="rounded-xl border border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
            </div>
            <textarea id="contact-message" rows={5} placeholder="Tell us what's on your mind…" className="w-full rounded-xl border border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none" />
            <button type="submit" className="btn-gradient w-full">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}

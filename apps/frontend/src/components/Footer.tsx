import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border bg-card/30 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-gradient">ToolsHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A free, open-source productivity platform built for the betterment of the public. 
              No signup, no costs, just tools.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/tools/merge-pdf" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">Merge PDF</Link></li>
              <li><Link href="/tools/split-pdf" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">Split PDF</Link></li>
              <li><Link href="/tools/compress-pdf" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">Compress PDF</Link></li>
              <li><Link href="/tools/pdf-to-word" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">PDF to Word</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Other Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/downloader" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">Media Downloader</Link></li>
              <li><Link href="/plagiarism" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">AI Plagiarism Checker</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex items-center gap-4">
              <a href="https://github.com/AtulTejaswi/toolshub" target="_blank" rel="noopener noreferrer" className="h-9 w-9 flex items-center justify-center rounded-xl border border bg-card hover:bg-accent transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl border border bg-card hover:bg-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl border border bg-card hover:bg-accent transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="mailto:support@toolshub.dev" className="h-9 w-9 flex items-center justify-center rounded-xl border border bg-card hover:bg-accent transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground italic">
              Made with ❤️ for everyone.
            </p>
          </div>
        </div>
        
        <div className="mt-12 border-t border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ToolsHub Platform. Licensed under MIT.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

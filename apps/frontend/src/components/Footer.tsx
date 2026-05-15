import Link from 'next/link';
import { Zap, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-gradient">ToolsHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Free, fast, and secure online tools for PDF processing, media downloading, and AI-powered plagiarism detection. No signup required.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="mailto:hello@toolshub.dev" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">PDF Tools</h3>
            <ul className="space-y-2">
              {[['Merge PDF', '/tools/merge-pdf'], ['Split PDF', '/tools/split-pdf'], ['Compress PDF', '/tools/compress-pdf'], ['PDF to Word', '/tools/pdf-to-word'], ['Word to PDF', '/tools/word-to-pdf'], ['PDF to JPG', '/tools/pdf-to-jpg']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Other Tools */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">More Tools</h3>
            <ul className="space-y-2">
              {[['Media Downloader', '/downloader'], ['AI Plagiarism Checker', '/plagiarism'], ['Rotate PDF', '/tools/rotate-pdf'], ['Watermark PDF', '/tools/watermark-pdf'], ['Protect PDF', '/tools/protect-pdf'], ['About Us', '/about']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-brand-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ToolsHub. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Files are automatically deleted after 1 hour. Your privacy is our priority.</p>
        </div>
      </div>
    </footer>
  );
}

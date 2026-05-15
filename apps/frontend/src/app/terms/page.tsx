export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold mb-8 text-gradient">Terms of Service</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p>
            By using ToolsHub, you agree to these terms. If you do not agree, please do not use the platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Permitted Use</h2>
          <p>
            You may use ToolsHub for personal or professional purposes. You agree not to use the platform for any illegal activities, including but not limited to processing copyrighted material without authorization.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. No Warranties</h2>
          <p>
            ToolsHub is provided "as is" without any warranties. While we strive for 100% uptime and accuracy, we are not responsible for any data loss or processing errors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Limitation of Liability</h2>
          <p>
            In no event shall ToolsHub or its creators be liable for any damages arising out of the use or inability to use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the platform constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold mb-8 text-gradient">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Data Collection</h2>
          <p>
            ToolsHub is designed to be privacy-first. We do not collect personal information, require accounts, or use tracking cookies for identifying individuals.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. File Processing</h2>
          <p>
            All files uploaded to our servers are processed in temporary directories. We use an automated cleanup system that permanently deletes all uploaded and processed files exactly 1 hour after their creation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. External APIs</h2>
          <p>
            Some tools (like the AI Plagiarism Checker) may send anonymized text to external AI providers (such as Anthropic) for analysis. No personal data is included in these requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Analytics</h2>
          <p>
            We collect anonymous usage statistics (e.g., "how many times was the Merge PDF tool used") to help us improve the platform. This data cannot be linked to any specific user.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Contact</h2>
          <p>
            If you have any questions about this policy, please contact us at support@toolshub.dev.
          </p>
        </section>
      </div>
    </div>
  );
}

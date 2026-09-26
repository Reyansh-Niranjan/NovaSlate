export default function PrivacyPolicy() {
  return (
    <section className="min-h-[100dvh] pt-24 sm:pt-32 pb-16 safe-bottom bg-background text-foreground font-sans">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-12 shadow-sm space-y-8">
          <div>
            <span className="inline-block text-[11px] font-mono mb-3 text-muted-foreground uppercase tracking-wider px-3 py-1 rounded-full bg-secondary border border-border/70">
              Effective date: June 1, 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              This Privacy Policy explains how NovaSlate collects, uses, and protects your information when you use the
              website and services.
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base leading-relaxed border-t border-border/70 pt-8">
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                1. Information We Collect
              </h2>
              <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                <li>Account data such as name, grade, email, and authentication identifiers.</li>
                <li>Content you upload or generate (e.g., documents, notes, and project materials).</li>
                <li>Usage signals like page views, feature usage, and error logs for product improvement.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                2. How We Use Information
              </h2>
              <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                <li>Provide, personalize, and maintain the NovaSlate experience.</li>
                <li>Secure your account and prevent abuse or unauthorized access.</li>
                <li>Improve reliability, analytics, and feature performance.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                3. Third-Party Services
              </h2>
              <p className="text-muted-foreground">
                We use Supabase for authentication, storage, and database services. Google OAuth may be used for single sign
                on. These providers process data according to their own privacy policies.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                4. Data Security
              </h2>
              <p className="text-muted-foreground">
                We apply reasonable safeguards to protect your information. No method of transmission or storage is 100%
                secure, so we cannot guarantee absolute security.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border/70">
            <a
              href="/#"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-heading font-semibold transition-transform active:scale-95 shadow-sm"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

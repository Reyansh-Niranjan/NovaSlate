export default function TermsOfService() {
  return (
    <section className="min-h-[100dvh] pt-24 sm:pt-32 pb-16 safe-bottom bg-background text-foreground font-sans">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-12 shadow-sm space-y-8">
          <div>
            <span className="inline-block text-[11px] font-mono mb-3 text-muted-foreground uppercase tracking-wider px-3 py-1 rounded-full bg-secondary border border-border/70">
              Effective date: June 1, 2026
            </span>
            <h1 className="text-3xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              These Terms of Service govern your access to and use of NovaSlate. By using the service, you agree to these
              terms.
            </p>
          </div>

          <div className="space-y-8 text-sm sm:text-base leading-relaxed border-t border-border/70 pt-8">
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                1. Eligibility and Accounts
              </h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activity
                that occurs under your account.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                2. Acceptable Use
              </h2>
              <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                <li>Do not misuse the service or attempt to access it using a method other than the interface provided.</li>
                <li>Do not upload content that violates laws or the rights of others.</li>
                <li>Do not interfere with or disrupt the integrity or performance of the service.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                3. Content Ownership
              </h2>
              <p className="text-muted-foreground">
                You retain ownership of content you submit. You grant NovaSlate a limited license to host and display the
                content solely to provide the service.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                4. Termination
              </h2>
              <p className="text-muted-foreground">
                We may suspend or terminate access if you violate these terms or if required to comply with legal
                obligations.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                5. Changes to Terms
              </h2>
              <p className="text-muted-foreground">
                We may update these terms from time to time. Continued use of the service indicates acceptance of any
                updated terms.
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

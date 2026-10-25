import Link from 'next/link';

export default function PrivacyPage() {
  const policyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;

  return (
    <main className="proof-container py-10">
      <article className="proof-sheet mx-auto max-w-3xl border border-[#0F1218] bg-[#FDFDFC] p-6 md:p-12">
        <p className="sample-stamp">Privacy information</p>
        <h1 className="mt-4">Your artwork and order information</h1>
        <p className="reading-text-soft mt-4">
          Press &amp; Proof uses account, delivery, quote, order, payment-status, and
          artwork information to provide printing services. Production artwork is
          uploaded to private storage and must pass configured security scanning
          and print preflight before it can be used.
        </p>
        <p className="reading-text-soft mt-4">
          Payment details are handled by the configured payment provider. The
          storefront receives payment status and provider identifiers; do not send
          card details to Press &amp; Proof.
        </p>
        {policyUrl ? (
          <p className="mt-5">
            <a className="underline" href={policyUrl} rel="noreferrer">
              Read the full privacy policy
            </a>
          </p>
        ) : (
          <p className="mt-5 border-l-4 border-[#C4161C] pl-4 text-sm" role="note">
            The full privacy policy URL has not been configured for this deployment.
          </p>
        )}
        <Link className="mt-8 inline-block underline" href="/">
          Return to Press &amp; Proof
        </Link>
      </article>
    </main>
  );
}

import { Changa } from "next/font/google";
import { colors } from "@/utils/colors";

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
});

const POLICY_DOCUMENTS = [
  {
    name: "Copyright Policy",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Copyright%20Policy.pdf",
  },
  {
    name: "Privacy Policy",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Privicy%20Policy.pdf",
  },
  {
    name: "Refund & Cancellation",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Refund%20%26%20Cancelation%20Policy.pdf",
  },
  {
    name: "Terms & Conditions",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Terms%20%26%20Conditions.pdf",
  },
];

export default function Footer() {

  return (
    <footer
      className="py-20 border-t relative overflow-hidden"
      style={{
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-5"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h3
            className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up"
            style={{ color: colors.textPrimary }}
          >
            Get in Touch
          </h3>
          <div
            className="w-24 h-1 mx-auto mb-8 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`,
            }}
          />
          <p
            className="text-xl mb-10 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Have questions about our competitions? We&apos;d love to hear from
            you.
          </p>
          <a
            href="mailto:support@mindrain.org"
            className="inline-block px-12 py-5 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            }}
            data-testid="contact-email-link"
          >
            Contact Us →
          </a>

          <div
            className="mt-12 pt-8 border-t"
            style={{ borderColor: colors.border }}
          >

            {/* Policy links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {POLICY_DOCUMENTS.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${changa.className} inline-flex items-center gap-1 text-xs uppercase tracking-widest transition-colors hover:underline underline-offset-2`}
                  style={{ color: colors.textLight }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = colors.accent)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = colors.textLight)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-3 h-3 flex-shrink-0"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {doc.name}
                </a>
              ))}
            </div>

            <p className="text-sm mt-4" style={{ color: colors.textLight }}>
              © 2026 Mind Rain. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

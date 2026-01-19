import { colors } from '@/utils/colors';

export default function Footer() {
  return (
    <footer 
      className="py-16 border-t"
      style={{ 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 
          className="text-2xl font-semibold mb-4"
          style={{ color: colors.textPrimary }}
        >
          Get in Touch
        </h3>
        <p 
          className="text-lg mb-6"
          style={{ color: colors.textSecondary }}
        >
          Have questions about our competitions?
        </p>
        <a
          href="mailto:contact@mindrain.org"
          className="inline-block px-8 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: colors.accent }}
          data-testid="contact-email-link"
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
}

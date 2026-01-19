import { colors } from '@/utils/colors';

export default function Footer() {
  return (
    <footer 
      className="py-20 border-t relative overflow-hidden"
      style={{ 
        backgroundColor: colors.cardBackground,
        borderColor: colors.border 
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
              background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` 
            }}
          />
          <p 
            className="text-xl mb-10 leading-relaxed"
            style={{ color: colors.textSecondary }}
          >
            Have questions about our competitions? We'd love to hear from you.
          </p>
          <a
            href="mailto:contact@mindrain.org"
            className="inline-block px-12 py-5 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` 
            }}
            data-testid="contact-email-link"
          >
            Contact Us →
          </a>
          
          <div className="mt-12 pt-8 border-t" style={{ borderColor: colors.border }}>
            <p className="text-sm" style={{ color: colors.textLight }}>
              © 2026 Mind Rain. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

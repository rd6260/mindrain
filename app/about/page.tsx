import { colors } from '@/utils/colors';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <Navigation />

      {/* Hero Image - Full Width */}
      <div className="mb-24">
        <div className="overflow-hidden" style={{ aspectRatio: '21/9' }}>
          <img
            src="/about-us-banner.png"
            alt="Modern architecture"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* About Us */}
      <section className="px-4 sm:px-6 lg:px-8 pb-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left: heading pinned */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <h2
              className="text-5xl md:text-6xl font-bold leading-none"
              style={{ color: colors.textPrimary }}
            >
              ABOUT US
            </h2>
          </div>

          {/* Right: body text */}
          <div className="lg:col-span-8 space-y-6 lg:pt-2">
            <p
              className="text-xl md:text-2xl leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              We are a group of students and professionals from various fields of art and design who believe that our classrooms and studios can be spiced up a little to make them more interesting.
            </p>

            <div
              className="rounded-2xl p-8 mt-2"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <p
                className="text-lg leading-relaxed"
                style={{ color: colors.textSecondary }}
              >
                We are concerned about the current generation of design and art students ending up suppressing their creative talent in the race for marks and jobs. We want to give them a free space to manifest creativity without any fear or inhibition — and let their imagination fly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Our Aim */}
      <section className="px-4 sm:px-6 lg:px-8 py-28" style={{ backgroundColor: colors.cardBackground }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left: heading */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <h2
                className="text-5xl md:text-6xl font-bold leading-none"
                style={{ color: colors.textPrimary }}
              >
                Our AIM
              </h2>
            </div>

            {/* Right: two paragraphs */}
            <div className="lg:col-span-8 space-y-6 lg:pt-2">
              <p
                className="text-xl md:text-2xl leading-relaxed"
                style={{ color: colors.textSecondary }}
              >
                We have observed that the quality of output has taken a nose dive in almost all the creative fields — be it architecture, design, writing or film making. The culture of 'copy-paste' is at an all time high.
              </p>
              <p
                className="text-lg leading-relaxed"
                style={{ color: colors.textSecondary }}
              >
                Our aim is to pump originality, imagination and creativity back into the system by encouraging the next generation of artists and designers to think freely and originally — and experience the real thrill and fun involved in a creative process.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 sm:px-6 lg:px-8 py-28">
        <div className="max-w-7xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-16"
            style={{ color: colors.accent }}
          >
            ⚡ Why choose us
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-10"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="text-3xl mb-6">👥</div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                Professional Team
              </h3>
              <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                With years of experience in architecture and design, making sure your creative journey resonates with industry standards.
              </p>
            </div>

            <div
              className="rounded-2xl p-10"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <div className="text-3xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                Flexibility
              </h3>
              <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                From flexible deadlines to diverse competition formats — we take you where you need to go in your creative journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="px-4 sm:px-6 lg:px-8 pb-28">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold mb-16 text-center"
            style={{ color: colors.textPrimary }}
          >
            What we offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Freedom of Expression',
                description: 'No boundaries, no limits. Your creativity deserves a space to flourish without judgment.',
                icon: '🕊️',
              },
              {
                title: 'Original Thinking',
                description: 'Break free from the copy-paste culture. Discover your unique voice and perspective.',
                icon: '💡',
              },
              {
                title: 'Real Potential',
                description: "Unlock what you're truly capable of when freed from conventional constraints.",
                icon: '🚀',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="rounded-2xl p-8 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <div className="text-3xl mb-5">{value.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                  {value.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-28" style={{ backgroundColor: colors.cardBackground }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: '4/3' }}>
              <img
                src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80"
                alt="Architecture competition"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-8">
              <p
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: colors.accent }}
              >
                ⚡ As you wish
              </p>

              <h2
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: colors.textPrimary }}
              >
                Tailored Design Competitions in Your Style
              </h2>

              <p className="text-xl leading-relaxed" style={{ color: colors.textSecondary }}>
                Join our creative community and be part of a movement that celebrates originality and imagination in architecture and design.
              </p>

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.background }}
                >
                  <span style={{ color: colors.accent }}>✓</span>
                </div>
                <span className="text-base" style={{ color: colors.textSecondary }}>
                  Perfect for those seeking a creative experience
                </span>
              </div>

              <a
                href="/home"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
                style={{ backgroundColor: colors.accent, color: colors.textWhite }}
                data-testid="explore-competitions-button"
              >
                EXPLORE COMPETITIONS →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

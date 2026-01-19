import { colors } from '@/utils/colors';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      {/* Hero Section with Image */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-16">
            <h1 
              className="text-7xl md:text-9xl font-bold tracking-tight leading-none"
              style={{ color: '#2C2C2C' }}
            >
              MIND RAIN
            </h1>
            <p 
              className="text-xl md:text-2xl mt-4"
              style={{ color: '#6B6B6B' }}
            >
              Architecture Design and Photography Competition Platform
            </p>
          </div>

          {/* Hero Image - Full Width */}
          <div className="mb-20">
            <div 
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '21/9' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80"
                alt="Modern architecture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Image */}
            <div className="relative">
              <div 
                className="rounded-3xl overflow-hidden shadow-xl"
                style={{ aspectRatio: '3/4' }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
                  alt="Architectural detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="space-y-6 lg:pt-12">
              <div className="inline-block">
                <span 
                  className="text-sm uppercase tracking-widest font-semibold"
                  style={{ color: '#8B7355' }}
                >
                  ⚡ ABOUT US
                </span>
              </div>
              
              <h2 
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: '#2C2C2C' }}
              >
                The Highest Level of Creativity and Innovation
              </h2>

              <p 
                className="text-lg md:text-xl leading-relaxed"
                style={{ color: '#6B6B6B' }}
              >
                We are a group of students and professionals from various fields of art and design who believe that our classrooms and studios can be spiced up a little to make them more interesting.
              </p>

              <div 
                className="rounded-2xl p-8"
                style={{ backgroundColor: '#F5F1ED' }}
              >
                <p 
                  className="text-lg leading-relaxed"
                  style={{ color: '#6B6B6B' }}
                >
                  We are concerned about the current generation of students of fine arts and design who end up suppressing their creative talent in the race for marks and jobs. We want to give you a free space to manifest your creativity without any fear or inhibition and let your imagination fly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Aim Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left: Content */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <span 
                  className="text-sm uppercase tracking-widest font-semibold"
                  style={{ color: '#8B7355' }}
                >
                  ⚡ OUR MISSION
                </span>
              </div>

              <h2 
                className="text-5xl md:text-6xl font-bold leading-tight"
                style={{ color: '#2C2C2C' }}
              >
                Our Aim
              </h2>

              <div 
                className="rounded-2xl p-10"
                style={{ backgroundColor: '#F5F1ED' }}
              >
                <p 
                  className="text-xl leading-relaxed mb-6"
                  style={{ color: '#6B6B6B' }}
                >
                  We have observed that the quality of output has taken a nose dive in almost all the creative fields, be it architecture, design, writing or film making. The culture of 'copy-paste' is at an all time high.
                </p>
                <p 
                  className="text-xl leading-relaxed"
                  style={{ color: '#6B6B6B' }}
                >
                  Our aim is to pump originality, imagination and creativity back into the system by encouraging the next generation of artists and designers to think freely and originally and experience the real thrill and fun involved in a creative process.
                </p>
              </div>
            </div>

            {/* Right: Images */}
            <div className="lg:col-span-2 space-y-6">
              <div 
                className="rounded-2xl overflow-hidden shadow-xl"
                style={{ aspectRatio: '4/5' }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80"
                  alt="Architectural columns"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span 
              className="text-sm uppercase tracking-widest font-semibold"
              style={{ color: '#8B7355' }}
            >
              ⚡ WHY CHOOSE US
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Professional Team Card */}
            <div 
              className="rounded-2xl p-10"
              style={{ backgroundColor: '#F5F1ED' }}
            >
              <div className="flex items-start gap-6">
                <div 
                  className="text-4xl"
                  style={{ color: '#8B7355' }}
                >
                  👥
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{ color: '#2C2C2C' }}
                  >
                    Professional Team
                  </h3>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: '#6B6B6B' }}
                  >
                    With years of experience in architecture and design, making sure your creative journey resonates with industry standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Flexibility Card */}
            <div 
              className="rounded-2xl p-10"
              style={{ backgroundColor: '#F5F1ED' }}
            >
              <div className="flex items-start gap-6">
                <div 
                  className="text-4xl"
                  style={{ color: '#8B7355' }}
                >
                  ⚡
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{ color: '#2C2C2C' }}
                  >
                    Flexibility
                  </h3>
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: '#6B6B6B' }}
                  >
                    From flexible deadlines to diverse competition formats — we take you where you need to go in your creative journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Stand For */}
          <div className="mt-20">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-12 text-center"
              style={{ color: '#2C2C2C' }}
            >
              What we offer?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Freedom of Expression",
                  description: "No boundaries, no limits. Your creativity deserves a space to flourish without judgment.",
                },
                {
                  title: "Original Thinking",
                  description: "Break free from the copy-paste culture. Discover your unique voice and perspective.",
                },
                {
                  title: "Real Potential",
                  description: "Unlock what you're truly capable of when freed from conventional constraints.",
                }
              ].map((value, index) => (
                <div 
                  key={index}
                  className="rounded-2xl p-8 transition-transform hover:scale-105"
                  style={{ backgroundColor: '#F5F1ED' }}
                >
                  <h3 
                    className="text-xl font-bold mb-4"
                    style={{ color: '#2C2C2C' }}
                  >
                    {value.title}
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{ color: '#6B6B6B' }}
                  >
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div 
              className="rounded-2xl overflow-hidden shadow-xl"
              style={{ aspectRatio: '4/3' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80"
                alt="Architecture competition"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right: CTA Content */}
            <div className="space-y-8">
              <div>
                <span 
                  className="text-sm uppercase tracking-widest font-semibold"
                  style={{ color: '#8B7355' }}
                >
                  ⚡ AS YOU WISH
                </span>
              </div>

              <h2 
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ color: '#2C2C2C' }}
              >
                Tailored Design Competitions in Your Style
              </h2>

              <p 
                className="text-xl leading-relaxed"
                style={{ color: '#6B6B6B' }}
              >
                Join our creative community and be part of a movement that celebrates originality and imagination in architecture and design.
              </p>

              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F5F1ED' }}
                >
                  <span style={{ color: '#8B7355' }}>✓</span>
                </div>
                <span 
                  className="text-base"
                  style={{ color: '#6B6B6B' }}
                >
                  Perfect for those seeking a creative experience
                </span>
              </div>

              <a
                href="/home"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#8B7355', color: 'white' }}
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

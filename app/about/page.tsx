import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-12">
            <Image
              src="/next.svg"
              alt="Mind Rain Logo"
              width={180}
              height={40}
              className="mx-auto opacity-80"
              style={{ filter: 'invert(0.3)' }}
            />
          </div>

          <h1 
            className="text-5xl md:text-6xl font-bold mb-12"
            style={{ color: colors.textPrimary }}
          >
            About Us
          </h1>

          <div 
            className="rounded-2xl p-8 md:p-12 mb-8 text-left"
            style={{ backgroundColor: colors.white }}
          >
            <p 
              className="text-lg md:text-xl leading-relaxed mb-6"
              style={{ color: colors.textSecondary }}
            >
              We are a group of students and professionals from various fields of art and design who believe that our classrooms and studios can be spiced up a little to make them more interesting. We are concerned about the current generation of students of fine arts and design who end up suppressing their creative talent and talent in the race for marks and jobs. We want to give you a free space to manifest your creativity without any fear or inhibition and let your imagination fly. We want to promote the idea of freedom of expression and thought in art and design. We want you to discover your real potential!
            </p>
          </div>

          <div 
            className="rounded-2xl p-8 md:p-12 text-left"
            style={{ backgroundColor: colors.white }}
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: colors.accent }}
            >
              Our Aim
            </h2>
            <p 
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              We have observed that the quality of output has taken a nose dive in almost all the creative fields, be it architecture, design, writing or film making. The culture of 'copy-paste' is at an all time high. Our aim is to pump originality, imagination and creativity back into the system by encouraging the next generation of artists and designers to think freely and originally and experience the real thrill and fun involved in a creative process.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: colors.textPrimary }}
          >
            Join Our Creative Community
          </h2>
          <p 
            className="text-lg mb-8"
            style={{ color: colors.textSecondary }}
          >
            Be part of a movement that celebrates originality and imagination in design
          </p>
          <a
            href="/home"
            className="inline-block px-10 py-4 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
            data-testid="explore-competitions-button"
          >
            Explore Competitions
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

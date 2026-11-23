import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { blogPosts, formatBlogDate } from '@/data/blogPosts';

export const metadata: Metadata = {
  title: 'Blog - Mind Rain',
  description: 'Writings on architecture and design from the Mind Rain archive.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBDF' }}>
      <Navigation />

      <div className="max-w-7xl mx-auto px-2 py-12 space-y-14">
        {/* ── Hero ── */}
        <section className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#2C5F5F' }}>
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#D97757' }} />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#EDEBDF' }} />
          <div className="relative z-10 px-8 py-14 md:px-16 md:py-20 max-w-3xl">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(217,119,87,0.25)', color: '#D97757' }}
            >
              Since 2016
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: '#F8F7F2' }}>
              The Mind Rain Blog
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(248,247,242,0.75)' }}>
              Writings on architecture and design, brought over from our original website.
            </p>
          </div>
        </section>

        {/* ── Posts ── */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => {
            const cover = post.topImages[post.topImages.length - 1] ?? post.bottomImages[0];
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl overflow-hidden border flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
              >
                {cover && (
                  <div className="relative h-56 w-full overflow-hidden" style={{ backgroundColor: '#E5E3D7' }}>
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.categories.map((c) => (
                      <span
                        key={c}
                        className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(44,95,95,0.1)', color: '#2C5F5F' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold mb-3 leading-snug" style={{ color: '#1A1A1A' }}>
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed line-clamp-3 mb-5" style={{ color: '#3A3A3A' }}>
                    {post.paragraphs[0]}
                  </p>
                  <div className="mt-auto flex items-center justify-between text-sm">
                    <time dateTime={post.date} style={{ color: '#6B6B6B' }}>
                      {formatBlogDate(post.date)}
                    </time>
                    <span className="font-semibold" style={{ color: '#2C5F5F' }}>
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>

      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { blogPosts, getBlogPost, formatBlogDate, type BlogImage } from '@/data/blogPosts';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  return { title: `${post.title} - Mind Rain Blog`, description: post.paragraphs[0].slice(0, 160) };
}

function Figure({ img }: { img: BlogImage }) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      width={img.width}
      height={img.height}
      // animated GIFs must not go through the image optimizer
      unoptimized={img.src.endsWith('.gif')}
      className="rounded-xl border w-full h-auto"
      style={{ borderColor: '#D0CEC2', backgroundColor: '#F8F7F2' }}
    />
  );
}

export default async function BlogPostPage({ params }: Props) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBDF' }}>
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#2C5F5F' }}>
          ← All posts
        </Link>

        {/* ── Header ── */}
        <header className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((c) => (
              <span
                key={c}
                className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(44,95,95,0.1)', color: '#2C5F5F' }}
              >
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: '#1A1A1A' }}>
            {post.title}
          </h1>
          <time dateTime={post.date} className="block text-sm" style={{ color: '#6B6B6B' }}>
            {formatBlogDate(post.date)}
          </time>
        </header>

        {/* ── Article ── */}
        <article className="rounded-2xl border p-6 md:p-10 space-y-6" style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}>
          {post.topImages.length > 0 && (
            <div className={`grid gap-4 items-start ${post.topImages.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {post.topImages.map((img) => (
                <Figure key={img.src} img={img} />
              ))}
            </div>
          )}

          {post.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed max-w-3xl mx-auto" style={{ color: '#2A2A2A' }}>
              {/* *text* renders as italics; split puts the emphasised parts at odd indexes */}
              {p.split(/\*(.+?)\*/g).map((part, j) => (j % 2 ? <em key={j}>{part}</em> : part))}
            </p>
          ))}

          <p className="leading-relaxed max-w-3xl mx-auto" style={{ color: '#2A2A2A' }}>
            {post.credit.text}{' '}
            {post.credit.links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && ' '}
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline break-all" style={{ color: '#2C5F5F' }}>
                  {l.label}
                </a>
              </span>
            ))}
          </p>

          {post.bottomImages.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="max-w-xs">
                {post.bottomImages.map((img) => (
                  <Figure key={img.src} img={img} />
                ))}
              </div>
            </div>
          )}
        </article>

        {/* ── Tags ── */}
        <footer className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-5 rounded-full" style={{ backgroundColor: '#D97757' }} />
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#1A1A1A' }}>
              Tags
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-medium px-3 py-1.5 rounded-full border"
                style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2', color: '#3A3A3A' }}
              >
                {t}
              </span>
            ))}
          </div>
        </footer>
      </div>

      <Footer />
    </div>
  );
}

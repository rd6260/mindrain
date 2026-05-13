'use client';

import { useState } from 'react';
import Navigation from '@/app/components/Navigation';
import Footer from '../components/Footer';

const faqs = [
  {
    category: 'About MindRain',
    items: [
      {
        q: 'What is MindRain?',
        a: 'MindRain is an independent academic platform that conducts architecture and design competitions centered on critical thinking, conceptual exploration, and spatial innovation.',
      },
    ],
  },
  {
    category: 'Eligibility',
    items: [
      {
        q: 'Who can participate?',
        a: 'Students and young professionals from any academic year or institution are eligible to participate. Eligibility for each competition is specified in the respective brief.',
      },
      {
        q: 'Is MindRain only for architecture students?',
        a: 'MindRain primarily addresses architectural discourse. However, participants from all disciplines may be eligible where relevant or interested.',
      },
      {
        q: 'Is participation individual or in teams?',
        a: 'Participation may be individual or in teams depending on the competition. The permitted team size is clearly mentioned in the competition guidelines.',
      },
    ],
  },
  {
    category: 'Competition',
    items: [
      {
        q: 'What is the nature of the competition themes?',
        a: 'The competitions focus on conceptual clarity, contextual response, spatial and programmatic thinking, and design process and communication. Each brief is developed as an academic design inquiry rather than a presentation-driven exercise.',
      },
      {
        q: 'What are the submission requirements?',
        a: 'Submission requirements typically include design sheets in PDF format, a written concept description, and diagrams and visual representations. The number of sheets, format, and file size are defined in the competition brief.',
      },
      {
        q: 'Can hand-drawn or hybrid representations be submitted?',
        a: 'Yes. Both digital and hand-drawn modes of representation are acceptable, provided the final submission is compiled and uploaded in the prescribed digital format.',
      },
    ],
  },
  {
    category: 'Evaluation & Awards',
    items: [
      {
        q: 'How are entries evaluated?',
        a: 'Entries are assessed based on the strength of the design concept, originality of response, spatial and programmatic resolution, relevance to the brief, and clarity of graphical and written communication.',
      },
      {
        q: 'Who evaluates the submissions?',
        a: 'Submissions are reviewed by invited jurors from academic and professional backgrounds. Jurors are selected based on their expertise and relevance to the competition theme.',
      },
      {
        q: 'Are awards and recognition provided?',
        a: 'Yes. Competitions may include prize money, certificates, publication and feature opportunities, and academic recognition. The nature of awards is specified in each competition announcement.',
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-300"
      style={{
        borderColor: open ? '#2C5F5F' : '#D0CEC2',
        backgroundColor: open ? 'rgba(44,95,95,0.04)' : '#F8F7F2',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
      >
        <span className="font-semibold text-sm md:text-base" style={{ color: '#1A1A1A' }}>
          {q}
        </span>
        <span
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: open ? '#2C5F5F' : 'rgba(44,95,95,0.1)',
            color: open ? '#FFFFFF' : '#2C5F5F',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '400px' : '0px' }}
      >
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#3A3A3A' }}>
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? faqs.filter((g) => g.category === activeCategory)
    : faqs;

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
              Help &amp; Support
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: '#F8F7F2' }}>
              Frequently Asked<br />Questions
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(248,247,242,0.75)' }}>
              Everything you need to know about Mind Rain competitions - from eligibility to evaluation.
            </p>
          </div>
        </section>

        {/* ── Category Filter ── */}
        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200"
            style={{
              backgroundColor: activeCategory === null ? '#2C5F5F' : '#F8F7F2',
              color: activeCategory === null ? '#FFFFFF' : '#3A3A3A',
              borderColor: activeCategory === null ? '#2C5F5F' : '#D0CEC2',
            }}
          >
            All Questions
          </button>
          {faqs.map((group) => (
            <button
              key={group.category}
              onClick={() => setActiveCategory(group.category === activeCategory ? null : group.category)}
              className="px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200"
              style={{
                backgroundColor: activeCategory === group.category ? '#2C5F5F' : '#F8F7F2',
                color: activeCategory === group.category ? '#FFFFFF' : '#3A3A3A',
                borderColor: activeCategory === group.category ? '#2C5F5F' : '#D0CEC2',
              }}
            >
              {group.category}
            </button>
          ))}
        </section>

        {/* ── FAQ Groups ── */}
        <section className="space-y-10">
          {filtered.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-1.5 h-5 rounded-full"
                  style={{ backgroundColor: '#D97757' }}
                />
                <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                  {group.category}
                </h2>
              </div>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Still Have Questions CTA ── */}
        <section
          className="rounded-2xl p-10 text-center border"
          style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(44,95,95,0.1)', color: '#2C5F5F' }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Still have questions?
          </h2>
          <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: '#6B6B6B' }}>
            Can't find what you're looking for? Reach out to us and we'll get back to you.
          </p>
          <a
            href="/contactUs"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            style={{ backgroundColor: '#2C5F5F', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
          >
            Contact Us
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </section>
        <Footer/>

      </div>
    </div>
  );
}

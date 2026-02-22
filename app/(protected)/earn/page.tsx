'use client';

import Navigation from '@/app/components/Navigation';
import Link from 'next/link';

const steps = [
  { n: '01', title: 'Create Your Account', desc: 'Register a profile on MindRain.org to get started.' },
  { n: '02', title: 'Generate Your Code', desc: 'Get your unique referral code from your dashboard.' },
  { n: '03', title: 'Share With Your Network', desc: 'Send the code to friends, classmates, and colleagues.' },
  { n: '04', title: 'They Register & Pay', desc: 'The participant enters your code at the payment page.' },
  { n: '05', title: 'You Earn', desc: 'Once payment is confirmed, your reward lands in your wallet.' },
];

const perks = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
      </svg>
    ),
    label: '10% per referral',
    sub: 'On successful registration',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
      </svg>
    ),
    label: '5% off for your referral',
    sub: 'Your friend saves on registration too',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
      </svg>
    ),
    label: 'No earning cap',
    sub: 'Refer more, earn more — always',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Fast UPI payouts',
    sub: 'Within 24 hrs – 7 days of request',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    label: 'Growth Certificate',
    sub: 'Mind Rain Partner recognition',
  },
];

export default function EarnPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBDF' }}>
      <Navigation />

      <div className="max-w-[90%] mx-auto px-2 py-12 space-y-16">

        {/* ── Hero ── */}
        <section className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#2C5F5F' }}>
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#D97757' }} />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#EDEBDF' }} />

          <div className="relative z-10 px-8 py-14 md:px-16 md:py-20 max-w-3xl">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(217,119,87,0.25)', color: '#D97757' }}
            >
              Refer &amp; Earn Program
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: '#F8F7F2' }}>
              Turn your network<br />into real earnings.
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(248,247,242,0.75)' }}>
              Share your referral code, invite participants, and receive a direct cash reward for every confirmed registration you bring in.
            </p>
            <Link
              href="/earn/create"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              style={{ backgroundColor: '#D97757', color: '#FFFFFF' }}
            >
              Create Earn Account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── What You Earn ── */}
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>What You Earn</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {perks.map((p) => (
              <div
                key={p.label}
                className="rounded-xl p-5 border flex flex-col gap-3 transition-all duration-200 hover:shadow-md"
                style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(44,95,95,0.1)', color: '#2C5F5F' }}
                >
                  {p.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{p.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>{p.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#1A1A1A' }}>How It Works</h2>
          <div className="relative">
            {/* vertical connector line — desktop */}
            <div
              className="hidden md:block absolute left-[2.35rem] top-10 bottom-10 w-px"
              style={{ backgroundColor: '#D0CEC2' }}
            />
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.n} className="flex items-start gap-5">
                  {/* number badge */}
                  <div
                    className="shrink-0 w-[4.7rem] h-[4.7rem] rounded-full flex items-center justify-center font-bold text-lg border-4 z-10"
                    style={{
                      backgroundColor: '#F8F7F2',
                      borderColor: i === 4 ? '#D97757' : '#2C5F5F',
                      color: i === 4 ? '#D97757' : '#2C5F5F',
                    }}
                  >
                    {step.n}
                  </div>
                  <div
                    className="flex-1 rounded-xl p-5 border"
                    style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
                  >
                    <p className="font-bold mb-1" style={{ color: '#1A1A1A' }}>{step.title}</p>
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Payout Policy + Eligibility side-by-side ── */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Payout Policy */}
          <div
            className="rounded-xl p-7 border"
            style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(44,95,95,0.1)', color: '#2C5F5F' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>Payout Policy</h3>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: '#3A3A3A' }}>
              <li className="flex items-baseline gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[3px]" style={{ backgroundColor: '#2C5F5F' }} />
                <span>Minimum wallet balance to withdraw: <strong>₹1,500</strong></span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[3px]" style={{ backgroundColor: '#2C5F5F' }} />
                <span>Payout via <strong>UPI transfer</strong> — apply anytime once threshold is met</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[3px]" style={{ backgroundColor: '#2C5F5F' }} />
                <span>Processing time: <strong>24 hours to 7 working days</strong> after withdrawal request</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 translate-y-[3px]" style={{ backgroundColor: '#2C5F5F' }} />
                <span>A referral counts only after the referred participant completes <strong>full payment</strong></span>
              </li>
            </ul>
          </div>

          {/* Eligibility + Why Join */}
          <div
            className="rounded-xl p-7 border"
            style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(217,119,87,0.12)', color: '#D97757' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>Who Can Join</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#3A3A3A' }}>
              Anyone with a registered profile on MindRain.org can join the program immediately — no approvals, no waiting.
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#6B6B6B' }}>
              Why join?
            </p>
            <ul className="space-y-2 text-sm" style={{ color: '#3A3A3A' }}>
              {[
                'Earn real cash for every successful registration',
                'No earning limit — the more you refer, the more you earn',
                'Build your profile as a contributor to an international design platform',
                'Ideal for architecture & design students across India and worldwide',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#D97757" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section
          className="rounded-2xl p-10 text-center border"
          style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
        >
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Ready to start earning?
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#6B6B6B' }}>
            Create your earn account in seconds and get your referral code. No caps, no delays — just rewards.
          </p>
          <Link
            href="/earn/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            style={{ backgroundColor: '#2C5F5F', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
          >
            Create Earn Account
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>

      </div>
    </div>
  );
}

import Link from 'next/link';

const LINKS = [
  { href: '/admin/event-editor', label: 'Event editor', description: 'Edit event details and brief files' },
  { href: '/admin/reg-list', label: 'Registrations', description: 'View and manage event registrations' },
  { href: '/admin/referrals', label: 'Referrals', description: 'Reward settings, redemptions and earn accounts' },
  { href: '/admin/payments', label: 'Payments', description: 'Money collected, fees and payout stats' },
];

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Admin</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="block bg-[#F8F7F2] border border-[#D0CEC2] rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all"
            >
              <span className="block text-lg font-bold text-[#1A1A1A]">{l.label}</span>
              <span className="block text-sm text-[#6B6B6B] mt-1">{l.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

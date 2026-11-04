'use client';

import { ClipboardCheck, CreditCard, ListChecks, SquarePen, Video, Info, type LucideIcon } from 'lucide-react';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';

type Status = 'pending' | 'in_progress' | 'approved' | 'rejected';
type Stage = (typeof FUNCTION_FOLLOWS_FORM.progressStages)[number];

const STAGES: Record<Stage, {
  title: string;
  icon: LucideIcon;
  /** Label for `approved`; other statuses use the defaults. */
  approvedLabel: string;
  /** Message when this stage is in progress. */
  inProgressMessage: string;
}> = {
  application: {
    title: 'Application', icon: SquarePen, approvedLabel: 'Submitted',
    inProgressMessage: 'Your application is being submitted.',
  },
  shortlisting: {
    title: 'Shortlisting', icon: ListChecks, approvedLabel: 'Approved',
    inProgressMessage: 'Your application has been submitted and is under review for shortlisting.',
  },
  interview: {
    title: 'Interview', icon: Video, approvedLabel: 'Approved',
    inProgressMessage: 'Your application is currently at the video interview stage.',
  },
  final_selection: {
    title: 'Final Selection', icon: ClipboardCheck, approvedLabel: 'Selected',
    inProgressMessage: 'Your application is in the final selection stage.',
  },
  fee_payment: {
    title: 'Fee Payment', icon: CreditCard, approvedLabel: 'Paid',
    inProgressMessage: 'Please complete your fee payment to confirm your participation.',
  },
};

const STATUS_STYLE: Record<Status, { label: string; ring: string; text: string; badgeBg: string; badgeText: string }> = {
  approved:    { label: 'Approved',    ring: '#2D5F4F', text: '#2D5F4F', badgeBg: 'rgba(45,95,79,0.12)',  badgeText: '#2D5F4F' },
  in_progress: { label: 'In Progress', ring: '#D97757', text: '#D97757', badgeBg: 'rgba(217,119,87,0.14)', badgeText: '#C04B2B' },
  rejected:    { label: 'Rejected',    ring: '#C85D3E', text: '#C85D3E', badgeBg: 'rgba(200,93,62,0.12)',  badgeText: '#C85D3E' },
  pending:     { label: 'Pending',     ring: '#B8B6AA', text: '#8B8B8B', badgeBg: '#EDEBDF',               badgeText: '#6B6B6B' },
};

function buildMessage(statuses: Status[], stages: Stage[]): string {
  const rejectedAt = statuses.indexOf('rejected');
  if (rejectedAt !== -1) {
    return `Unfortunately, your application was not taken forward at the ${STAGES[stages[rejectedAt]].title.toLowerCase()} stage.`;
  }
  if (statuses.every(s => s === 'approved')) return 'Congratulations! Your participation is confirmed.';
  const current = statuses.indexOf('in_progress');
  if (current !== -1) return STAGES[stages[current]].inProgressMessage;
  return 'Your application is on track. We will update you here as it moves forward.';
}

/** `progress` is `registrations_v3.form_data.progress` (stage -> status). */
export default function FunctionFollowsFormProgress({ progress }: { progress?: Record<string, string> | null }) {
  const stages = FUNCTION_FOLLOWS_FORM.progressStages as readonly Stage[] as Stage[];
  const valid: Status[] = ['pending', 'in_progress', 'approved', 'rejected'];
  const statuses: Record<string, Status> = Object.fromEntries(
    stages.map(s => [s, valid.includes(progress?.[s] as Status) ? (progress![s] as Status) : 'pending'])
  );

  const list: Status[] = stages.map(s => statuses[s] ?? 'pending');
  const rejectedAt = list.indexOf('rejected');

  return (
    <div className="mt-4 rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3D7' }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2C5F5F' }}>Registration Process</p>
      <p className="text-xs mt-1 mb-4" style={{ color: '#6B6B6B' }}>
        Track your application from submission to confirmed participation.
      </p>

      <ol className="flex flex-col md:flex-row md:items-start">
        {stages.map((stage, i) => {
          const def = STAGES[stage];
          const status = list[i];
          // Stages after a rejection can no longer happen.
          const closed = rejectedAt !== -1 && i > rejectedAt;
          const style = STATUS_STYLE[closed ? 'pending' : status];
          const label = closed ? 'Closed' : status === 'approved' ? def.approvedLabel : style.label;
          const Icon = def.icon;
          const connectorDone = i < stages.length - 1 && status === 'approved';

          return (
            <li key={stage} className="flex md:flex-1 md:flex-col md:items-center relative gap-3 md:gap-0 pb-5 md:pb-0 last:pb-0">
              {/* connector: vertical on mobile, horizontal on md+ */}
              {i < stages.length - 1 && (
                <>
                  <span className="md:hidden absolute left-[19px] top-10 bottom-0 w-0.5"
                    style={{ backgroundColor: connectorDone ? '#2D5F4F' : '#E5E3D7' }} />
                  <span className="hidden md:block absolute top-[19px] left-1/2 w-full h-0.5"
                    style={{ backgroundColor: connectorDone ? '#2D5F4F' : '#E5E3D7' }} />
                </>
              )}
              <span
                className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0"
                style={{ borderColor: style.ring, color: style.text, backgroundColor: '#FFFFFF' }}
              >
                <Icon size={18} />
              </span>
              <div className="md:mt-2 md:text-center">
                <p className="text-sm font-bold" style={{ color: closed ? '#8B8B8B' : '#1A1A1A' }}>{def.title}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: style.badgeBg, color: style.badgeText }}>
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: '#EDEBDF', color: '#6B6B6B' }}>
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>{buildMessage(list, stages)}</p>
      </div>
    </div>
  );
}

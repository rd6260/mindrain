'use client';

import { useState } from 'react';
import {
  Mail,
  MessageCircle,
  Instagram,
  Send,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Navigation from '@/app/components/Navigation';

// Discord icon (not in lucide)
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

// WhatsApp icon (not in lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function DirectContactCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  copyText,
  href,
  hint,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  copyText: string;
  href: string;
  hint: string;
}) {
  const { copied, copy } = useCopy(copyText);

  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E5E3D7] hover:border-[#2C5F5F]/40 hover:shadow-lg hover:shadow-[#2C5F5F]/5 transition-all duration-200"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[#8B8B8B] mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#2C5F5F] transition-colors truncate">
          {value}
        </p>
        <p className="text-xs text-[#A8A89A] mt-0.5">{hint}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={copy}
          title="Copy to clipboard"
          className={`
            flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
            transition-all duration-200
            ${copied
              ? 'bg-[#2C5F5F] text-white'
              : 'bg-[#EDEBDF] text-[#6B6B6B] hover:bg-[#2C5F5F]/10 hover:text-[#2C5F5F]'
            }
          `}
        >
          {copied
            ? <><Check className="w-3 h-3" /> Copied</>
            : <><Copy className="w-3 h-3" /> Copy</>
          }
        </button>
        <ArrowRight className="w-4 h-4 text-[#D0CEC2] group-hover:text-[#2C5F5F] group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </a>
  );
}

function SocialCard({
  icon: Icon,
  platform,
  handle,
  href,
  accentColor,
  description,
}: {
  icon: React.ElementType;
  platform: string;
  handle: string;
  href: string;
  accentColor: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-5 bg-white rounded-xl border border-[#E5E3D7] hover:border-[#2C5F5F]/40 hover:shadow-lg hover:shadow-[#2C5F5F]/5 transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-[#D0CEC2] group-hover:text-[#2C5F5F] transition-colors mt-1" />
      </div>

      {/* Text */}
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: accentColor }}>
        {platform}
      </p>
      <p className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#2C5F5F] transition-colors mb-1">
        {handle}
      </p>
      <p className="text-xs text-[#A8A89A] leading-relaxed flex-1">{description}</p>

      {/* Join pill */}
      <div className="mt-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          Join channel
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

export default function ContactPage() {
  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
                <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
                We're here to help
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">Contact Us</h1>
            <p className="text-[#6B6B6B] mt-2 text-sm leading-relaxed max-w-md">
              Have a question or need support? Reach out directly — or join our community channels to stay in the loop.
            </p>
          </div>

          <div className="space-y-5">

            {/* Direct contact card */}
            <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-shrink-0 w-3 h-3">
                  <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
                  <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-60" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#2C5F5F]">Direct Support</h2>
              </div>

              <div className="space-y-3">
                <DirectContactCard
                  icon={Mail}
                  iconColor="#2C5F5F"
                  iconBg="#2C5F5F18"
                  label="Email Support"
                  value="support@mindrain.org"
                  copyText="support@mindrain.org"
                  href="mailto:support@mindrain.org"
                  hint="We typically respond within 24 hours"
                />
                <DirectContactCard
                  icon={WhatsAppIcon}
                  iconColor="#25D366"
                  iconBg="#25D36618"
                  label="WhatsApp"
                  value="+91 99888 68783"
                  copyText="+919988868783"
                  href="https://wa.me/919988868783"
                  hint="Available during business hours"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-[#D0CEC2]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#A8A89A] px-1">
                Community
              </span>
              <div className="flex-1 h-px bg-[#D0CEC2]" />
            </div>

            {/* Social channels */}
            <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex-shrink-0 w-3 h-3">
                  <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
                  <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-60" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#2C5F5F]">Latest Updates & Reminders</h2>
              </div>
              <p className="text-xs text-[#A8A89A] mb-5 ml-6">
                Join our channels to never miss a deadline, announcement, or result.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <SocialCard
                  icon={Instagram}
                  platform="Instagram"
                  handle="@mind_rain"
                  href="https://www.instagram.com/mind_rain?igsh=OXZyNGo5ZHpzeDMz"
                  accentColor="#E1306C"
                  description="Visuals, highlights & event announcements"
                />
                <SocialCard
                  icon={WhatsAppIcon}
                  platform="WhatsApp Channel"
                  handle="MindRain Official"
                  href="https://whatsapp.com/channel/0029VbBdx7WICVfm5K8Kis3P"
                  accentColor="#25D366"
                  description="Quick updates straight to your WhatsApp"
                />
                <SocialCard
                  icon={DiscordIcon}
                  platform="Discord Server"
                  handle="MindRain"
                  href="https://discord.gg/ww8BjY8Nb6"
                  accentColor="#5865F2"
                  description="Chat, Q&A and community discussions"
                />
                <SocialCard
                  icon={Send}
                  platform="Telegram"
                  handle="@mindrain_arch"
                  href="https://t.me/mindrain_arch"
                  accentColor="#2AABEE"
                  description="Instant alerts and important notices"
                />
              </div>
            </div>

            {/* Footer note */}
            <p className="text-xs text-center text-[#A8A89A] pb-4">
              For the fastest response, reach us on{' '}
              <a
                href="https://wa.me/919988868783"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2C5F5F] font-semibold hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

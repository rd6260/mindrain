"use client";

import Image from "next/image";
import { colors } from '@/utils/colors';
import { useEffect, useState } from "react";
import DownloadBriefModal, { BriefFile } from "./DownloadModal";
import BriefModal from "./BriefModal";
import { createClient } from '@/lib/supabase/client';
import localFont from "next/font/local";


const AptosDisplay = localFont({
  src: [
    { path: '../fonts/Aptos Display/Aptos-Display.ttf',             weight: '400', style: 'normal' },
    { path: '../fonts/Aptos Display/Aptos-Display-Italic.ttf',      weight: '400', style: 'italic' },
    { path: '../fonts/Aptos Display/Aptos-Display-Bold.ttf',        weight: '700', style: 'normal' },
    { path: '../fonts/Aptos Display/Aptos-Display-Bold-Italic.ttf', weight: '700', style: 'italic' },
  ],
  display: 'swap',
});


// --- Props interface ---
export interface CompetitionDetail {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface CompetitionHighlight {
  icon: React.ReactNode; // e.g. an <svg />, an <Image />, or an icon component
  text: React.ReactNode; // e.g. "6 Winners"
}

export interface CompetitionCardProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  imageSrc: string; // must stay a string: next/image requires it
  imageAlt: string; // must stay a string: used for the alt attribute
  prizeLabel: React.ReactNode;
  details: CompetitionDetail[];
  highlights?: CompetitionHighlight[]; // row of icon + text
  deadlineLabel: React.ReactNode;
  deadlineValue: React.ReactNode;
  findOutMoreHref: string;
  briefFiles?: BriefFile[];
  briefModalTitle?: string;
  briefModalSubtitle?: string;
  eventId?: string;
}

// --- Login Required Modal ---
function LoginRequiredModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          Login Required
        </h3>
        <p className="text-base mb-8 leading-relaxed text-gray-600">
          You need to be logged in to download the brief and press kit files.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/login"
            className="block w-full px-6 py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            }}
          >
            Go to Login →
          </a>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg font-semibold text-base border border-gray-200 text-gray-500 transition-all duration-200 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveCompetitionCard({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  prizeLabel,
  details,
  highlights,
  deadlineLabel,
  deadlineValue,
  findOutMoreHref,
  briefFiles,
  briefModalTitle,
  briefModalSubtitle,
  eventId,
}: CompetitionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDownloadClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div
        className="flex flex-col lg:flex-row w-full font-sans rounded-lg"
        style={{ backgroundColor: colors.borderLight }}
      >
        {/* Top / Left Image */}
        <div className="w-full lg:w-[425px] lg:min-w-[425px] h-[260px] sm:h-[340px] lg:h-auto lg:min-h-[475px] relative overflow-hidden flex-shrink-0 self-stretch rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 425px, 100vw"
            className="object-cover"
          />
        </div>

        {/* Bottom / Right Content */}
        <div className="flex flex-col justify-center flex-1 px-6 sm:px-10 py-8 gap-2">
          <h1
            className={`${AptosDisplay.className} text-4xl sm:text-5xl font-black leading-tight tracking-tight text-gray-950 uppercase`}
          >
            {title}
          </h1>

          {/* div instead of p so ReactNode content (block elements) is valid */}
          <div className="text-base text-gray-700">
            {subtitle}
          </div>

          <div className="flex flex-row gap-2 mb-4">
            <span
              className="text-xs px-2 py-1 text-gray-100 uppercase tracking-wide"
              style={{ backgroundColor: colors.accent }}
            >
              {prizeLabel}
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-2 mb-4 text-sm text-gray-800 font-semibold">
            {details.map((detail, index) => (
              <div key={index}>
                <span className="text-gray-600">{detail.label}</span>{" "}{detail.value}
              </div>
            ))}
          </div>

          {/* Highlights: row of icon + text */}
          {highlights && highlights.length > 0 && (
            <div className="border-t border-gray-400/60 pt-5 mb-3">
              <div
                className="grid gap-4 text-center"
                style={{ gridTemplateColumns: `repeat(${highlights.length}, minmax(0, 1fr))` }}
              >
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 text-sm text-gray-800"
                  >
                    <span
                      className="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full"
                      style={{ color: colors.accent }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mt-1 mb-4">
            {deadlineLabel}{" "}
            <span className="font-semibold text-gray-900">{deadlineValue}</span>
          </div>

          <div className="flex flex-row items-center gap-5 mt-3">
            <a
              href={findOutMoreHref}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-3 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colors.accent }}
            >
              Find out more <span className="text-base leading-none">→</span>
            </a>
            {(eventId || (briefFiles && briefFiles.length > 0)) && (
              <button
                onClick={handleDownloadClick}
                className="flex items-center gap-1.5 text-sm text-gray-800 hover:text-gray-500 transition-colors cursor-pointer"
              >
                Download brief
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
      />

      {eventId ? (
        <BriefModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          eventId={eventId}
        />
      ) : (
        briefFiles && briefFiles.length > 0 && (
          <DownloadBriefModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={briefModalTitle || "Download Brief"}
            subtitle={briefModalSubtitle || "Select files to download"}
            files={briefFiles}
          />
        )
      )}
    </>
  );
}


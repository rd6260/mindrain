"use client";

import Image from "next/image";
import { colors } from '@/utils/colors';
import { Changa } from "next/font/google";
import { useEffect, useState } from "react";
import DownloadBriefModal, { BriefFile } from "./DownloadModal";
import { createClient } from '@/lib/supabase/client';

const changa = Changa({
  subsets: ["latin"],
  weight: ["200", "300", "500"],
})

// --- Props interface ---
export interface CompetitionCardProps {
  title: React.ReactNode;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  prizeLabel: React.ReactNode;
  details: { label: string; value: string }[];
  deadlineLabel: string;
  deadlineValue: string;
  findOutMoreHref: string;
  briefFiles?: BriefFile[];
  briefModalTitle?: string;
  briefModalSubtitle?: string;
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
  deadlineLabel,
  deadlineValue,
  findOutMoreHref,
  briefFiles,
  briefModalTitle,
  briefModalSubtitle,
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
        <div className="w-full lg:w-[425px] lg:min-w-[425px] h-[260px] sm:h-[340px] lg:h-[475px] relative overflow-hidden flex-shrink-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none"
          />
        </div>

        {/* Bottom / Right Content */}
        <div className="flex flex-col justify-center px-6 sm:px-10 py-8 gap-2">
          <h1 className={`${changa.className} text-4xl sm:text-5xl font-black leading-tight tracking-tight text-gray-950 uppercase`}>
            {title}
          </h1>

          <p className="text-base text-gray-700">
            {subtitle}
          </p>

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
              <p key={index}>
                <span className="text-gray-600">{detail.label}</span>{" "}{detail.value}
              </p>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-1 mb-4">
            {deadlineLabel}{" "}
            <span className="font-semibold text-gray-900">{deadlineValue}</span>
          </p>

          <div className="flex flex-row items-center gap-5 mt-3">
            <a
              href={findOutMoreHref}
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-3 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colors.accent }}
            >
              Find out more <span className="text-base leading-none">→</span>
            </a>
            {briefFiles && briefFiles.length > 0 && (
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

      {briefFiles && briefFiles.length > 0 && (
        <DownloadBriefModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={briefModalTitle || "Download Brief"}
          subtitle={briefModalSubtitle || "Select files to download"}
          files={briefFiles}
        />
      )}
    </>
  );
}

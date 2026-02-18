"use client";

import Image from "next/image";
import { colors } from '@/utils/colors';
import { Changa } from "next/font/google";
import { useState } from "react";
import DownloadBriefModal, { BriefFile } from "./DownloadModal";

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
})

const files: BriefFile[] = [
  {
    name: "Important Dates & Calendar",
    description: "Key deadlines and schedule",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf",
  },
  {
    name: "Terms & Conditions",
    description: "Important rules and regulations",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf",
  },
  {
    name: "Complete Brief",
    description: "Full competition brief document",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf",
  },
  {
    name: "Brief (Print Format)",
    description: "Print-ready version of the brief",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf",
  },
];

export default function LiveCompetitionCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-col lg:flex-row w-full font-sans rounded-lg"
        style={{ backgroundColor: colors.borderLight }}
      >
        {/* Top / Left Image */}
        <div className="w-full lg:w-[425px] lg:min-w-[425px] h-[260px] sm:h-[340px] lg:h-[475px] relative overflow-hidden flex-shrink-0">
          <Image
            src="/the-unreal-house/TUH-cover.jpg"
            alt="The Next House: USA"
            fill
            className="object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none"
          />
        </div>

        {/* Bottom / Right Content */}
        <div className="flex flex-col justify-center px-6 sm:px-10 py-8 gap-2">
          <h1 className={`${changa.className} text-4xl sm:text-5xl font-black leading-tight tracking-tight text-gray-950 uppercase`}>
            THE UNREAL HOUSE
          </h1>

          <p className="text-base text-gray-700">
            An Imaginary Home Design Challenge
          </p>

          <div className="flex flex-row gap-2 mb-4">
            <span
              className="text-xs px-2 py-1 text-gray-100 uppercase tracking-wide"
              style={{ backgroundColor: colors.accent }}
            >
              Total Prize Pool <span className="font-bold text-sm">₹50,000+</span>
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-2 mb-4 text-sm text-gray-800 font-semibold">
            <p>
              <span className="text-gray-600">Prize</span>{" "}Monetary award
            </p>
            <p>
              <span className="text-gray-600">Eligibility</span>{" "}Open to all undergraduate students
            </p>
          </div>

          <p className="text-sm text-gray-600 mt-1 mb-4">
            Advance registration deadline{" "}
            <span className="font-semibold text-gray-900">28 February 2026</span>
          </p>

          <div className="flex flex-row items-center gap-5 mt-3">
            <a
              href="/competition/imaginative-home-2025-2026"
              className="flex items-center gap-2 text-white text-sm font-medium px-5 py-3 hover:opacity-80 transition-opacity"
              style={{ backgroundColor: colors.accent }}
            >
              Find out more <span className="text-base leading-none">→</span>
            </a>
            <button
              onClick={() => setIsOpen(true)}
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
          </div>
        </div>
      </div>

      <DownloadBriefModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Download Brief"
        subtitle="The Unreal House — select files to download"
        files={files}
      />
    </>
  );
}

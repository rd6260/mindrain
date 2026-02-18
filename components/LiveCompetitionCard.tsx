"use client";

import Image from "next/image";
import { colors } from '@/utils/colors';
import { Changa } from "next/font/google";
import { useState } from "react";

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
})

const files = [
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

const downloadFile = (url: string) => {
  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = decodeURIComponent(url.split("/").pop() ?? "file.pdf");
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const downloadAll = () => {
  files.forEach((file, index) => {
    setTimeout(() => downloadFile(file.url), index * 300);
  });
};

export default function LiveCompetitionCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-row w-full font-sans rounded-lg"
        style={{ backgroundColor: colors.borderLight }}
      >
        {/* Left Image */}
        <div className="w-[425px] min-w-[425px] h-[475px] relative overflow-hidden flex-shrink-0">
          <Image
            src="/the-unreal-house/TUH-cover.jpg"
            alt="The Next House: USA"
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* Right Content */}
        <div className="flex flex-col justify-center px-10 py-8 gap-2">
          <h1 className={`${changa.className} text-5xl font-black leading-tight tracking-tight text-gray-950 uppercase`}>
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
              <span className="text-gray-600">Eligibility</span>{" "}open to all undergraduate students
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

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md mx-4 rounded-lg shadow-xl overflow-hidden"
            style={{ backgroundColor: colors.white }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className={`${changa.className} text-xl uppercase tracking-tight text-gray-950`}>
                  Download Brief
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">The Unreal House — select files to download</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* File List */}
            <ul className="divide-y divide-gray-100">
              {files.map((file) => (
                <li
                  key={file.url}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#E5E3D7] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* PDF Icon */}
                    <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file.url)}
                    className="text-gray-400 hover:text-gray-800 transition-colors p-1"
                    title="Download"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: colors.accent }}
              >
                Download all
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

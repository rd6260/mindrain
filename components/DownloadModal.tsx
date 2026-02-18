"use client";

import { Changa } from "next/font/google";
import { colors } from "@/utils/colors";

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
});

export type BriefFile = {
  name: string;
  description: string;
  url: string;
};

type DownloadBriefModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  files: BriefFile[];
};

const downloadFile = (url: string) => {
  const a: HTMLAnchorElement = document.createElement("a");
  a.href = url;
  a.download = decodeURIComponent(url.split("/").pop() ?? "file.pdf");
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function DownloadBriefModal({
  isOpen,
  onClose,
  title = "Download Brief",
  subtitle,
  files,
}: DownloadBriefModalProps) {
  if (!isOpen) return null;

  const downloadAll = () => {
    files.forEach((file, index) => {
      setTimeout(() => downloadFile(file.url), index * 300);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-xl overflow-hidden"
        style={{ backgroundColor: colors.white }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2
              className={`${changa.className} text-xl uppercase tracking-tight text-gray-950`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
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
                <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
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
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={onClose}
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
  );
}

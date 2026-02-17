import Image from "next/image";
import { colors } from '@/utils/colors';
import { Changa } from "next/font/google"

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
})


export default function LiveCompetitionCard() {
  return (
    <div className="flex flex-row w-full font-sans rounded-lg" style={{ backgroundColor: colors.borderLight }}
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
        {/* Title */}
        <h1 className={`${changa.className} text-5xl font-black leading-tight tracking-tight text-gray-950 uppercase`}>
          THE UNREAL HOUSE
        </h1>

        {/* Subtitle */}
        <p className="text-base text-gray-700">
          An Imaginary Home Design Challenge
        </p>

        {/* Tags */}
        <div className="flex flex-row gap-2 mb-4">
          <span className="text-xs px-2 py-1 text-gray-100 uppercase tracking-wide" style={{ backgroundColor: colors.accent }}
          >
            Total Prize Pool <span className="font-bold text-sm">₹50,000+</span>
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1 mt-2 mb-4 text-sm text-gray-800 font-semibold">
          <p>
            <span className="text-gray-600">Prize</span>{" "}
            Monetary award
          </p>
          <p>
            <span className="text-gray-600">Eligibility</span>{" "}
            open to all undergraduate students
          </p>
        </div>

        {/* Deadline */}
        <p className="text-sm text-gray-600 mt-1 mb-4">
          Advance registration deadline{" "}
          <span className="font-semibold text-gray-900">28 February 2026</span>
        </p>

        {/* Actions */}
        <div className="flex flex-row items-center gap-5 mt-3">
          <a
            href="/competition/imaginative-home-2025-2026"
            className="flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-5 py-3 hover:bg-gray-700 transition-colors"
            style={{ backgroundColor: colors.accent }}

          >
            Find out more{" "}
            <span className="text-base leading-none">→</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm text-gray-800 hover:text-gray-500 transition-colors"
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
          </a>
        </div>
      </div>
    </div>
  );
}

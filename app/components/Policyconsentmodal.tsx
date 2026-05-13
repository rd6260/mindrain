"use client";

import { useEffect, useState, useCallback } from "react";
import { Changa } from "next/font/google";
import { createClient } from '@/lib/supabase/client';
import { colors } from "@/utils/colors";

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
});

const POLICY_VERSION = "v2";

type PolicyDocument = {
  name: string;
  description: string;
  url: string;
};

const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    name: "Copyright Policy",
    description: "Rights, ownership & intellectual property",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Copyright%20Policy.pdf",
  },
  {
    name: "Privacy Policy",
    description: "How we collect, use & protect your data",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Privicy%20Policy.pdf",
  },
  {
    name: "Refund & Cancellation Policy",
    description: "Conditions for refunds and cancellations",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Refund%20%26%20Cancelation%20Policy.pdf",
  },
  {
    name: "Terms & Conditions",
    description: "Rules governing use of our platform",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/policy/policy-v2/MindRain%20Terms%20%26%20Conditions.pdf",
  },
];

export default function PolicyConsentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Lazy: defer check until after first paint
    const timer = setTimeout(async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return; // Not logged in — don't show

      setUserId(user.id);

      // Check if already accepted this version
      const { data } = await supabase
        .from("user_privacy_consents")
        .select("id")
        .eq("user_id", user.id)
        .eq("policy_version", POLICY_VERSION)
        .eq("accepted", true)
        .limit(1)
        .maybeSingle();

      if (!data) {
        setIsVisible(true);
      }
    }, 400); // small delay = lazy feel

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = useCallback(async () => {
    if (!checked || !userId) return;
    setIsAccepting(true);
    setError(null);

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("user_privacy_consents")
      .upsert(
        {
          user_id: userId,
          accepted: true,
          policy_version: POLICY_VERSION,
          accepted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,policy_version" }
      );

    if (insertError) {
      setError("Something went wrong. Please try again.");
      setIsAccepting(false);
      return;
    }

    setIsVisible(false);
  }, [checked, userId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.white }}
      // No onClick on backdrop — cannot dismiss
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          {/* Version badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-sm text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Updated
            </span>
            <span className="text-[10px] tracking-widest uppercase text-gray-400 font-medium">
              Policy {POLICY_VERSION.toUpperCase()}
            </span>
          </div>

          <h2
            className={`${changa.className} text-2xl uppercase tracking-tight text-gray-950 leading-tight`}
          >
            Our Updated Policies
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            We&apos;ve updated our policies. Please read each document carefully
            before continuing — your acceptance is required to use MindRain.
          </p>
        </div>

        {/* Document list */}
        <ul className="divide-y divide-gray-100">
          {POLICY_DOCUMENTS.map((doc) => (
            <li key={doc.url}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-4 hover:bg-[#E5E3D7] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* PDF icon */}
                  <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded flex-shrink-0">
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
                    <p className="text-sm font-medium text-gray-900">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.description}</p>
                  </div>
                </div>

                {/* Open icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4 text-gray-300 group-hover:text-gray-700 transition-colors flex-shrink-0 ml-3"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/60">
          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-4 group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 border rounded-sm transition-colors flex items-center justify-center ${checked
                  ? "border-transparent"
                  : "border-gray-300 group-hover:border-gray-500"
                  }`}
                style={checked ? { backgroundColor: colors.accent } : {}}
              >
                {checked && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 10 8"
                    fill="none"
                  >
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 leading-relaxed">
              I have read and agree to MindRain&apos;s updated Copyright Policy,
              Privacy Policy, Refund &amp; Cancellation Policy, and Terms &amp;
              Conditions.
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          <button
            onClick={handleAccept}
            disabled={!checked || isAccepting}
            className={`w-full flex items-center justify-center gap-2 text-white text-sm font-medium px-4 py-2.5 transition-opacity ${!checked || isAccepting
              ? "opacity-40 cursor-not-allowed"
              : "hover:opacity-80"
              }`}
            style={{ backgroundColor: colors.accent }}
          >
            {isAccepting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              "I Accept & Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

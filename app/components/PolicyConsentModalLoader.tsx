"use client";

import dynamic from "next/dynamic";

const PolicyConsentModal = dynamic(
  () => import("@/app/components/Policyconsentmodal"),
  { ssr: false }
);

export default function PolicyConsentModalLoader() {
  return <PolicyConsentModal />;
}

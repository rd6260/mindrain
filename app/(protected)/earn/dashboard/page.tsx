"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Registration {
  id: string;
  name: string;
  registrationDate: string;
  amountPaid: number;
}

interface RedeemRecord {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const registrations: Registration[] = [
  { id: "1", name: "Arjun Mehta", registrationDate: "2026-01-14", amountPaid: 549 },
  { id: "2", name: "Sneha Pillai", registrationDate: "2026-01-20", amountPaid: 999 },
  { id: "3", name: "Rohit Sharma", registrationDate: "2026-02-01", amountPaid: 999 },
  { id: "4", name: "Divya Krishnan", registrationDate: "2026-02-10", amountPaid: 275 },
  { id: "5", name: "Karthik Nair", registrationDate: "2026-02-18", amountPaid: 559 },
];

const redeemHistory: RedeemRecord[] = [
  { id: "1", date: "2025-01-25", amount: 150, status: "completed" },
  { id: "2", date: "2025-02-05", amount: 100, status: "completed" },
  { id: "3", date: "2025-02-20", amount: 50, status: "pending" },
];

const userProfile = {
  name: "Rohan Das",
  email: "rohandas@gmail.com",
  referralCode: "BIGDICK",
  memberSince: "December 2024",
  totalEarned: 550,
};

const walletData = {
  lifetimeCashback: 550,
  redeemed: 300,
  onTheWay: 50,
  redeemable: 200,
};

// ─── Sidebar Items ─────────────────────────────────────────────────────────────

const sidebarItems = [
  {
    key: "profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: "registrations",
    label: "Registrations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "wallet",
    label: "Wallet",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function maskName(name: string): string {
  return name.slice(0, 2) + "*".repeat(name.length - 4) + name.slice(-2);
  // const parts = name.trim().split(" ");
  // return parts
  //   .map((part) => {
  //     if (part.length <= 4) return part;
  //     return part.slice(0, 2) + "*".repeat(part.length - 4) + part.slice(-2);
  //   })
  //   .join(" ");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function RegistrationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
          Registrations
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6B6B6B" }}>
          People who registered using your referral code
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D0CEC2", background: "#F8F7F2" }}>
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-3 text-xs font-semibold tracking-widest uppercase" style={{ background: "#EDEBDF", color: "#8B8B8B", borderBottom: "1px solid #D0CEC2" }}>
          <span>Name</span>
          <span>Registered On</span>
          <span>Amount Paid</span>
          <span>Your Cut</span>
        </div>

        {registrations.map((reg, i) => (
          <div
            key={reg.id}
            className="grid grid-cols-4 px-6 py-4 items-center transition-colors"
            style={{
              borderBottom: i < registrations.length - 1 ? "1px solid #E5E3D7" : "none",
              background: i % 2 === 0 ? "#F8F7F2" : "#F5F1ED",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EDEBDF")}
            onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#F8F7F2" : "#F5F1ED")}
          >
            <span className="font-medium text-sm" style={{ color: "#1A1A1A" }}>
              {maskName(reg.name)}
            </span>
            <span className="text-sm" style={{ color: "#6B6B6B" }}>
              {formatDate(reg.registrationDate)}
            </span>
            <span className="text-sm" style={{ color: "#1A1A1A" }}>
              ₹{reg.amountPaid.toLocaleString("en-IN")}
            </span>
            <span className="text-sm font-semibold" style={{ color: "#2C5F5F" }}>
              ₹{(reg.amountPaid * 0.1).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: "#8B8B8B" }}>
        Your cut is <strong style={{ color: "#2C5F5F" }}>10%</strong> of every registration amount paid.
      </p>
    </div>
  );
}

function WalletTab() {
  const [copied, setCopied] = useState(false);

  const handleRedeem = () => {
    alert("Redeem flow triggered!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
          Wallet
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6B6B6B" }}>
          Track and redeem your cashback earnings
        </p>
      </div>

      {/* Cashback Card */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: "#2C5F5F" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "#EDEBDF" }} />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: "#EDEBDF" }} />

        <p className="text-sm font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(237,235,223,0.6)" }}>
          Total Earn
        </p>
        <p className="text-6xl font-bold mb-6" style={{ color: "#EDEBDF" }}>
          ₹{walletData.lifetimeCashback}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Redeemed", value: walletData.redeemed, color: "#EDEBDF" },
            { label: "On the Way", value: walletData.onTheWay, color: "#D97757" },
            { label: "Redeemable", value: walletData.redeemable, color: "#EDEBDF" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(237,235,223,0.5)" }}>
                {item.label}
              </p>
              <p className="text-xl font-bold" style={{ color: item.color }}>
                ₹{item.value}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleRedeem}
          className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all"
          style={{ background: "#EDEBDF", color: "#2C5F5F" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F5F1ED";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#EDEBDF";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          Redeem ₹{walletData.redeemable}
        </button>
      </div>

      {/* Redeem History */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>
          Redeem History
        </h3>
        <div className="space-y-3">
          {redeemHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "#F8F7F2", border: "1px solid #E5E3D7" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: record.status === "completed" ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)" }}
                >
                  {record.status === "completed" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D5F4F" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                    Cashback Redeemed
                  </p>
                  <p className="text-xs" style={{ color: "#8B8B8B" }}>
                    {formatDate(record.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                  ₹{record.amount}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: record.status === "completed" ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)",
                    color: record.status === "completed" ? "#2D5F4F" : "#D97757",
                  }}
                >
                  {record.status === "completed" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
          Profile
        </h2>
        <p className="text-sm mt-1" style={{ color: "#6B6B6B" }}>
          Your account details and referral information
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-8" style={{ background: "#F8F7F2", border: "1px solid #D0CEC2" }}>
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{ background: "#2C5F5F", color: "#EDEBDF" }}
          >
            {userProfile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>
              {userProfile.name}
            </p>
            <p className="text-sm" style={{ color: "#6B6B6B" }}>
              {userProfile.email}
            </p>
            <p className="text-xs mt-1" style={{ color: "#8B8B8B" }}>
              Member since {userProfile.memberSince}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ background: "#EDEBDF", border: "1px solid #E5E3D7" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8B8B8B" }}>
              Total Earned
            </p>
            <p className="text-2xl font-bold" style={{ color: "#2C5F5F", }}>
              ₹{userProfile.totalEarned}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#EDEBDF", border: "1px solid #E5E3D7" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8B8B8B" }}>
              Referrals Made
            </p>
            <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
              {registrations.length}
            </p>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8B8B8B" }}>
            Your Referral Code
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-xl px-5 py-3 font-mono text-lg font-bold tracking-widest"
              style={{ background: "#EDEBDF", color: "#2C5F5F", border: "1px solid #D0CEC2" }}
            >
              {userProfile.referralCode}
            </div>
            <button
              onClick={handleCopyReferral}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: copied ? "#2D5F4F" : "#2C5F5F",
                color: "#EDEBDF",
              }}
              onMouseEnter={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "#1A4D4D";
              }}
              onMouseLeave={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "#2C5F5F";
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#8B8B8B" }}>
            Share this code to earn 10% cashback on every registration.
          </p>
        </div>
      </div>

      {/* Redeem Summary */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>
          Redeem History
        </h3>
        <div className="space-y-3">
          {redeemHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "#F8F7F2", border: "1px solid #E5E3D7" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                  Cashback Redeemed
                </p>
                <p className="text-xs" style={{ color: "#8B8B8B" }}>
                  {formatDate(record.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>
                  ₹{record.amount}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: record.status === "completed" ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)",
                    color: record.status === "completed" ? "#2D5F4F" : "#D97757",
                  }}
                >
                  {record.status === "completed" ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EarnDashboard() {
  const [activeTab, setActiveTab] = useState("registrations");

  const renderContent = () => {
    switch (activeTab) {
      case "registrations":
        return <RegistrationsTab />;
      case "wallet":
        return <WalletTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen flex" style={{ background: "#EDEBDF" }}>
        {/* Sidebar */}
        <aside
          className="w-64 min-h-screen flex flex-col py-8 px-4"
          style={{ background: "#F5F1ED", borderRight: "1px solid #D0CEC2" }}
        >
          {/* Logo / Brand */}
          <div className="px-3 mb-10">
            <p
              className="text-xl font-bold tracking-tight"
              style={{ color: "#2C5F5F" }}
            >
              MR Earn
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8B8B" }}>
              Referral Dashboard
            </p>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1 flex-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                  style={{
                    background: isActive ? "#2C5F5F" : "transparent",
                    color: isActive ? "#EDEBDF" : "#6B6B6B",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "#EDEBDF";
                      (e.currentTarget as HTMLButtonElement).style.color = "#1A1A1A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B";
                    }
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer hint */}
          <div className="px-3 pt-6" style={{ borderTop: "1px solid #E5E3D7" }}>
            <p className="text-xs" style={{ color: "#8B8B8B" }}>
              Earn 10% on every successful referral registration.
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 max-w-4xl">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

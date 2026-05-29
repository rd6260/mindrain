"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

// interface Registration {
//   id: string;
//   name: string;
//   registrationDate: string;
//   amountPaid: number;
// }

interface RedeemRecord {
  id: string;
  created_at: string;
  action_time: string | null;
  is_approved: boolean | null;
  amount: number;
}

interface ReferralAccount {
  referral_code: string;
  earned_amount: number;
  redeemed_amount: number;
  current_balance: number;
  created_at: string;
}

interface UserProfile {
  name: string;
  email: string;
  referralCode: string;
  memberSince: string;
  totalEarned: number;
  currentBalance: number;
  redeemedAmount: number;
}

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
  // {
  //   key: "registrations",
  //   label: "Registrations",
  //   icon: (
  //     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
  //       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  //       <circle cx="9" cy="7" r="4" />
  //       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  //       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  //     </svg>
  //   ),
  // },
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

// function maskName(name: string): string {
//   return name.slice(0, 2) + "*".repeat(name.length - 4) + name.slice(-2);
// }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// function RegistrationsTab() {
//   return ( ... );
// }

function WalletTab({ redeemHistory, currentBalance, redeemedAmount, totalEarned, loading, userId, onRedeemSuccess }: {
  redeemHistory: RedeemRecord[];
  currentBalance: number;
  redeemedAmount: number;
  totalEarned: number;
  loading: boolean;
  userId: string;
  onRedeemSuccess: () => void;
}) {
  const supabase = createClient();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [upiId, setUpiId] = useState("");

  const canRedeem = currentBalance >= 1500;

  const handleRedeemSubmit = async () => {
    const amount = parseFloat(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      setRedeemError("Enter a valid amount.");
      return;
    }
    if (amount > currentBalance) {
      setRedeemError(`Amount cannot exceed your redeemable balance of ₹${currentBalance}.`);
      return;
    }
    if (amount < 100) {
      setRedeemError("Minimum redemption amount is ₹100.");
      return;
    }
    if (!upiId.trim()) {
      setRedeemError("Please enter your UPI ID.");
      return;
    }

    setRedeemLoading(true);
    setRedeemError(null);

    const { error } = await supabase
      .from("redeem_history")
      .insert({ user: userId, amount, upi_id: upiId.trim() });

    setRedeemLoading(false);

    if (error) {
      setRedeemError("Something went wrong. Please try again.");
      return;
    }

    setRedeemSuccess(true);
    setTimeout(() => {
      setShowRedeemModal(false);
      setRedeemAmount("");
      setUpiId("");
      setRedeemSuccess(false);
      onRedeemSuccess(); // re-fetch data in parent
    }, 1500);
  };

  const closeModal = () => {
    if (redeemLoading) return;
    setShowRedeemModal(false);
    setRedeemAmount("");
    setUpiId("");
    setRedeemError(null);
    setRedeemSuccess(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>Wallet</h2>
        <p className="text-sm mt-1" style={{ color: "#6B6B6B" }}>Track and redeem your cashback earnings</p>
      </div>

      {/* Cashback Card */}
      <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: "#2C5F5F" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: "#EDEBDF" }} />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: "#EDEBDF" }} />

        <p className="text-sm font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(237,235,223,0.6)" }}>
          Total Earn
        </p>
        <p className="text-6xl font-bold mb-6" style={{ color: "#EDEBDF" }}>
          ₹{totalEarned}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Redeemed", value: redeemedAmount, color: "#EDEBDF" },
            { label: "Redeemable", value: currentBalance, color: "#EDEBDF" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(237,235,223,0.5)" }}>{item.label}</p>
              <p className="text-xl font-bold" style={{ color: item.color }}>₹{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Button / Notice — below the card */}
      {canRedeem ? (
        <button
          onClick={() => setShowRedeemModal(true)}
          className="w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all"
          style={{ background: "#2C5F5F", color: "#EDEBDF" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1A4D4D";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#2C5F5F";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          Apply for Redemption →
        </button>
      ) : (
        <div
          className="w-full py-4 px-5 rounded-xl flex items-center gap-3"
          style={{ background: "#F8F7F2", border: "1px solid #D0CEC2" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8B8B" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm" style={{ color: "#6B6B6B" }}>
            You need at least <strong style={{ color: "#1A1A1A" }}>₹1,500</strong> to redeem.
            You're <strong style={{ color: "#2C5F5F" }}>₹{1500 - currentBalance}</strong> away.
          </p>
        </div>
      )}

      {/* Redeem History */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>Redeem History</h3>
        {redeemHistory.length === 0 ? (
          <p className="text-sm" style={{ color: "#8B8B8B" }}>No redemptions yet.</p>
        ) : (
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
                    style={{ background: record.is_approved ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)" }}
                  >
                    {record.is_approved ? (
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
                    <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>Cashback Redeemed</p>
                    <p className="text-xs" style={{ color: "#8B8B8B" }}>{formatDate(record.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>₹{record.amount}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: record.is_approved ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)",
                      color: record.is_approved ? "#2D5F4F" : "#D97757",
                    }}
                  >
                    {record.is_approved ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Redeem Modal ── */}
      {showRedeemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl p-8 relative"
            style={{ background: "#F8F7F2", border: "1px solid #D0CEC2" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ background: "#EDEBDF", color: "#6B6B6B" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {redeemSuccess ? (
              /* Success state */
              <div className="flex flex-col items-center py-6 gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(45,95,79,0.12)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D5F4F" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-lg font-semibold" style={{ color: "#1A1A1A" }}>Request Submitted!</p>
                <p className="text-sm text-center" style={{ color: "#6B6B6B" }}>
                  Your redemption request for <strong style={{ color: "#2C5F5F" }}>₹{redeemAmount}</strong> has been placed. We'll process it within 7 working days.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#1A1A1A" }}>Apply for Redemption</h3>
                <p className="text-sm mb-6" style={{ color: "#6B6B6B" }}>
                  Available balance: <strong style={{ color: "#2C5F5F" }}>₹{currentBalance}</strong>
                </p>

                {/* Amount input */}
                {/* Amount input */}
                <label className="relative block w-full mb-1">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => { setRedeemAmount(e.target.value); setRedeemError(null); }}
                    placeholder=" "
                    min={1}
                    max={currentBalance}
                    disabled={redeemLoading}
                    className="peer w-full px-4 pt-6 pb-2 text-sm font-medium rounded-xl outline-none transition-all"
                    style={{
                      background: "#EDEBDF",
                      border: redeemError ? "1.5px solid #C85D3E" : "1.5px solid #D0CEC2",
                      color: "#1A1A1A",
                    }}
                    onFocus={(e) => { if (!redeemError) (e.target as HTMLInputElement).style.borderColor = "#2C5F5F"; }}
                    onBlur={(e) => { if (!redeemError) (e.target as HTMLInputElement).style.borderColor = "#D0CEC2"; }}
                  />
                  <span className="absolute left-4 top-2 text-xs font-semibold pointer-events-none" style={{ color: "#8B8B8B" }}>
                    Amount (₹)
                  </span>
                </label>

                {/* UPI input */}
                <label className="relative block w-full mb-1 mt-3">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value); setRedeemError(null); }}
                    placeholder=" "
                    disabled={redeemLoading}
                    className="peer w-full px-4 pt-6 pb-2 text-sm font-medium rounded-xl outline-none transition-all"
                    style={{
                      background: "#EDEBDF",
                      border: redeemError ? "1.5px solid #C85D3E" : "1.5px solid #D0CEC2",
                      color: "#1A1A1A",
                    }}
                    onFocus={(e) => { if (!redeemError) (e.target as HTMLInputElement).style.borderColor = "#2C5F5F"; }}
                    onBlur={(e) => { if (!redeemError) (e.target as HTMLInputElement).style.borderColor = "#D0CEC2"; }}
                  />
                  <span className="absolute left-4 top-2 text-xs font-semibold pointer-events-none" style={{ color: "#8B8B8B" }}>
                    UPI ID
                  </span>
                </label>

                {redeemError && (
                  <p className="text-xs font-medium mb-4" style={{ color: "#C85D3E" }}>{redeemError}</p>
                )}
                {!redeemError && (
                  <p className="text-xs mb-4" style={{ color: "#8B8B8B" }}>Minimum redemption: ₹100 · Processed via UPI within 3 working days.</p>
                )}

                <button
                  onClick={handleRedeemSubmit}
                  disabled={redeemLoading || !redeemAmount || !upiId.trim()}
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
                  style={{
                    background: redeemLoading || !redeemAmount || !upiId.trim() ? "#D0CEC2" : "#2C5F5F",
                    color: redeemLoading || !redeemAmount || !upiId.trim() ? "#8B8B8B" : "#EDEBDF",
                    cursor: redeemLoading || !redeemAmount || !upiId.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {redeemLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting…
                    </span>
                  ) : "Submit Request →"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ profile, redeemHistory, loading }: {
  profile: UserProfile | null;
  redeemHistory: RedeemRecord[];
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !profile) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: "#1A1A1A" }}>Profile</h2>
        <p className="text-sm mt-1" style={{ color: "#6B6B6B" }}>Your account details and referral information</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl p-8" style={{ background: "#F8F7F2", border: "1px solid #D0CEC2" }}>
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{ background: "#2C5F5F", color: "#EDEBDF" }}
          >
            {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-xl font-semibold" style={{ color: "#1A1A1A" }}>{profile.name}</p>
            <p className="text-sm" style={{ color: "#6B6B6B" }}>{profile.email}</p>
            <p className="text-xs mt-1" style={{ color: "#8B8B8B" }}>Member since {profile.memberSince}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ background: "#EDEBDF", border: "1px solid #E5E3D7" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8B8B8B" }}>Total Earned</p>
            <p className="text-2xl font-bold" style={{ color: "#2C5F5F" }}>₹{profile.totalEarned}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: "#EDEBDF", border: "1px solid #E5E3D7" }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#8B8B8B" }}>Redeemable</p>
            <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>₹{profile.currentBalance}</p>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#8B8B8B" }}>Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-xl px-5 py-3 font-mono text-lg font-bold tracking-widest"
              style={{ background: "#EDEBDF", color: "#2C5F5F", border: "1px solid #D0CEC2" }}
            >
              {profile.referralCode}
            </div>
            <button
              onClick={handleCopyReferral}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{ background: copied ? "#2D5F4F" : "#2C5F5F", color: "#EDEBDF" }}
              onMouseEnter={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "#1A4D4D"; }}
              onMouseLeave={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.background = "#2C5F5F"; }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#8B8B8B" }}>Share this code to earn 10% cashback on every registration.</p>
        </div>
      </div>

      {/* Redeem History */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#1A1A1A" }}>Redeem History</h3>
        {redeemHistory.length === 0 ? (
          <p className="text-sm" style={{ color: "#8B8B8B" }}>No redemptions yet.</p>
        ) : (
          <div className="space-y-3">
            {redeemHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl px-5 py-4"
                style={{ background: "#F8F7F2", border: "1px solid #E5E3D7" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>Cashback Redeemed</p>
                  <p className="text-xs" style={{ color: "#8B8B8B" }}>{formatDate(record.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: "#1A1A1A" }}>₹{record.amount}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: record.is_approved ? "rgba(45,95,79,0.12)" : "rgba(217,119,87,0.12)",
                      color: record.is_approved ? "#2D5F4F" : "#D97757",
                    }}
                  >
                    {record.is_approved ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="w-6 h-6 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EarnDashboard() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [redeemHistory, setRedeemHistory] = useState<RedeemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch referral_account + user metadata in parallel
      const [accountRes, historyRes] = await Promise.all([
        supabase
          .from("referral_account")
          .select("referral_code, earned_amount, redeemed_amount, current_balance, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("redeem_history")
          .select("id, created_at, action_time, is_approved, amount")
          .eq("user", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (accountRes.data) {
        const acc: ReferralAccount = accountRes.data;
        setProfile({
          name: user.user_metadata?.full_name ?? user.email ?? "User",
          email: user.email ?? "",
          referralCode: acc.referral_code,
          memberSince: new Date(acc.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          totalEarned: acc.earned_amount,
          currentBalance: acc.current_balance,
          redeemedAmount: acc.redeemed_amount,
        });
      }

      if (historyRes.data) {
        setRedeemHistory(historyRes.data);
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {

    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      // case "registrations":
      //   return <RegistrationsTab />;
      case "wallet":
        return (
          <WalletTab
            redeemHistory={redeemHistory}
            currentBalance={profile?.currentBalance ?? 0}
            redeemedAmount={profile?.redeemedAmount ?? 0}
            totalEarned={profile?.totalEarned ?? 0}
            loading={loading}
            userId={userId}
            onRedeemSuccess={fetchData}
          />
        );
      case "profile":
        return <ProfileTab profile={profile} redeemHistory={redeemHistory} loading={loading} />;
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
          <div className="px-3 mb-10">
            <p className="text-xl font-bold tracking-tight" style={{ color: "#2C5F5F" }}>MR Earn</p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8B8B" }}>Referral Dashboard</p>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                  style={{ background: isActive ? "#2C5F5F" : "transparent", color: isActive ? "#EDEBDF" : "#6B6B6B" }}
                  onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "#EDEBDF"; (e.currentTarget as HTMLButtonElement).style.color = "#1A1A1A"; } }}
                  onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#6B6B6B"; } }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pt-6" style={{ borderTop: "1px solid #E5E3D7" }}>
            <p className="text-xs" style={{ color: "#8B8B8B" }}>Earn 10% on every successful referral registration.</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 max-w-4xl">{renderContent()}</main>
      </div>
    </>
  );
}

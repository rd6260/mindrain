'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
      }
      setIsLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    console.log("loading profile page");
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#edebdf' }}>
        <div className="text-2xl font-semibold text-[#323232]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log("no user found");
    return null;
  }

  console.log("here is your profiles page");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8" style={{ backgroundColor: '#edebdf' }}>
      <div className="w-full max-w-2xl bg-[lightgrey] rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] p-8">
        <h1 className="text-3xl font-black text-[#323232] mb-8 text-center">Profile</h1>
        
        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] p-4">
            <div className="text-sm font-semibold text-[#666] mb-1">Email</div>
            <div className="text-lg font-semibold text-[#323232]">{user.email}</div>
          </div>

          <div className="bg-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] p-4">
            <div className="text-sm font-semibold text-[#666] mb-1">User ID</div>
            <div className="text-sm font-mono text-[#323232] break-all">{user.id}</div>
          </div>

          <div className="bg-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] p-4">
            <div className="text-sm font-semibold text-[#666] mb-1">Created At</div>
            <div className="text-lg font-semibold text-[#323232]">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
            <div className="bg-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] p-4">
              <div className="text-sm font-semibold text-[#666] mb-2">User Metadata</div>
              <pre className="text-sm text-[#323232] overflow-auto">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[17px] font-semibold text-[#323232] cursor-pointer hover:bg-red-50 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

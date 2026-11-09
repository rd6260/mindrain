import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Every page under /admin is only for users with user_info.is_admin = true.
// Anyone else is sent home before any admin UI renders.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/home');

  const { data } = await supabase.from('user_info').select('is_admin').eq('id', user.id).maybeSingle();
  if (data?.is_admin !== true) redirect('/home');

  return <>{children}</>;
}

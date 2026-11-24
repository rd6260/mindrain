import { NextRequest, NextResponse } from 'next/server';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import { fffDocumentsFolder, fffLorPath } from '@/lib/projects/functionFollowsForm';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, reverseReferralEarnings } from '@/lib/payments/admin';

/**
 * Admin only: permanently delete a Function Follows Form application — its payments (and any referral
 * points credited for them), the registration row, and the applicant's uploaded LOR / documents.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await requireAdmin();
    if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { registration_id } = await req.json();
    if (!registration_id) return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });

    const { data: reg } = await supabase
      .from('registrations_v3').select('id, event_id, registration_by').eq('id', registration_id).maybeSingle();
    if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    if (reg.event_id !== FUNCTION_FOLLOWS_FORM.eventId) {
      return NextResponse.json({ error: 'Only Function Follows Form applications can be deleted here' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Referral ledger rows reference both the payments and the registration, so they go first.
    const { data: payments, error: listError } = await supabase
      .from('payments_v3').select('payment_id').eq('registration_id', registration_id);
    if (listError) throw listError;
    await reverseReferralEarnings(admin, (payments ?? []).map(p => p.payment_id));
    const { error: leftoverError } = await admin.from('referral_earnings').delete().eq('registration_id', registration_id);
    if (leftoverError) throw leftoverError;

    // Payments cascade with the registration.
    const { error: delError } = await supabase.from('registrations_v3').delete().eq('id', registration_id);
    if (delError) throw delError;

    // Uploaded files (private bucket; admins can only read it, so use the service role).
    try {
      const bucket = admin.storage.from(FUNCTION_FOLLOWS_FORM.formUploadBucket);
      const folder = fffDocumentsFolder(reg.registration_by);
      const { data: docs } = await bucket.list(folder, { limit: 1000 });
      const paths = [fffLorPath(reg.registration_by), ...(docs ?? []).map(f => `${folder}/${f.name}`)];
      await bucket.remove(paths);
    } catch (err) {
      console.error('Delete registration: failed to remove files', err);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json({ error: 'Failed to delete the registration' }, { status: 500 });
  }
}

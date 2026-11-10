import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import { fffLorPath } from '@/lib/projects/functionFollowsForm';

/**
 * Records an already-uploaded LOR on the applicant's registration.
 * Allowed only once the applicant is approved at the interview stage. The path is derived
 * server-side from the user id (never taken from the client) and the file must exist.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { registration_id } = await req.json();
    if (!registration_id) return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });

    const { data: reg } = await supabase
      .from('registrations_v3')
      .select('id, form_data')
      .eq('id', registration_id)
      .eq('registration_by', user.id)
      .eq('event_id', FUNCTION_FOLLOWS_FORM.eventId)
      .maybeSingle();
    if (!reg) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

    const stored = (reg.form_data ?? {}) as Record<string, any>;
    if (stored.progress?.interview !== 'approved') {
      return NextResponse.json({ error: 'LOR upload is not open for your application yet' }, { status: 403 });
    }

    const path = fffLorPath(user.id);
    const folder = path.slice(0, path.lastIndexOf('/'));
    const fileName = path.slice(path.lastIndexOf('/') + 1);
    const { data: files, error: listError } = await supabase.storage
      .from(FUNCTION_FOLLOWS_FORM.formUploadBucket)
      .list(folder, { search: fileName });
    if (listError || !files?.some(f => f.name === fileName)) {
      return NextResponse.json({ error: 'Uploaded file not found. Please try uploading again.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('registrations_v3')
      .update({ form_data: { ...stored, form: { ...(stored.form ?? {}), lor_path: path } } })
      .eq('id', reg.id);
    if (updateError) {
      console.error('LOR update error:', updateError);
      return NextResponse.json({ error: 'Failed to save Letter of Recommendation' }, { status: 500 });
    }

    return NextResponse.json({ lor_path: path });
  } catch (error) {
    console.error('LOR error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProject } from '@/lib/projects';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, form_data } = await req.json();
    if (!event_id || !form_data || typeof form_data !== 'object') {
      return NextResponse.json({ error: 'Missing event_id or form_data' }, { status: 400 });
    }

    const project = getProject(event_id);
    if (!project) {
      return NextResponse.json({ error: 'Registration is not open for this event' }, { status: 400 });
    }

    const validationError = project.validateFormData(form_data);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, code_name')
      .eq('id', event_id)
      .single();
    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: existingReg } = await supabase
      .from('registrations_v3')
      .select('id, paid, team_id')
      .eq('registration_by', user.id)
      .eq('event_id', event_id)
      .maybeSingle();

    if (existingReg) {
      if (existingReg.paid) {
        return NextResponse.json({ error: 'Already registered and paid' }, { status: 400 });
      }
      // Keep the same sequence, regenerate the rest in case form_data changed.
      const oldSequence = parseInt(existingReg.team_id?.split('-').pop() || '', 10);
      const sequence = Number.isNaN(oldSequence) ? Math.floor(Math.random() * 10000) : oldSequence;

      const { data: updatedReg, error: updateError } = await supabase
        .from('registrations_v3')
        .update({
          form_data,
          team_id: project.buildTeamId({ codeName: event.code_name, formData: form_data, sequence }),
        })
        .eq('id', existingReg.id)
        .select('id, team_id')
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
      }
      return NextResponse.json({ registration_id: updatedReg.id, team_id: updatedReg.team_id });
    }

    let referralId: string | null = null;
    if (form_data.referral_code) {
      const { data: referral } = await supabase
        .from('referral_account')
        .select('id')
        .eq('code', form_data.referral_code)
        .eq('status', 'active')
        .maybeSingle();
      if (!referral) {
        return NextResponse.json({ error: 'Invalid or inactive referral code' }, { status: 400 });
      }
      referralId = referral.id;
    }

    // Retry on team_id collision (unique violation)
    for (let attempt = 0; attempt < 10; attempt++) {
      const teamId = project.buildTeamId({
        codeName: event.code_name,
        formData: form_data,
        sequence: Math.floor(Math.random() * 10000),
      });

      const { data, error } = await supabase
        .from('registrations_v3')
        .insert({
          registration_by: user.id,
          event_id,
          team_id: teamId,
          form_data,
          paid: false,
          referral_used: referralId,
        })
        .select('id, team_id')
        .single();

      if (error) {
        if (error.code === '23505') continue;
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
      }
      return NextResponse.json({ registration_id: data.id, team_id: data.team_id });
    }

    return NextResponse.json({ error: 'Failed to generate unique team ID after retries' }, { status: 500 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

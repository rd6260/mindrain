import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function buildTeamId(
  codeName: string,
  group: string,
  category: string,
  teamType: string,
  sequence: number
): string {
  const categoryPart = category === '1' ? 'I' : 'II';
  const teamPart = teamType === 'solo' ? 'IND' : 'GRP';
  const paddedNumber = sequence.toString().padStart(4, '0');
  return `${codeName}-${group}-${categoryPart}-${teamPart}-${paddedNumber}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event_id, form_data } = await req.json();

    if (!event_id || !form_data) {
      return NextResponse.json({ error: 'Missing event_id or form_data' }, { status: 400 });
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, code_name')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check for existing registration
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
      // Update existing unpaid registration
      const { data: updatedReg, error: updateError } = await supabase
        .from('registrations_v3')
        .update({ form_data })
        .eq('id', existingReg.id)
        .select('id, team_id')
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
      }
      return NextResponse.json({ registration_id: updatedReg.id, team_id: updatedReg.team_id });
    }

    // Validate referral code if provided
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

    // Insert with retry on unique constraint collision
    let registrationData = null;
    
    for (let attempt = 0; attempt < 10; attempt++) {
      // Generate a random 4-digit number (0000-9999)
      const sequence = Math.floor(Math.random() * 10000);

      const teamId = buildTeamId(
        event.code_name,
        form_data.group || 'A',
        form_data.category || '1',
        form_data.team_type || 'solo',
        sequence
      );

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
        // 23505 is PostgreSQL's unique violation error code
        if (error.code === '23505') {
          continue; // Try again with a new random number
        }
        console.error('Insert error:', error);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
      }

      registrationData = data;
      break;
    }

    if (!registrationData) {
      return NextResponse.json({ error: 'Failed to generate unique team ID after retries' }, { status: 500 });
    }

    return NextResponse.json({
      registration_id: registrationData.id,
      team_id: registrationData.team_id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

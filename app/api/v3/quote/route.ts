import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteRegistration } from '@/lib/payments/quote';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registration_id, code } = await req.json();
    if (!registration_id) {
      return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 });
    }

    const result = await quoteRegistration({
      supabase,
      userId: user.id,
      registrationId: registration_id,
      code,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ quote: result.quote });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json({ error: 'Failed to calculate fee' }, { status: 500 });
  }
}

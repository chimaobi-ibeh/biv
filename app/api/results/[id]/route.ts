import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

export async function GET(
  request: NextRequest,
  context: any
) {
  // context.params may be a Promise in some Next.js versions, so be defensive
  const params = (context?.params && typeof context.params.then === 'function') ? await context.params : context?.params;
  const { id } = params || {};

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 501 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.from('startup_validator').select('*').eq('id', id).single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Failed to fetch result from Supabase:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

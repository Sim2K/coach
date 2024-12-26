import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const { session } = await request.json();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'No session provided' }),
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Set the auth cookie
    const response = new NextResponse(
      JSON.stringify({ message: 'Auth cookie set' }),
      { status: 200 }
    );

    await supabase.auth.setSession(session);

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

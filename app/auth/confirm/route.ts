import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAuthRedirectUrl } from '@/lib/url-utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/auth/reset-password';
  
  if (tokenHash && type) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    
    if (!error) {
      return NextResponse.redirect(getAuthRedirectUrl(next));
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(getAuthRedirectUrl('/auth/error'));
}

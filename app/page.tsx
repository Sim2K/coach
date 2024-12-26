import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      redirect('/profile');
    }
  } catch (error) {
    console.error('Auth error:', error);
  }

  redirect('/auth/login');
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // If there's an OAuth error, redirect to login with error
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin));
  }

  // If we have a code, the client-side Supabase will handle the session exchange
  // Just redirect to the target page with the code in the URL
  if (code) {
    // Append the code to the redirect URL so the client can exchange it
    const targetUrl = new URL(redirectTo, requestUrl.origin);
    targetUrl.searchParams.set('code', code);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}

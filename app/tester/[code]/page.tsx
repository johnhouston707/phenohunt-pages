"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { TesterTag, TesterFeedback } from "@/lib/supabase";
import TesterFeedbackForm from "@/components/TesterFeedbackForm";

const APP_STORE_URL = "https://apps.apple.com/us/app/phenohunt/id6754624180";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Check if running on iOS
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
         background: #000; color: #fff; min-height: 100vh; }
  .container { max-width: 500px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; text-align: center; margin-bottom: 24px; }
  .error { color: #f87171; background: rgba(248,113,113,0.1); padding: 16px; border-radius: 12px; text-align: center; }
  .loading { text-align: center; padding: 48px; color: #9ca3af; }
`;

function TesterPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testerCode = params.code as string;
  const authCode = searchParams.get('code'); // OAuth code from callback

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tag, setTag] = useState<TesterTag | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<TesterFeedback | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      
      // If we have an auth code from OAuth callback, exchange it for session
      if (authCode) {
        try {
          const { error: authError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (authError) {
            console.error('Failed to exchange code:', authError);
          }
          // Remove the code from URL to prevent re-exchange
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } catch (e) {
          console.error('Auth code exchange error:', e);
        }
      }
      
      // Check for session first
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and on iOS, redirect directly to App Store
      if (!session && isIOS()) {
        window.location.href = APP_STORE_URL;
        return;
      }
      
      // If no session and not on iOS, redirect to login with browser option
      if (!session) {
        router.push(`/login?redirect=/tester/${testerCode}`);
        return;
      }
      
      setUserId(session.user.id);

      // Get display name
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).single();
      setDisplayName(profile?.display_name || session.user.email || "Anonymous");

      // Get tag
      const { data: tags, error: tagErr } = await supabase.from("tester_tags").select("*").eq("code", testerCode).limit(1);
      if (tagErr || !tags?.length) {
        setError("Tester tag not found");
        setIsLoading(false);
        return;
      }
      setTag(tags[0] as TesterTag);

      // Get existing feedback
      const { data: feedbacks } = await supabase.from("tester_feedback").select("*")
        .eq("tester_tag_id", tags[0].id).eq("tester_id", session.user.id).limit(1);
      if (feedbacks?.length) {
        setExistingFeedback(feedbacks[0] as TesterFeedback);
      }
      setIsLoading(false);
    }
    load();
  }, [testerCode, authCode, router]);

  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (error || !tag || !userId) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="container"><div className="error">{error || "Unable to load feedback form"}</div></div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="container">
        <h1>Tester Feedback</h1>
        <TesterFeedbackForm 
          tag={tag}
          existingFeedback={existingFeedback}
          userId={userId}
          displayName={displayName}
        />
      </div>
    </>
  );
}

export default function TesterPage() {
  return (
    <Suspense fallback={
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="loading">Loading...</div>
      </>
    }>
      <TesterPageContent />
    </Suspense>
  );
}

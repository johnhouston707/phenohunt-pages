"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { TesterTag, TesterFeedback } from "@/lib/supabase";
import TesterFeedbackForm from "@/components/TesterFeedbackForm";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
         background: #000; color: #fff; min-height: 100vh; }
  .container { max-width: 500px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; text-align: center; margin-bottom: 24px; }
  .error { color: #f87171; background: rgba(248,113,113,0.1); padding: 16px; border-radius: 12px; text-align: center; }
  .loading { text-align: center; padding: 48px; color: #9ca3af; }
  
  .welcome-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
  }
  .logo {
    width: 80px;
    height: 80px;
    border-radius: 18px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .welcome-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  .welcome-subtitle {
    color: #9ca3af;
    margin-bottom: 32px;
    line-height: 1.5;
  }
  .strain-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    width: 100%;
    max-width: 320px;
  }
  .strain-name {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .pheno-number {
    color: #9ca3af;
    font-size: 14px;
  }
  .btn-primary {
    display: block;
    width: 100%;
    max-width: 320px;
    background: #fff;
    color: #000;
    padding: 16px 32px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 12px;
    text-align: center;
    border: none;
    cursor: pointer;
  }
  .btn-primary:hover {
    background: #f3f4f6;
  }
  .btn-secondary {
    display: block;
    width: 100%;
    max-width: 320px;
    background: transparent;
    color: #00A699;
    padding: 16px 32px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
    border: 1px solid #00A699;
    cursor: pointer;
  }
  .btn-secondary:hover {
    background: rgba(0, 166, 153, 0.1);
  }
  .divider-text {
    color: #6b7280;
    font-size: 14px;
    margin: 16px 0;
  }
  .hint {
    color: #6b7280;
    font-size: 13px;
    margin-top: 24px;
    line-height: 1.5;
    max-width: 320px;
  }
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
  const [showWelcome, setShowWelcome] = useState(false);

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
      
      // First, load the tester tag to show info
      const { data: tags, error: tagErr } = await supabase.from("tester_tags").select("*").eq("code", testerCode).limit(1);
      if (tagErr || !tags?.length) {
        setError("Tester tag not found");
        setIsLoading(false);
        return;
      }
      setTag(tags[0] as TesterTag);
      
      // Check for session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Show welcome/download page instead of redirecting
        setShowWelcome(true);
        setIsLoading(false);
        return;
      }
      setUserId(session.user.id);

      // Get display name
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).single();
      setDisplayName(profile?.display_name || session.user.email || "Anonymous");

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

  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="container"><div className="error">{error}</div></div>
      </>
    );
  }

  // Show welcome/download page if not logged in
  if (showWelcome && tag) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="welcome-container">
          <img src="/app-icon.png" alt="Phenohunt" className="logo" />
          <h1 className="welcome-title">Tester Feedback</h1>
          <p className="welcome-subtitle">
            You've been invited to provide<br />feedback on this pheno
          </p>
          
          <div className="strain-card">
            <div className="strain-name">{tag.strain_name || "Unknown Strain"}</div>
            {tag.pheno_number && (
              <div className="pheno-number">PHENO-{String(tag.pheno_number).padStart(4, "0")}</div>
            )}
          </div>
          
          <a 
            href="https://apps.apple.com/us/app/phenohunt/id6754624180" 
            className="btn-primary"
          >
            Download Phenohunt App
          </a>
          
          <p className="divider-text">or</p>
          
          <button
            onClick={() => router.push(`/login?redirect=/tester/${testerCode}`)}
            className="btn-secondary"
          >
            Continue in Browser
          </button>
          
          <p className="hint">
            For the best experience, download the app and scan this QR code again.
          </p>
        </div>
      </>
    );
  }

  if (!tag || !userId) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="container"><div className="error">Unable to load feedback form</div></div>
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

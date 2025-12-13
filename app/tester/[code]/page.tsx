"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
`;

export default function TesterPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tag, setTag] = useState<TesterTag | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<TesterFeedback | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/tester/${code}`);
        return;
      }
      setUserId(session.user.id);

      // Get display name
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).single();
      setDisplayName(profile?.display_name || session.user.email || "Anonymous");

      // Get tag
      const { data: tags, error: tagErr } = await supabase.from("tester_tags").select("*").eq("code", code).limit(1);
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
  }, [code, router]);

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
        <div className="container"><div className="error">{error || "Tag not found"}</div></div>
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

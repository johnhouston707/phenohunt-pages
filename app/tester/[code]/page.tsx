"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { TesterTag, TesterFeedback } from "@/lib/supabase";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
         background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; min-height: 100vh; }
  .container { max-width: 500px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; text-align: center; margin-bottom: 24px; }
  .card { background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
  .strain { font-size: 20px; font-weight: 700; }
  .pheno { color: #9ca3af; margin-top: 4px; }
  .section-title { font-size: 14px; color: #9ca3af; margin: 24px 0 12px; text-transform: uppercase; }
  .rating-row { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .rating-row:last-child { border-bottom: none; }
  .rating-label { display: flex; align-items: center; margin-bottom: 8px; }
  .rating-label span { margin-left: 8px; }
  .stars { display: flex; gap: 4px; }
  .star { font-size: 28px; cursor: pointer; transition: transform 0.1s; }
  .star:hover { transform: scale(1.1); }
  textarea { width: 100%; padding: 14px; border: none; border-radius: 12px; 
             background: rgba(255,255,255,0.1); color: #fff; font-size: 16px; resize: vertical; min-height: 100px; }
  textarea::placeholder { color: #9ca3af; }
  textarea:focus { outline: 2px solid #00A699; }
  button { width: 100%; padding: 16px; border: none; border-radius: 12px; 
           background: #00A699; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; }
  button:hover { background: #008f84; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .error { color: #f87171; background: rgba(248,113,113,0.1); padding: 16px; border-radius: 12px; text-align: center; }
  .success { text-align: center; padding: 48px 24px; }
  .success-icon { font-size: 48px; margin-bottom: 16px; }
  .loading { text-align: center; padding: 48px; color: #9ca3af; }
`;

function StarRating({ value, onChange, label, icon }: { value: number; onChange: (v: number) => void; label: string; icon: string }) {
  return (
    <div className="rating-row">
      <div className="rating-label"><span>{icon}</span><span>{label}</span></div>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="star" onClick={() => onChange(star)}>
            {star <= value ? "★" : "☆"}
          </span>
        ))}
        {value > 0 && <span style={{ marginLeft: 8, color: "#9ca3af" }}>{value}/5</span>}
      </div>
    </div>
  );
}

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
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [overallRating, setOverallRating] = useState(0);
  const [potencyRating, setPotencyRating] = useState(0);
  const [flavorRating, setFlavorRating] = useState(0);
  const [noseRating, setNoseRating] = useState(0);
  const [smoothnessRating, setSmoothnessRating] = useState(0);
  const [effectsRating, setEffectsRating] = useState(0);
  const [bagAppealRating, setBagAppealRating] = useState(0);
  const [colorRating, setColorRating] = useState(0);
  const [reviewNotes, setReviewNotes] = useState("");

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
        const fb = feedbacks[0] as TesterFeedback;
        setExistingFeedback(fb);
        setOverallRating(fb.overall_rating || 0);
        setPotencyRating(fb.potency_rating || 0);
        setFlavorRating(fb.flavor_rating || 0);
        setNoseRating(fb.nose_rating || 0);
        setSmoothnessRating(fb.smoothness_rating || 0);
        setEffectsRating(fb.effects_rating || 0);
        setBagAppealRating(fb.bag_appeal_rating || 0);
        setColorRating(fb.color_rating || 0);
        setReviewNotes(fb.review_notes || "");
      }
      setIsLoading(false);
    }
    load();
  }, [code, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag || !userId) return;
    setIsSaving(true);

    const supabase = getSupabase();
    const data = {
      overall_rating: overallRating || null,
      potency_rating: potencyRating || null,
      flavor_rating: flavorRating || null,
      nose_rating: noseRating || null,
      smoothness_rating: smoothnessRating || null,
      effects_rating: effectsRating || null,
      bag_appeal_rating: bagAppealRating || null,
      color_rating: colorRating || null,
      review_notes: reviewNotes || null,
      tester_display_name: displayName,
    };

    try {
      if (existingFeedback) {
        await supabase.from("tester_feedback").update(data).eq("id", existingFeedback.id);
      } else {
        await supabase.from("tester_feedback").insert({ ...data, tester_tag_id: tag.id, tester_id: userId });
      }
      setSaved(true);
    } catch {
      setError("Failed to save feedback");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="container">
          <div className="success">
            <div className="success-icon">✓</div>
            <h1>Thank You!</h1>
            <p style={{ color: "#9ca3af" }}>Your feedback has been saved.</p>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (error || !tag) {
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
        <div className="card">
          <div className="strain">{tag.strain_name || "Unknown Strain"}</div>
          {tag.pheno_number && <div className="pheno">PHENO-{String(tag.pheno_number).padStart(4, "0")}</div>}
        </div>

        <form onSubmit={handleSubmit}>
          <StarRating value={overallRating} onChange={setOverallRating} label="Overall" icon="⭐" />
          
          <div className="section-title">Flower Ratings</div>
          <StarRating value={potencyRating} onChange={setPotencyRating} label="Potency" icon="⚡" />
          <StarRating value={flavorRating} onChange={setFlavorRating} label="Flavor" icon="🍰" />
          <StarRating value={noseRating} onChange={setNoseRating} label="Nose" icon="👃" />
          <StarRating value={smoothnessRating} onChange={setSmoothnessRating} label="Smoothness" icon="💨" />
          <StarRating value={effectsRating} onChange={setEffectsRating} label="Effects" icon="🧠" />
          <StarRating value={bagAppealRating} onChange={setBagAppealRating} label="Bag Appeal" icon="👁" />
          <StarRating value={colorRating} onChange={setColorRating} label="Color" icon="🎨" />

          <div className="section-title">Notes</div>
          <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Share your thoughts..." />

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
          </button>
        </form>
      </div>
    </>
  );
}

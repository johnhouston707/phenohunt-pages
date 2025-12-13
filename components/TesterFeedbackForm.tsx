"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { createBrowserClient, TesterTag, TesterFeedback } from "@/lib/supabase";

interface Props {
  tag: TesterTag;
  existingFeedback: TesterFeedback | null;
  userId: string;
  displayName: string;
}

export default function TesterFeedbackForm({ tag, existingFeedback, userId, displayName }: Props) {
  const [overallRating, setOverallRating] = useState(existingFeedback?.overall_rating ?? 0);
  const [potencyRating, setPotencyRating] = useState(existingFeedback?.potency_rating ?? 0);
  const [flavorRating, setFlavorRating] = useState(existingFeedback?.flavor_rating ?? 0);
  const [noseRating, setNoseRating] = useState(existingFeedback?.nose_rating ?? 0);
  const [smoothnessRating, setSmoothnessRating] = useState(existingFeedback?.smoothness_rating ?? 0);
  const [effectsRating, setEffectsRating] = useState(existingFeedback?.effects_rating ?? 0);
  const [bagAppealRating, setBagAppealRating] = useState(existingFeedback?.bag_appeal_rating ?? 0);
  const [colorRating, setColorRating] = useState(existingFeedback?.color_rating ?? 0);
  const [reviewNotes, setReviewNotes] = useState(existingFeedback?.review_notes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const supabase = createBrowserClient();
    const feedbackData = {
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
        const { error } = await supabase.from("tester_feedback").update(feedbackData)
          .eq("id", existingFeedback.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tester_feedback").insert({
          ...feedbackData,
          tester_tag_id: tag.id,
          tester_id: userId,
        });
        if (error) throw error;
      }
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-white">Thank You!</h2>
        <p className="text-gray-400">Your feedback has been saved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Summary Card */}
      <div className="bg-[#1C1C1E] rounded-xl p-4 border border-[#38383A] shadow-sm">
        <h2 className="font-bold text-lg text-white">{tag.strain_name || "Unknown Strain"}</h2>
        {tag.pheno_number && (
          <p className="text-gray-400 text-sm mt-1">PHENO-{String(tag.pheno_number).padStart(4, "0")}</p>
        )}
        {overallRating > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#38383A]">
            <span className="text-sm text-gray-400">Your Overall Rating</span>
            <div className="flex space-x-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-sm" style={{ color: star <= overallRating ? "#00A699" : "rgba(255,255,255,0.2)" }}>★</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ratings Card */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#38383A] shadow-sm overflow-hidden">
        <div className="px-4">
          <StarRating value={overallRating} onChange={setOverallRating} label="Overall" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={noseRating} onChange={setNoseRating} label="Nose" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={flavorRating} onChange={setFlavorRating} label="Flavor" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={effectsRating} onChange={setEffectsRating} label="Effects" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={potencyRating} onChange={setPotencyRating} label="Potency" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={smoothnessRating} onChange={setSmoothnessRating} label="Smoothness" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={bagAppealRating} onChange={setBagAppealRating} label="Bag Appeal" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={colorRating} onChange={setColorRating} label="Color" />
        </div>
      </div>

      {/* Review Section */}
      <div className="bg-[#1C1C1E] rounded-xl border border-[#38383A] shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-[#38383A]">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Flower Review</span>
        </div>
        <textarea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-[#00A699] hover:bg-[#008F84] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {isSaving ? "Saving..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
      </button>
    </form>
  );
}

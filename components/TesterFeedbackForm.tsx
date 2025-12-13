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

// Color options matching iOS ColorTrait enum
const colorOptions = [
  { value: "purple", label: "Light Purple", color: "#A855F7" },
  { value: "darkPurple", label: "Dark Purple", color: "#3B0054" },
  { value: "forest", label: "Forest Green", color: "#006600" },
  { value: "lime", label: "Lime Green", color: "#22C55E" },
];

// Terpene names
const terpeneNames = ["Gas", "Floral", "Earthy", "Fruity", "Chem", "Grapes", "Candy", "Lemons", "Lime", "Tangie", "Peaches", "Skunk", "Jack", "Pine"];

export default function TesterFeedbackForm({ tag, existingFeedback, userId, displayName }: Props) {
  // Ratings
  const [overallRating, setOverallRating] = useState(existingFeedback?.overall_rating ?? 0);
  const [potencyRating, setPotencyRating] = useState(existingFeedback?.potency_rating ?? 0);
  const [flavorRating, setFlavorRating] = useState(existingFeedback?.flavor_rating ?? 0);
  const [noseRating, setNoseRating] = useState(existingFeedback?.nose_rating ?? 0);
  const [smoothnessRating, setSmoothnessRating] = useState(existingFeedback?.smoothness_rating ?? 0);
  const [effectsRating, setEffectsRating] = useState(existingFeedback?.effects_rating ?? 0);
  const [bagAppealRating, setBagAppealRating] = useState(existingFeedback?.bag_appeal_rating ?? 0);
  const [colorRating, setColorRating] = useState(existingFeedback?.color_rating ?? 0);
  const [reviewNotes, setReviewNotes] = useState(existingFeedback?.review_notes ?? "");
  
  // Terpene state
  const [showTerpeneSheet, setShowTerpeneSheet] = useState(false);
  const [overallStrength, setOverallStrength] = useState(existingFeedback?.overall_strength_pct ?? 0);
  const [terpeneValues, setTerpeneValues] = useState<Record<string, number>>({
    Gas: existingFeedback?.nose_gas_pct ?? 0,
    Floral: existingFeedback?.nose_floral_pct ?? 0,
    Earthy: existingFeedback?.nose_earthy_pct ?? 0,
    Fruity: existingFeedback?.nose_fruity_pct ?? 0,
    Chem: existingFeedback?.nose_chem_pct ?? 0,
    Grapes: existingFeedback?.nose_grapes_pct ?? 0,
    Candy: existingFeedback?.nose_candy_pct ?? 0,
    Lemons: existingFeedback?.nose_lemons_pct ?? 0,
    Lime: existingFeedback?.nose_lime_pct ?? 0,
    Tangie: existingFeedback?.nose_tangie_pct ?? 0,
    Peaches: existingFeedback?.nose_peaches_pct ?? 0,
    Skunk: existingFeedback?.nose_skunk_pct ?? 0,
    Jack: existingFeedback?.nose_jack_pct ?? 0,
    Pine: existingFeedback?.nose_pine_pct ?? 0,
  });
  
  // Color state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(existingFeedback?.selected_color ?? "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate terpene summary
  const getTerpSummary = () => {
    const nonZero = Object.entries(terpeneValues).filter(([, v]) => v > 0);
    if (nonZero.length === 0 && overallStrength === 0) return "Not Set";
    const sorted = nonZero.sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 2).map(([k]) => k);
    if (top.length === 0) return `Strength: ${overallStrength}%`;
    return top.join(", ");
  };

  // Handle terpene slider change
  const handleTerpeneChange = (name: string, value: number) => {
    const others = Object.entries(terpeneValues)
      .filter(([k]) => k !== name)
      .reduce((sum, [, v]) => sum + v, 0);
    const maxAllowed = Math.max(0, 100 - others);
    const finalValue = Math.min(Math.max(0, value), maxAllowed);
    setTerpeneValues((prev) => ({ ...prev, [name]: finalValue }));
  };

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
      // Terpene data
      overall_strength_pct: overallStrength,
      nose_gas_pct: terpeneValues.Gas,
      nose_floral_pct: terpeneValues.Floral,
      nose_earthy_pct: terpeneValues.Earthy,
      nose_fruity_pct: terpeneValues.Fruity,
      nose_chem_pct: terpeneValues.Chem,
      nose_grapes_pct: terpeneValues.Grapes,
      nose_candy_pct: terpeneValues.Candy,
      nose_lemons_pct: terpeneValues.Lemons,
      nose_lime_pct: terpeneValues.Lime,
      nose_tangie_pct: terpeneValues.Tangie,
      nose_peaches_pct: terpeneValues.Peaches,
      nose_skunk_pct: terpeneValues.Skunk,
      nose_jack_pct: terpeneValues.Jack,
      nose_pine_pct: terpeneValues.Pine,
      // Color
      selected_color: selectedColor || null,
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
        {/* Terpene Profile Button */}
        <button
          type="button"
          onClick={() => setShowTerpeneSheet(true)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2C2C2E] transition-colors"
        >
          <span className="font-semibold text-white">Terpene Profile</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">{getTerpSummary()}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
        <div className="border-t border-[#38383A] ml-4" />
        
        {/* Color Picker */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full py-3 flex items-center justify-between"
          >
            <span className="font-semibold text-white">Color</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedColor ? colorOptions.find(c => c.value === selectedColor)?.label : "Set Color"}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showColorPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {showColorPicker && (
            <div className="pb-3 space-y-3">
              {/* Color Spectrum */}
              <div 
                className="h-7 rounded-lg cursor-pointer relative"
                style={{
                  background: `linear-gradient(to right, ${colorOptions.map(c => c.color).join(', ')})`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percent = x / rect.width;
                  const index = Math.round(percent * (colorOptions.length - 1));
                  setSelectedColor(colorOptions[Math.min(Math.max(0, index), colorOptions.length - 1)].value);
                }}
              >
                {selectedColor && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border border-black/10"
                    style={{
                      left: `${(colorOptions.findIndex(c => c.value === selectedColor) / (colorOptions.length - 1)) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </div>
              
              {/* Color Labels */}
              <div className="flex justify-between">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`text-xs ${selectedColor === color.value ? 'text-white' : 'text-gray-500'}`}
                  >
                    {color.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Color Rating Stars */}
          <div className="flex justify-end pb-3">
            <StarRating 
              value={colorRating} 
              onChange={setColorRating} 
              label="" 
              starColor={selectedColor ? colorOptions.find(c => c.value === selectedColor)?.color : "#00A699"}
            />
          </div>
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        
        <div className="px-4">
          <StarRating value={noseRating} onChange={setNoseRating} label="Nose" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={bagAppealRating} onChange={setBagAppealRating} label="Bag Appeal" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={smoothnessRating} onChange={setSmoothnessRating} label="Smoothness" />
        </div>
        <div className="border-t border-[#38383A] ml-4" />
        <div className="px-4">
          <StarRating value={potencyRating} onChange={setPotencyRating} label="Potency" />
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
          <StarRating value={overallRating} onChange={setOverallRating} label="Overall" />
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

      {/* Terpene Profile Sheet (Modal) */}
      {showTerpeneSheet && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#1C1C1E] w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#38383A]">
              <h3 className="font-semibold text-white">Terpene Profile</h3>
              <button
                type="button"
                onClick={() => setShowTerpeneSheet(false)}
                className="text-[#00A699] font-semibold"
              >
                Done
              </button>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 space-y-6">
              {/* Nose Intensity */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Nose Intensity</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-white w-20">Strength</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={overallStrength}
                    onChange={(e) => setOverallStrength(parseInt(e.target.value))}
                    className="flex-1 accent-[#00A699]"
                  />
                  <span className="text-gray-400 w-12 text-right">{overallStrength}%</span>
                </div>
              </div>
              
              {/* Terpene Sliders */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Terpene Profile</h4>
                <p className="text-xs text-gray-500 mb-3">Distribute up to 100% across notes</p>
                
                <div className="space-y-2">
                  {terpeneNames.map((name) => (
                    <div key={name} className="flex items-center space-x-3">
                      <span className="text-white w-20 text-sm">{name}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={terpeneValues[name] || 0}
                        onChange={(e) => handleTerpeneChange(name, parseInt(e.target.value))}
                        className="flex-1 accent-[#00A699]"
                      />
                      <span className="text-gray-400 w-12 text-right text-sm">{terpeneValues[name] || 0}%</span>
                    </div>
                  ))}
                </div>
                
                {/* Remaining */}
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-gray-500">Remaining</span>
                  <span className="text-gray-400">
                    {Math.max(0, 100 - Object.values(terpeneValues).reduce((a, b) => a + b, 0))}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

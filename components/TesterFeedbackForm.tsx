"use client";

import { useState } from "react";
import { createBrowserClient, TesterTag, TesterFeedback } from "@/lib/supabase";

interface Props {
  tag: TesterTag;
  existingFeedback: TesterFeedback | null;
  userId: string;
  displayName: string;
}

// Profile photo component that handles loading and errors gracefully
function ProfilePhoto({ ownerId, phenoId }: { ownerId: string; phenoId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Construct URL from owner_id and pheno_id
  const photoUrl = `https://data.phenohunt.com/storage/v1/object/public/phenohunt-photos/PhenoProfilePhotos/${ownerId}/${phenoId}/ProfilePic/profile.jpg`;
  
  // Don't render anything if there was an error loading
  if (error) return null;
  
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
      <img
        src={photoUrl}
        alt="Pheno"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid rgba(255,255,255,0.2)",
          display: loaded ? "block" : "none",
        }}
      />
      {!loaded && !error && (
        <div style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }} />
      )}
    </div>
  );
}

// Color options matching iOS ColorTrait enum
const colorOptions = [
  { value: "purple", label: "Light Purple", color: "#A855F7" },
  { value: "darkPurple", label: "Dark Purple", color: "#581C87" },
  { value: "forest", label: "Forest Green", color: "#166534" },
  { value: "lime", label: "Lime Green", color: "#22C55E" },
];

// Terpene names
const terpeneNames = ["Gas", "Floral", "Earthy", "Fruity", "Chem", "Grapes", "Candy", "Lemons", "Lime", "Tangie", "Peaches", "Skunk", "Jack", "Pine"];

// Teal color for stars
const TEAL = "#00A699";

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

  // Star rating component
  const StarRating = ({ value, onChange, label, starColor = TEAL }: { value: number; onChange: (v: number) => void; label: string; starColor?: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", minHeight: 44 }}>
      {label && <span style={{ fontWeight: 600, color: "#fff" }}>{label}</span>}
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: 20, 
              cursor: "pointer",
              color: star <= value ? starColor : "rgba(255,255,255,0.2)",
              padding: 0,
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  if (saved) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ width: 64, height: 64, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <span style={{ fontSize: 32, color: "#fff" }}>✓</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fff" }}>Thank You!</h2>
        <p style={{ color: "#9ca3af" }}>Your feedback has been saved.</p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#1C1C1E",
    borderRadius: 12,
    border: "1px solid #38383A",
    marginBottom: 16,
    overflow: "hidden",
  };

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: "#38383A",
    marginLeft: 16,
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Summary Card */}
      <div style={{ ...cardStyle, padding: 16 }}>
        {/* Profile Photo - constructed from owner_id and pheno_id */}
        <ProfilePhoto ownerId={tag.owner_id} phenoId={tag.pheno_id} />
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "#fff", margin: 0, textAlign: "center" }}>{tag.strain_name || "Unknown Strain"}</h2>
        {tag.pheno_number && (
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 4, textAlign: "center" }}>PHENO-{String(tag.pheno_number).padStart(4, "0")}</p>
        )}
        {overallRating > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #38383A" }}>
            <span style={{ fontSize: 14, color: "#9ca3af" }}>Your Overall Rating</span>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} style={{ fontSize: 14, color: star <= overallRating ? TEAL : "rgba(255,255,255,0.2)" }}>★</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ratings Card */}
      <div style={cardStyle}>
        {/* Terpene Profile Button */}
        <button
          type="button"
          onClick={() => setShowTerpeneSheet(true)}
          style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontWeight: 600, color: "#fff" }}>Terpene Profile</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, color: "#9ca3af" }}>{getTerpSummary()}</span>
            <span style={{ color: "#9ca3af" }}>›</span>
          </div>
        </button>
        <div style={dividerStyle} />
        
        {/* Color Picker */}
        <div style={{ padding: "0 16px" }}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ width: "100%", padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontWeight: 600, color: "#fff" }}>Color</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#9ca3af" }}>
                {selectedColor ? colorOptions.find(c => c.value === selectedColor)?.label : "Set Color"}
              </span>
              <span style={{ color: "#9ca3af", transform: showColorPicker ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </div>
          </button>
          
          {showColorPicker && (
            <div style={{ paddingBottom: 12 }}>
              {/* Color Spectrum */}
              <div 
                style={{
                  height: 28,
                  borderRadius: 8,
                  cursor: "pointer",
                  position: "relative",
                  background: `linear-gradient(to right, ${colorOptions.map(c => c.color).join(', ')})`,
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
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: `${(colorOptions.findIndex(c => c.value === selectedColor) / (colorOptions.length - 1)) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: 20,
                    height: 20,
                    background: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }} />
                )}
              </div>
              
              {/* Color Labels */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      fontSize: 10, 
                      color: selectedColor === color.value ? "#fff" : "#6b7280",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {color.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Color Rating Stars */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setColorRating(star)}
                  style={{ 
                    background: "none", 
                    border: "none", 
                    fontSize: 20, 
                    cursor: "pointer",
                    color: star <= colorRating ? (selectedColor ? colorOptions.find(c => c.value === selectedColor)?.color : TEAL) : "rgba(255,255,255,0.2)",
                    padding: 0,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={dividerStyle} />
        
        <div style={{ padding: "0 16px" }}><StarRating value={noseRating} onChange={setNoseRating} label="Nose" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={bagAppealRating} onChange={setBagAppealRating} label="Bag Appeal" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={smoothnessRating} onChange={setSmoothnessRating} label="Smoothness" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={potencyRating} onChange={setPotencyRating} label="Potency" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={flavorRating} onChange={setFlavorRating} label="Flavor" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={effectsRating} onChange={setEffectsRating} label="Effects" /></div>
        <div style={dividerStyle} />
        <div style={{ padding: "0 16px" }}><StarRating value={overallRating} onChange={setOverallRating} label="Overall" /></div>
      </div>

      {/* Review Section */}
      <div style={cardStyle}>
        <div style={{ padding: "8px 16px", borderBottom: "1px solid #38383A" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>Flower Review</span>
        </div>
        <textarea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="Share your thoughts..."
          style={{
            width: "100%",
            padding: 16,
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 16,
            resize: "none",
            minHeight: 100,
            outline: "none",
          }}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <p style={{ color: "#f87171", fontSize: 14, textAlign: "center", margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        style={{
          width: "100%",
          padding: 14,
          background: TEAL,
          border: "none",
          borderRadius: 12,
          color: "#fff",
          fontSize: 17,
          fontWeight: 600,
          cursor: isSaving ? "not-allowed" : "pointer",
          opacity: isSaving ? 0.6 : 1,
        }}
      >
        {isSaving ? "Saving..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
      </button>

      {/* Terpene Profile Modal */}
      {showTerpeneSheet && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}>
          <div style={{
            background: "#1C1C1E",
            width: "100%",
            maxWidth: 500,
            borderRadius: 16,
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #38383A" }}>
              <h3 style={{ fontWeight: 600, color: "#fff", margin: 0 }}>Terpene Profile</h3>
              <button
                type="button"
                onClick={() => setShowTerpeneSheet(false)}
                style={{ background: "none", border: "none", color: TEAL, fontWeight: 600, fontSize: 16, cursor: "pointer" }}
              >
                Done
              </button>
            </div>
            
            {/* Content */}
            <div style={{ overflowY: "auto", flex: 1, padding: 16 }}>
              {/* Nose Intensity */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 12 }}>Nose Intensity</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: "#fff", width: 80 }}>Strength</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={overallStrength}
                    onChange={(e) => setOverallStrength(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: TEAL }}
                  />
                  <span style={{ color: "#9ca3af", width: 48, textAlign: "right" }}>{overallStrength}%</span>
                </div>
              </div>
              
              {/* Terpene Sliders */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Terpene Profile</h4>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Distribute up to 100% across notes</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {terpeneNames.map((name) => (
                    <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "#fff", width: 80, fontSize: 14 }}>{name}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={terpeneValues[name] || 0}
                        onChange={(e) => handleTerpeneChange(name, parseInt(e.target.value))}
                        style={{ flex: 1, accentColor: TEAL }}
                      />
                      <span style={{ color: "#9ca3af", width: 48, textAlign: "right", fontSize: 14 }}>{terpeneValues[name] || 0}%</span>
                    </div>
                  ))}
                </div>
                
                {/* Remaining */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12 }}>
                  <span style={{ color: "#6b7280" }}>Remaining</span>
                  <span style={{ color: "#9ca3af" }}>
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

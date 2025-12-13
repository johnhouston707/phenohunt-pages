"use client";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon?: string;
  starColor?: string;
}

// Teal color matching iOS app: Color(red: 0.00, green: 0.65, blue: 0.60) = #00A699
const TEAL_COLOR = "#00A699";

export default function StarRating({ value, onChange, label, icon, starColor }: StarRatingProps) {
  const activeColor = starColor || TEAL_COLOR;
  
  return (
    <div className="flex items-center justify-between py-3 min-h-[44px]">
      {label && <span className="font-semibold text-white">{label}</span>}
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-xl transition-all hover:scale-110 focus:outline-none"
            style={{ 
              color: star <= value ? activeColor : "rgba(255,255,255,0.2)"
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

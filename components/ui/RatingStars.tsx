import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  reviewCount?: number;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export default function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = false,
  reviewCount,
}: RatingStarsProps) {
  const px = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <div key={i} className="relative" style={{ width: px, height: px }}>
              <Star
                size={px}
                className="text-slate-200 fill-slate-200"
                aria-hidden
              />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
                >
                  <Star
                    size={px}
                    className="text-amber-400 fill-amber-400"
                    aria-hidden
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className={`font-semibold text-slate-800 ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-slate-500 ${size === "sm" ? "text-xs" : "text-sm"}`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

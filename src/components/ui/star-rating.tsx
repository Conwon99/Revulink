import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  interactive = true,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    if (starIndex <= currentRating) {
      return hoverRating > 0 ? "fill-yellow-400 text-yellow-400" : "fill-yellow-500 text-yellow-500";
    }
    return "fill-gray-400 text-gray-400";
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        return (
          <Star
            key={starRating}
            className={cn(
              sizeClasses[size],
              getStarColor(starRating),
              interactive && "cursor-pointer transition-all duration-200 hover:scale-125 hover:drop-shadow-lg",
              !interactive && "cursor-default"
            )}
            onClick={() => handleStarClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
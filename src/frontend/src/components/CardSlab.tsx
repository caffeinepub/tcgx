import { useCallback, useRef, useState } from "react";
import { formatGrade, formatRarity, getCardImageUrl } from "../lib/tcgxUtils";

function getRarityBadgeNew(rarity: string): string {
  const styles: Record<string, string> = {
    secretRare: "border border-champagne/60 text-champagne bg-champagne/10",
    ultraRare: "bg-violet-50 text-violet-700 border border-violet-200",
    rare: "bg-blue-50 text-blue-700 border border-blue-200",
    uncommon: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    common: "bg-muted text-muted-foreground border border-border",
  };
  return styles[rarity] ?? styles.common;
}

/** Format price for compact display in card tiles */
function formatTilePrice(cents: bigint | number): string {
  const n = typeof cents === "bigint" ? Number(cents) : cents;
  const dollars = n / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}K`;
  if (dollars >= 100) return `$${Math.round(dollars)}`;
  return `$${dollars.toFixed(0)}`;
}

interface CardSlabProps {
  card: {
    id: bigint;
    name: string;
    setName: string;
    cardNumber: string;
    grade: string;
    grader: string;
    rarity: string;
    imageUrl: string | { getDirectURL?: () => string };
    description?: string;
  };
  price?: bigint;
  onClick?: () => void;
  showFlip?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CardSlab({
  card,
  price,
  onClick,
  showFlip = false,
  className = "",
  size = "md",
}: CardSlabProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isFlipped) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      setTilt({ x: rotateX, y: rotateY });
    },
    [isFlipped],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleClick = useCallback(() => {
    if (showFlip) {
      setIsFlipped((f) => !f);
    } else if (onClick) {
      onClick();
    }
  }, [showFlip, onClick]);

  const imgUrl = getCardImageUrl(card as any);
  const rarityBadge = getRarityBadgeNew(card.rarity);

  const sizeClasses = {
    sm: "w-32 h-44",
    md: "w-40 h-56",
    lg: "w-full h-56",
  };

  return (
    <div
      ref={cardRef}
      className={`card-flip-container ${isFlipped ? "flipped" : ""} ${sizeClasses[size]} ${className}`}
      style={{ display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      role={onClick || showFlip ? "button" : undefined}
      tabIndex={onClick || showFlip ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`${card.name} ${formatGrade(card.grade)} trading card slab`}
    >
      <div
        className="card-flip-inner w-full h-full"
        style={{
          transform: isFlipped
            ? "rotateY(180deg)"
            : `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering && !isFlipped ? 1.03 : 1})`,
          transition: isFlipped
            ? "transform 0.6s cubic-bezier(0.4,0,0.2,1)"
            : "transform 0.1s ease-out",
        }}
      >
        {/* Front */}
        <div className="card-face w-full h-full">
          <div className="w-full h-full rounded-xl overflow-hidden border border-border bg-card shadow-card relative group">
            <img
              src={imgUrl}
              alt={card.name}
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
            />
            {isHovering && !isFlipped && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 + tilt.x * 2}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
                }}
              />
            )}
          </div>
        </div>

        {/* Back */}
        <div className="card-face card-back w-full h-full">
          <div className="w-full h-full rounded-xl overflow-hidden border border-border bg-card p-4 flex flex-col justify-between shadow-card">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-sans">
                Phygital Slab
              </p>
              <h4 className="font-serif text-foreground font-bold text-sm leading-tight italic">
                {card.name}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-sans">
                {card.setName} #{card.cardNumber}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                  Grade
                </span>
                <span className="text-xs font-bold text-teal font-sans">
                  {formatGrade(card.grade)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                  Grader
                </span>
                <span className="text-[10px] text-foreground font-sans">
                  {card.grader}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                  Rarity
                </span>
                <span
                  className={`text-[10px] font-medium font-sans ${rarityBadge.split(" ")[1]}`}
                >
                  {formatRarity(card.rarity)}
                </span>
              </div>
              {price !== undefined && (
                <div className="pt-1 border-t border-border">
                  <span className="text-[10px] text-champagne font-bold font-sans">
                    {(Number(price) / 100).toFixed(2)} ckUSDC
                  </span>
                </div>
              )}
            </div>

            <p className="text-[9px] text-muted-foreground/60 leading-tight font-sans">
              {card.description}
            </p>
          </div>
        </div>
      </div>

      {showFlip && !isFlipped && (
        <div className="absolute bottom-1 right-1 text-[8px] uppercase tracking-widest text-muted-foreground/50 pointer-events-none font-sans">
          tap to flip
        </div>
      )}
    </div>
  );
}

interface CardTileProps {
  card: {
    id: bigint;
    name: string;
    setName: string;
    cardNumber: string;
    grade: string;
    grader: string;
    rarity: string;
    imageUrl: string | { getDirectURL?: () => string };
    description?: string;
  };
  price?: bigint;
  onClick?: () => void;
  showPrice?: boolean;
  className?: string;
}

export function CardTile({
  card,
  price,
  onClick,
  showPrice = true,
  className = "",
}: CardTileProps) {
  const imgUrl = getCardImageUrl(card as any);
  const rarityBadge = getRarityBadgeNew(card.rarity);
  const isSecretRare = card.rarity === "secretRare";

  return (
    <button
      type="button"
      className={`group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer text-left w-full card-premium-hover shadow-card ${className}`}
      onClick={onClick}
      aria-label={`${card.name} ${formatGrade(card.grade)}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={imgUrl}
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          draggable={false}
        />
        {/* Rarity badge top-right */}
        <div className="absolute top-2 right-2">
          {isSecretRare ? (
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium font-sans ${rarityBadge}`}
            >
              <span className="holographic">{formatRarity(card.rarity)}</span>
            </span>
          ) : (
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium font-sans ${rarityBadge}`}
            >
              {formatRarity(card.rarity)}
            </span>
          )}
        </div>
        {/* Price badge bottom-left — visible at a glance on the image */}
        {showPrice && price !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-foreground/70 to-transparent">
            <p className="font-display font-bold text-sm text-white leading-none">
              {formatTilePrice(price)}
              <span className="text-[9px] font-sans font-normal text-white/70 ml-1">
                ckUSDC
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="px-3 pt-2.5 pb-3">
        <p className="text-xs font-semibold font-sans text-foreground truncate">
          {card.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-sans text-teal font-bold">
            {formatGrade(card.grade)}
          </span>
          <span className="text-[10px] font-sans text-muted-foreground">
            {card.setName}
          </span>
        </div>
      </div>
    </button>
  );
}

import { ArrowRight, Shield, Star } from "lucide-react";
import type { PACK_TIERS } from "../lib/mockData";

interface PackCardProps {
  tier: (typeof PACK_TIERS)[0];
  onPurchase: () => void;
  disabled?: boolean;
}

function getPackBackground(badge: string) {
  if (badge === "LEGENDARY")
    return "bg-gradient-to-br from-amber-50 to-yellow-100";
  if (badge === "POPULAR")
    return "bg-gradient-to-br from-blue-50 to-indigo-100";
  return "bg-gradient-to-br from-slate-100 to-slate-200";
}

export function PackCard({ tier, onPurchase, disabled }: PackCardProps) {
  const isFeatured = tier.featured;
  const isGodPack = tier.badge === "LEGENDARY";

  return (
    <div
      className={`relative bg-card rounded-2xl overflow-hidden border transition-all duration-300 card-premium-hover ${
        isGodPack
          ? "border-champagne/40 shadow-champagne-sm"
          : isFeatured
            ? "border-teal/30 shadow-teal-sm"
            : "border-border shadow-card"
      }`}
    >
      {isGodPack && (
        <div className="absolute top-0 left-0 right-0 h-0.5 champagne-gradient" />
      )}
      {isFeatured && !isGodPack && (
        <div className="absolute top-0 left-0 right-0 h-0.5 teal-gradient" />
      )}

      {/* Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`text-[9px] uppercase tracking-[0.15em] px-2 py-1 rounded-full font-semibold font-sans ${
            tier.badge === "LEGENDARY"
              ? "bg-foreground text-background"
              : tier.badge === "POPULAR"
                ? "bg-teal text-white"
                : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {tier.badge === "LEGENDARY" && (
            <Star className="w-2.5 h-2.5 inline mr-1" />
          )}
          {tier.badge}
        </span>
      </div>

      {/* Pack image */}
      <div
        className={`relative h-64 flex items-center justify-center overflow-hidden ${getPackBackground(tier.badge ?? "")}`}
      >
        <img
          src={tier.imageUrl}
          alt={tier.name}
          className="relative h-52 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              {tier.name}
            </h3>
            <p className="text-xs font-sans text-muted-foreground">
              {tier.cardCount} cards per pack
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
              Price
            </p>
            <p className="font-display font-bold text-lg text-foreground">
              ${tier.price} ckUSDC
            </p>
          </div>
        </div>

        <p className="text-xs font-sans text-muted-foreground leading-relaxed mb-4">
          {tier.description}
        </p>

        {/* Odds */}
        <div className="mb-4 p-3 rounded-xl bg-muted border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="w-3 h-3 text-teal" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold font-sans">
              Pull Odds
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(tier.odds).map(([rarity, odds]) => (
              <div key={rarity} className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground capitalize font-sans">
                  {rarity === "ultraRare"
                    ? "Ultra Rare"
                    : rarity === "secretRare"
                      ? "Secret Rare"
                      : rarity}
                </span>
                <span
                  className={`text-[9px] font-bold font-sans ${
                    rarity === "secretRare"
                      ? "text-champagne"
                      : rarity === "ultraRare"
                        ? "text-violet-600"
                        : rarity === "rare"
                          ? "text-blue-600"
                          : "text-muted-foreground"
                  }`}
                >
                  {odds}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onPurchase}
          disabled={disabled}
          className={`w-full py-3 rounded-xl text-sm font-semibold font-sans uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
            isGodPack
              ? "champagne-gradient text-white hover:opacity-90"
              : isFeatured
                ? "bg-foreground text-background hover:opacity-85"
                : "border-2 border-foreground text-foreground hover:bg-foreground hover:text-background"
          } disabled:opacity-50`}
          data-ocid={`store.${tier.name.toLowerCase().replace(" ", "_")}.primary_button`}
        >
          Open Pack <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

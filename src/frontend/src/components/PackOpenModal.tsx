import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Card } from "../backend.d";
import type { MockCard } from "../lib/mockData";
import {
  formatGrade,
  formatRarity,
  getCardImageUrl,
  getRarityBadgeStyle,
  triggerConfetti,
} from "../lib/tcgxUtils";

interface PackOpenModalProps {
  open: boolean;
  onClose: () => void;
  cards: Array<Card | MockCard> | null;
  packName: string;
  isOpening: boolean;
}

export function PackOpenModal({
  open,
  onClose,
  cards,
  packName,
  isOpening,
}: PackOpenModalProps) {
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<number | null>(null);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (!open) {
      setRevealedIndex(-1);
      setAllRevealed(false);
      setCurrentFocus(null);
      confettiTriggered.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!cards || isOpening) return;
    if (open && cards.length > 0) {
      setRevealedIndex(-1);
      const reveal = (i: number) => {
        if (i >= cards.length) {
          setAllRevealed(true);
          if (!confettiTriggered.current) {
            const hasRare = cards.some((c) =>
              ["ultraRare", "secretRare"].includes(
                typeof c.rarity === "string" ? c.rarity : "",
              ),
            );
            if (hasRare) {
              confettiTriggered.current = true;
              triggerConfetti();
            }
          }
          return;
        }
        setTimeout(
          () => {
            setRevealedIndex(i);
            setCurrentFocus(i);
            reveal(i + 1);
          },
          450 + i * 50,
        );
      };
      const timer = setTimeout(() => reveal(0), 300);
      return () => clearTimeout(timer);
    }
  }, [cards, open, isOpening]);

  const getRarityGlow = (rarity: string) => {
    const glowMap: Record<string, string> = {
      secretRare:
        "0 0 40px oklch(0.78 0.065 88 / 0.4), 0 0 80px oklch(0.78 0.065 88 / 0.15)",
      ultraRare:
        "0 0 30px rgba(167,139,250,0.35), 0 0 60px rgba(167,139,250,0.15)",
      rare: "0 0 20px rgba(96,165,250,0.25)",
      uncommon: "0 0 15px oklch(0.50 0.115 168 / 0.2)",
      common: "none",
    };
    return glowMap[rarity] ?? "none";
  };

  // Determine grid columns based on card count
  const cardCount = cards?.length ?? 0;
  const gridCols =
    cardCount <= 2
      ? "grid-cols-2 sm:grid-cols-2"
      : cardCount === 3
        ? "grid-cols-3 sm:grid-cols-3"
        : cardCount === 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && allRevealed && onClose()}>
      <DialogContent
        className="bg-card border-border w-full max-w-3xl p-0 overflow-hidden shadow-card-hover
          rounded-t-2xl rounded-b-none sm:rounded-2xl
          fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto
          translate-x-0 translate-y-0 sm:translate-x-[-50%] sm:translate-y-[-50%]
          sm:top-[50%] sm:left-[50%]
          data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom
          sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0"
        data-ocid="pack_open.modal"
      >
        {allRevealed && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50"
            aria-label="Close"
            data-ocid="pack_open.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Drag handle pill for mobile bottom-sheet feel */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border opacity-60" />
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto max-h-[90vh] sm:max-h-none">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-8">
            {isOpening ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full teal-gradient animate-pulse-gold flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-sans uppercase tracking-widest text-teal font-semibold">
                  Opening {packName} Pack…
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-muted-foreground mb-1">
                  {packName} Pack
                </p>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                  {allRevealed ? "Your Cards" : "Revealing…"}
                </h2>
              </div>
            )}
          </div>

          {/* Cards grid */}
          {!isOpening && cards && (
            <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
              {cards.map((card, i) => {
                const imgUrl = getCardImageUrl(card as any);
                const rarity =
                  typeof card.rarity === "string" ? card.rarity : "common";
                const isVisible = i <= revealedIndex;
                const isFocused = currentFocus === i;

                return (
                  <div
                    key={String(card.id)}
                    className="relative"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0) scale(1)"
                        : "translateY(40px) scale(0.85)",
                      transition:
                        "opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.2,0,0,1)",
                      transitionDelay: `${i * 0.05}s`,
                    }}
                    data-ocid={`pack_open.card.item.${i + 1}`}
                  >
                    <div
                      className="w-full aspect-[2/3] rounded-xl overflow-hidden border bg-card"
                      style={{
                        borderColor:
                          isFocused && isVisible
                            ? "oklch(0.38 0.125 168 / 0.5)"
                            : "oklch(0.88 0.014 78)",
                        boxShadow: isVisible ? getRarityGlow(rarity) : "none",
                        transition:
                          "box-shadow 0.5s ease-out, border-color 0.3s",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>

                    <div className="mt-1.5 sm:mt-2 text-center">
                      <p className="text-xs font-semibold font-sans text-foreground truncate">
                        {card.name}
                      </p>
                      <p className="text-[10px] font-sans text-teal font-bold">
                        {formatGrade(
                          typeof card.grade === "string" ? card.grade : "",
                        )}
                      </p>
                      <span
                        className={`inline-block text-[9px] px-1.5 py-0.5 rounded border mt-0.5 font-sans ${getRarityBadgeStyle(rarity)}`}
                      >
                        {formatRarity(rarity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isOpening && (
            <div className="flex justify-center items-center h-40">
              <div className="space-y-2 text-center">
                <div className="flex gap-1 justify-center">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-teal"
                      style={{
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-sans text-muted-foreground">
                  Minting your cards on-chain…
                </p>
              </div>
            </div>
          )}

          {allRevealed && (
            <div className="mt-5 sm:mt-6 text-center pb-safe">
              <p className="text-xs font-sans text-muted-foreground mb-3">
                Cards added to your collection on-chain.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 min-h-[44px] rounded-2xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-widest hover:opacity-85 transition-opacity"
                data-ocid="pack_open.confirm_button"
              >
                View Collection
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

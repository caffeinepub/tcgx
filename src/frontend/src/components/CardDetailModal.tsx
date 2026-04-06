import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Info, Loader2, ShoppingCart, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBuyCard, useMakeOffer } from "../hooks/useQueries";
import {
  formatGrade,
  formatPrice,
  formatRarity,
  getCardImageUrl,
} from "../lib/tcgxUtils";

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

interface CardDetailModalProps {
  open: boolean;
  onClose: () => void;
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
    isListed?: boolean;
    listingPrice?: bigint;
  } | null;
  onLoginRequired?: () => void;
}

export function CardDetailModal({
  open,
  onClose,
  card,
  onLoginRequired,
}: CardDetailModalProps) {
  const { identity } = useInternetIdentity();
  const buyCard = useBuyCard();
  const makeOffer = useMakeOffer();
  const [offerAmount, setOfferAmount] = useState("");
  const [isOffering, setIsOffering] = useState(false);
  const [tab, setTab] = useState<"buy" | "offer">("buy");

  if (!card) return null;

  const imgUrl = getCardImageUrl(card as any);
  const rarityStyle = getRarityBadgeNew(card.rarity);
  const price = card.listingPrice;

  const handleBuy = async () => {
    if (!identity) {
      onLoginRequired?.();
      return;
    }
    try {
      await buyCard.mutateAsync(card.id);
      toast.success(`${card.name} purchased successfully!`);
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Purchase failed. Please try again.");
    }
  };

  const handleMakeOffer = async () => {
    if (!identity) {
      onLoginRequired?.();
      return;
    }
    const priceNum = Number.parseFloat(offerAmount);
    if (!priceNum || priceNum <= 0) {
      toast.error("Enter a valid offer amount");
      return;
    }
    setIsOffering(true);
    try {
      const offerPrice = BigInt(Math.round(priceNum * 100));
      await makeOffer.mutateAsync({ cardId: card.id, offerPrice });
      toast.success("Offer submitted successfully!");
      setOfferAmount("");
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Offer failed. Please try again.");
    } finally {
      setIsOffering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border shadow-card-hover max-w-2xl w-full p-0 overflow-hidden rounded-2xl"
        data-ocid="card_detail.dialog"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image panel */}
          <div className="relative bg-muted flex items-center justify-center p-8">
            <div className="absolute inset-0 spotlight-hero opacity-30" />
            <img
              src={imgUrl}
              alt={card.name}
              className="relative w-56 h-80 object-cover rounded-xl shadow-card-hover"
            />
          </div>

          {/* Info panel */}
          <div className="p-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="card_detail.close_button"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="font-display font-bold text-2xl text-foreground leading-tight">
                  {card.name}
                </h2>
                <span
                  className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded border flex-shrink-0 mt-1 font-sans ${rarityStyle}`}
                >
                  {formatRarity(card.rarity)}
                </span>
              </div>
              <p className="text-sm font-sans text-muted-foreground">
                {card.setName} &middot; #{card.cardNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-xl p-3 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-sans">
                  Grade
                </p>
                <p className="text-sm font-bold font-sans text-teal">
                  {formatGrade(card.grade)}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3 border border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-sans">
                  Grader
                </p>
                <p className="text-sm font-semibold font-sans text-foreground">
                  {card.grader}
                </p>
              </div>
            </div>

            {card.description && (
              <div className="flex gap-2 text-sm text-muted-foreground bg-muted rounded-xl p-3 border border-border">
                <Info className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                <p className="font-sans">{card.description}</p>
              </div>
            )}

            {card.isListed && price !== undefined ? (
              <div className="mt-auto space-y-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                    Asking Price
                  </p>
                  <p className="font-display font-bold text-xl text-foreground">
                    {formatPrice(price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-none text-xs"
                    onClick={() => setTab(tab === "offer" ? "buy" : "offer")}
                  >
                    <span
                      className={`px-3 py-2 rounded-xl text-xs font-medium font-sans uppercase tracking-wider border transition-colors ${
                        tab === "buy"
                          ? "border-border text-muted-foreground hover:border-foreground/30"
                          : "border-teal/60 text-teal bg-teal/5"
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5 inline mr-1" />
                      Make Offer
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuy}
                    disabled={buyCard.isPending}
                    className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-wider hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    data-ocid="card_detail.buy.primary_button"
                  >
                    {buyCard.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Buying…
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Buy Now
                      </>
                    )}
                  </button>
                </div>

                {tab === "offer" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Offer in ckUSDC"
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-teal/50"
                        data-ocid="card_detail.offer.input"
                      />
                      <button
                        type="button"
                        onClick={handleMakeOffer}
                        disabled={isOffering || makeOffer.isPending}
                        className="flex-shrink-0 px-4 py-2 rounded-xl border border-teal/40 text-teal text-xs font-semibold font-sans uppercase tracking-wider hover:bg-teal hover:text-white transition-colors disabled:opacity-50"
                        data-ocid="card_detail.offer.submit_button"
                      >
                        {isOffering || makeOffer.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-auto p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs text-muted-foreground text-center font-sans">
                  This card is not currently listed for sale.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

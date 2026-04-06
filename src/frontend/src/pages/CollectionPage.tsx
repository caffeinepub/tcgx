import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Gift,
  Loader2,
  Package,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CardDetailModal } from "../components/CardDetailModal";
import { CardSlab } from "../components/CardSlab";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDelistCard, useListCard, useMyCards } from "../hooks/useQueries";
import { MOCK_CARDS } from "../lib/mockData";
import { formatGrade, formatRarity, getCardImageUrl } from "../lib/tcgxUtils";

interface CollectionPageProps {
  onLoginClick: () => void;
}

export function CollectionPage({ onLoginClick }: CollectionPageProps) {
  const { identity } = useInternetIdentity();
  const { data: backendCards, isLoading } = useMyCards();
  const listCard = useListCard();
  const delistCard = useDelistCard();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [listModalCard, setListModalCard] = useState<any>(null);
  const [listPrice, setListPrice] = useState("");
  const [listPriceError, setListPriceError] = useState("");

  if (!identity) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Your Collection
          </h2>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            Sign in to view your phygital card collection.
          </p>
          <button
            type="button"
            onClick={onLoginClick}
            className="px-8 py-3 rounded-2xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-widest hover:opacity-85 transition-opacity"
            data-ocid="collection.login.primary_button"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const rawCards =
    backendCards && backendCards.length > 0
      ? backendCards.map((c) => ({
          ...c,
          imageUrl: getCardImageUrl(c as any),
        }))
      : MOCK_CARDS;

  const handleListForSale = async () => {
    if (!listModalCard) return;
    const price = Number.parseFloat(listPrice);
    if (!price || price <= 0) {
      setListPriceError("Enter a valid price");
      return;
    }
    setListPriceError("");
    try {
      const priceCents = BigInt(Math.round(price * 100));
      await listCard.mutateAsync({
        cardId: listModalCard.id,
        price: priceCents,
      });
      toast.success(`${listModalCard.name} listed for ${price} ckUSDC`);
      setListModalCard(null);
      setListPrice("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to list card");
    }
  };

  const handleDelist = async (cardId: bigint, cardName: string) => {
    try {
      await delistCard.mutateAsync(cardId);
      toast.success(`${cardName} removed from marketplace`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delist card");
    }
  };

  const totalValue = rawCards.reduce(
    (sum, c) => sum + Number((c as any).listingPrice ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-2 font-semibold font-sans">
              Your Vault
            </p>
            <h1 className="font-display font-bold text-4xl text-foreground mb-6">
              My Collection
            </h1>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Cards Owned",
                  value: rawCards.length.toString(),
                  icon: Package,
                },
                {
                  label: "Listed",
                  value: rawCards
                    .filter((c) => (c as any).isListed)
                    .length.toString(),
                  icon: Tag,
                },
                {
                  label: "Est. Value",
                  value: `${(totalValue / 100).toFixed(0)} ckUSDC`,
                  icon: TrendingUp,
                },
                {
                  label: "Sets",
                  value: new Set(
                    rawCards.map((c) => c.setName),
                  ).size.toString(),
                  icon: BarChart3,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl teal-gradient flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Cards */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            data-ocid="collection.loading_state"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Skeleton key={`skel-${n}`} className="w-full h-72 rounded-2xl" />
            ))}
          </div>
        ) : rawCards.length === 0 ? (
          <div className="text-center py-24" data-ocid="collection.empty_state">
            <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-sans text-muted-foreground mb-2">
              Your collection is empty.
            </p>
            <p className="text-sm font-sans text-muted-foreground/60 mb-6">
              Open a pack from the store to start collecting!
            </p>
            <Link
              to="/store"
              className="px-6 py-2.5 rounded-2xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-wider hover:opacity-85 transition-opacity"
            >
              Open Packs
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            data-ocid="collection.cards.list"
          >
            {rawCards.map((card, i) => (
              <motion.div
                key={String(card.id)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col gap-2"
                data-ocid={`collection.cards.item.${i + 1}`}
              >
                <div className="relative">
                  <CardSlab
                    card={card}
                    size="lg"
                    showFlip
                    onClick={() => setSelectedCard(card)}
                    className="w-full"
                  />
                  {(card as any).isListed && (
                    <div className="absolute top-2 left-2 bg-teal/15 border border-teal/40 rounded-full px-2 py-0.5 text-[9px] text-teal font-semibold font-sans uppercase tracking-wider">
                      Listed
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
                  <p className="text-xs font-semibold font-sans text-foreground truncate">
                    {card.name}
                  </p>
                  <p className="text-[10px] font-sans text-muted-foreground truncate">
                    {card.setName}
                  </p>
                  <p className="text-[10px] text-teal mt-0.5 font-bold font-sans">
                    {formatGrade(card.grade)}
                  </p>

                  <div className="flex gap-1.5 mt-2">
                    {(card as any).isListed ? (
                      <button
                        type="button"
                        onClick={() => handleDelist(card.id, card.name)}
                        disabled={delistCard.isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-destructive/40 text-destructive text-[10px] font-medium font-sans uppercase tracking-wider hover:bg-destructive/5 transition-colors disabled:opacity-50"
                        data-ocid={`collection.cards.delist.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3 h-3" /> Delist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setListModalCard(card)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-teal/40 text-teal text-[10px] font-medium font-sans uppercase tracking-wider hover:bg-teal/5 transition-colors"
                        data-ocid={`collection.cards.list.button.${i + 1}`}
                      >
                        <Tag className="w-3 h-3" /> Sell
                      </button>
                    )}
                    <Link
                      to="/redeem"
                      search={{ card: String(card.id) }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-foreground text-background text-[10px] font-semibold font-sans uppercase tracking-wider hover:opacity-85 transition-opacity"
                      data-ocid={`collection.cards.redeem.button.${i + 1}`}
                    >
                      <Gift className="w-3 h-3" /> Redeem
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* List for sale modal */}
      <Dialog
        open={!!listModalCard}
        onOpenChange={(o) => !o && setListModalCard(null)}
      >
        <DialogContent
          className="bg-card border-border max-w-sm shadow-card-hover rounded-2xl"
          data-ocid="collection.list.dialog"
        >
          <h3 className="font-display font-bold text-xl text-foreground mb-4">
            List for Sale
          </h3>
          {listModalCard && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-xl border border-border">
              <img
                src={
                  typeof listModalCard.imageUrl === "string"
                    ? listModalCard.imageUrl
                    : ""
                }
                alt={listModalCard.name}
                className="w-12 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="text-sm font-semibold font-sans text-foreground">
                  {listModalCard.name}
                </p>
                <p className="text-xs font-sans text-muted-foreground">
                  {formatGrade(listModalCard.grade)} &middot;{" "}
                  {formatRarity(listModalCard.rarity)}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <label
              htmlFor="list-price-input"
              className="text-xs uppercase tracking-wider font-sans text-muted-foreground"
            >
              Listing Price (ckUSDC)
            </label>
            <Input
              id="list-price-input"
              type="number"
              placeholder="e.g. 150.00"
              value={listPrice}
              onChange={(e) => {
                setListPrice(e.target.value);
                setListPriceError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleListForSale()}
              className="bg-muted border-border text-foreground focus:border-teal/50"
              data-ocid="collection.list.price.input"
            />
            {listPriceError && (
              <p
                className="text-xs font-sans text-destructive"
                data-ocid="collection.list.price_error"
              >
                {listPriceError}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setListModalCard(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground font-sans text-sm hover:text-foreground hover:border-foreground/20 transition-colors"
                data-ocid="collection.list.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleListForSale}
                disabled={listCard.isPending}
                className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-wider hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                data-ocid="collection.list.confirm_button"
              >
                {listCard.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Listing…
                  </>
                ) : (
                  "List Card"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            open={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            card={selectedCard}
            onLoginRequired={onLoginClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

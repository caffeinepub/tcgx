import { Package, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Card } from "../backend.d";
import { PackCard } from "../components/PackCard";
import { PackOpenModal } from "../components/PackOpenModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOpenPack, usePurchasePack } from "../hooks/useQueries";
import { MOCK_CARDS, PACK_TIERS } from "../lib/mockData";
import type { MockCard } from "../lib/mockData";

interface StorePageProps {
  onLoginClick: () => void;
}

export function StorePage({ onLoginClick }: StorePageProps) {
  const { identity } = useInternetIdentity();
  const purchasePack = usePurchasePack();
  const openPack = useOpenPack();
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [packName, setPackName] = useState("");
  const [revealedCards, setRevealedCards] = useState<Array<
    Card | MockCard
  > | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const handlePurchase = async (tier: (typeof PACK_TIERS)[0]) => {
    if (!identity) {
      onLoginClick();
      return;
    }

    setPackName(tier.name);
    setRevealedCards(null);
    setIsOpening(true);
    setPackModalOpen(true);

    try {
      const packId = await purchasePack.mutateAsync(tier.tierName);
      const cards = await openPack.mutateAsync(packId);
      setRevealedCards(cards as Array<Card>);
    } catch {
      const shuffled = [...MOCK_CARDS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      setRevealedCards(shuffled);
      toast.info("Demo mode: showing sample pack contents");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-3 font-semibold font-sans">
              Provably Fair Pulls
            </p>
            <h1 className="font-display font-bold text-5xl text-foreground mb-4">
              Pack Store
            </h1>
            <p className="text-muted-foreground font-sans text-base max-w-lg mx-auto">
              Every pack is opened on-chain with verifiable randomness. Each
              card is a unique phygital asset backed by a real, graded physical
              card.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-6 py-16">
        {/* Fairness notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-teal/20 shadow-xs mb-12 max-w-2xl mx-auto"
        >
          <Shield className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold font-sans text-foreground mb-1">
              Provably Fair &amp; Transparent
            </p>
            <p className="text-xs font-sans text-muted-foreground leading-relaxed">
              All pack openings use on-chain randomness via the Internet
              Computer&apos;s native VRF. Odds are displayed exactly as they are
              &mdash; no hidden mechanics.
            </p>
          </div>
        </motion.div>

        {/* Pack tiers */}
        <div
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          data-ocid="store.packs.list"
        >
          {PACK_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2, duration: 0.5 }}
              data-ocid={`store.packs.item.${i + 1}`}
            >
              <PackCard
                tier={tier}
                onPurchase={() => handlePurchase(tier)}
                disabled={purchasePack.isPending || openPack.isPending}
              />
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="font-display font-bold text-2xl text-foreground text-center mb-10">
            How Pack Opening Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Purchase Pack",
                desc: "Pay in ckUSDC. Transaction recorded on-chain instantly.",
              },
              {
                step: "2",
                title: "VRF Randomness",
                desc: "ICP\u2019s native randomness selects your cards verifiably.",
              },
              {
                step: "3",
                title: "NFTs Minted",
                desc: "Your unique phygital cards are minted to your wallet.",
              },
              {
                step: "4",
                title: "Redeem Physical",
                desc: "Burn digital token, request physical card shipment.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 bg-card border border-border rounded-2xl shadow-xs"
              >
                <div className="w-10 h-10 rounded-full teal-gradient flex items-center justify-center text-white font-bold text-sm mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-sans text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <PackOpenModal
        open={packModalOpen}
        onClose={() => {
          setPackModalOpen(false);
          setRevealedCards(null);
        }}
        cards={revealedCards}
        packName={packName}
        isOpening={isOpening}
      />
    </div>
  );
}

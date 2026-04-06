import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { CardDetailModal } from "../components/CardDetailModal";
import { CardTile } from "../components/CardSlab";
import { useActiveListings, useAllCards } from "../hooks/useQueries";
import { MOCK_CARDS, MOCK_LISTINGS, RECENT_PULLS } from "../lib/mockData";
import { formatGrade, formatPrice } from "../lib/tcgxUtils";

interface HomePageProps {
  onLoginClick: () => void;
}

export function HomePage({ onLoginClick }: HomePageProps) {
  const { data: backendCards, isLoading } = useAllCards();
  const { data: listings } = useActiveListings();
  const trendingRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<
    (typeof displayCards)[0] | null
  >(null);

  const rawCards = backendCards && backendCards.length > 0 ? backendCards : [];
  const displayCards =
    rawCards.length > 0
      ? rawCards.slice(0, 6).map((c) => ({
          ...c,
          imageUrl:
            typeof c.imageUrl === "object" && c.imageUrl.getDirectURL
              ? c.imageUrl.getDirectURL()
              : (c.imageUrl as unknown as string),
          isListed: c.isListed,
          listingPrice: c.listingPrice,
        }))
      : MOCK_CARDS.slice(0, 6);

  // Use up to 3 cards for the hero fan stack
  const heroCards = displayCards.slice(0, 3);

  const scrollTrending = (dir: "left" | "right") => {
    if (!trendingRef.current) return;
    trendingRef.current.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const getListingPrice = (cardId: bigint): bigint | undefined => {
    const listing = listings?.find((l) => l.cardId === cardId);
    return listing?.price;
  };

  const mockGetListingPrice = (cardId: bigint): bigint | undefined => {
    const mock = MOCK_LISTINGS.find((l) => l.cardId === cardId);
    return mock?.price;
  };

  // Fan positions: back-left, back-right, front-center
  const fanConfig = [
    { rotate: -10, x: -48, y: 12, z: 10 },
    { rotate: 6, x: 36, y: 6, z: 20 },
    { rotate: 0, x: 0, y: 0, z: 30 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-stretch overflow-hidden">
        <div className="absolute inset-0 spotlight-hero" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.10 0.010 30) 1px, transparent 1px), linear-gradient(90deg, oklch(0.10 0.010 30) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 grid lg:grid-cols-2 gap-12 py-24 items-center">
          {/* Left: Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="flex flex-col gap-7"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Fix: use bg-teal/10 — /8 is not a valid Tailwind step */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-teal font-semibold font-sans">
                  Phygital Cards &middot; Built on ICP
                </span>
              </div>
              <h1 className="font-display font-bold leading-[1.0] tracking-[-0.02em]">
                <span className="block text-5xl md:text-6xl lg:text-7xl text-foreground">
                  Own The
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl text-foreground">
                  Rarest <span className="teal-text-gradient">Cards.</span>
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg font-sans text-muted-foreground leading-relaxed max-w-md"
            >
              Instant digital ownership, backed 1:1 by professionally graded
              physical cards. Trade on-chain, redeem in hand.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/marketplace"
                data-ocid="home.marketplace.primary_button"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background text-sm font-semibold font-sans hover:opacity-85 transition-opacity shadow-xs"
              >
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/store"
                data-ocid="home.store.secondary_button"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-foreground text-foreground text-sm font-semibold font-sans hover:bg-foreground hover:text-background transition-colors"
              >
                Open Packs <Package className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex gap-8 pt-4 border-t border-border"
            >
              {[
                { label: "Cards Vaulted", value: "2,847" },
                { label: "Trades Settled", value: "18.4K" },
                { label: "Total Value", value: "$2.1M" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display font-bold text-2xl text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Card fan stack — fixed positioning */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0, 0, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            {/* Relative container sized to hold the fanned cards comfortably */}
            <div className="relative" style={{ width: 320, height: 480 }}>
              {heroCards.map((card, i) => {
                const cfg = fanConfig[i];
                return (
                  <motion.div
                    key={String(card.id)}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.4 + i * 0.12,
                      ease: [0.2, 0, 0, 1],
                    }}
                    style={{
                      position: "absolute",
                      /* Center each card in the 320×480 container */
                      top: "50%",
                      left: "50%",
                      width: 240,
                      height: 360,
                      marginTop: -180,
                      marginLeft: -120,
                      transform: `rotate(${cfg.rotate}deg) translate(${cfg.x}px, ${cfg.y}px)`,
                      zIndex: cfg.z,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-card-hover relative"
                      style={{ cursor: i === 2 ? "pointer" : "default" }}
                      onClick={() =>
                        i === 2 ? setSelectedCard(card) : undefined
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && i === 2
                          ? setSelectedCard(card)
                          : undefined
                      }
                      role={i === 2 ? "button" : undefined}
                      tabIndex={i === 2 ? 0 : undefined}
                      aria-label={i === 2 ? `View ${card.name}` : undefined}
                    >
                      <img
                        src={
                          typeof card.imageUrl === "string"
                            ? card.imageUrl
                            : "/assets/generated/card-charizard-psa10.dim_400x560.png"
                        }
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient overlay always present for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                      {/* Only front card gets label */}
                      {i === 2 && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[10px] text-white/70 font-sans uppercase tracking-wider">
                            {formatGrade(card.grade)}
                          </p>
                          <p className="text-sm text-white font-display font-bold leading-tight">
                            {card.name}
                          </p>
                          {(card as any).listingPrice && (
                            <p className="text-xs text-champagne font-display font-bold mt-1">
                              {formatPrice((card as any).listingPrice)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Pulls Ticker */}
      <div className="bg-muted border-y border-border py-3 overflow-hidden">
        <div className="ticker-content gap-8">
          {[...RECENT_PULLS, ...RECENT_PULLS].map((pull, i) => (
            <div
              key={`${pull.user}-${pull.card}-${i}`}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <span className="text-[10px] font-sans text-muted-foreground">
                <span className="text-teal font-semibold">{pull.user}</span>{" "}
                pulled{" "}
                <span className="text-champagne font-semibold">
                  {pull.card}
                </span>
              </span>
              <span className="text-border">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Cards */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal" />
              Trending Now
            </h2>
            <p className="text-sm font-sans text-muted-foreground mt-1">
              Live from the marketplace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollTrending("left")}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors shadow-xs"
              data-ocid="home.trending.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrending("right")}
              className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors shadow-xs"
              data-ocid="home.trending.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              to="/marketplace"
              className="ml-2 text-xs font-sans text-teal hover:text-teal-dark transition-colors uppercase tracking-wider font-semibold"
              data-ocid="home.trending.link"
            >
              View All
            </Link>
          </div>
        </div>

        <div
          ref={trendingRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
        >
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={`skel-${n}`} className="flex-shrink-0 w-40">
                  <Skeleton className="w-40 h-60 rounded-2xl" />
                  <Skeleton className="w-28 h-3 mt-3 rounded" />
                  <Skeleton className="w-20 h-3 mt-1.5 rounded" />
                </div>
              ))
            : displayCards.map((card, i) => {
                const lp = listings
                  ? getListingPrice(card.id)
                  : mockGetListingPrice(card.id);
                return (
                  <motion.div
                    key={String(card.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                    className="flex-shrink-0 w-44"
                    data-ocid={`home.trending.item.${i + 1}`}
                  >
                    <CardTile
                      card={card}
                      price={lp ?? (card as any).listingPrice}
                      onClick={() => setSelectedCard(card)}
                    />
                  </motion.div>
                );
              })}
        </div>
      </section>

      {/* Pack Store CTA */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-foreground text-background p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 opacity-[0.04] spotlight-hero" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.98 0.002 0) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-5 font-semibold font-sans">
              Ready to start collecting?
            </p>
            <h2 className="font-display font-bold text-5xl text-white mb-5 leading-tight">
              Open Your First Pack
            </h2>
            <p className="text-white/50 text-base font-sans max-w-md mx-auto mb-10">
              Provably fair pulls. On-chain ownership. Physical redemption. The
              future of card collecting is here.
            </p>
            <Link
              to="/store"
              data-ocid="home.cta.primary_button"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-foreground text-sm font-semibold font-sans hover:bg-white/90 transition-colors shadow-xs"
            >
              Browse Pack Store <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            open={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            card={selectedCard as any}
            onLoginRequired={onLoginClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

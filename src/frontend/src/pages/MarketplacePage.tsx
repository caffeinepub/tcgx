import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, Search, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { CardDetailModal } from "../components/CardDetailModal";
import { CardTile } from "../components/CardSlab";
import { useActiveListings, useAllCards } from "../hooks/useQueries";
import { MOCK_CARDS, MOCK_LISTINGS } from "../lib/mockData";
import { formatGrade, formatRarity, getCardImageUrl } from "../lib/tcgxUtils";

interface MarketplacePageProps {
  onLoginClick: () => void;
}

export function MarketplacePage({ onLoginClick }: MarketplacePageProps) {
  const { data: backendCards, isLoading } = useAllCards();
  const { data: listings } = useActiveListings();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const rawCards =
    backendCards && backendCards.length > 0
      ? backendCards.map((c) => ({
          ...c,
          imageUrl: getCardImageUrl(c as any),
          isListed: c.isListed,
          listingPrice:
            c.listingPrice ?? listings?.find((l) => l.cardId === c.id)?.price,
        }))
      : MOCK_CARDS.map((c) => ({
          ...c,
          listingPrice: MOCK_LISTINGS.find((l) => l.cardId === c.id)?.price,
          isListed: MOCK_LISTINGS.some((l) => l.cardId === c.id),
        }));

  const filtered = useMemo(() => {
    let result = rawCards.filter((c) => {
      const searchMatch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.setName.toLowerCase().includes(search.toLowerCase());
      const rarityMatch = rarityFilter === "all" || c.rarity === rarityFilter;
      const gradeMatch = gradeFilter === "all" || c.grade === gradeFilter;
      return searchMatch && rarityMatch && gradeMatch;
    });

    if (sortBy === "price-asc")
      result.sort(
        (a, b) => Number(a.listingPrice ?? 0) - Number(b.listingPrice ?? 0),
      );
    if (sortBy === "price-desc")
      result.sort(
        (a, b) => Number(b.listingPrice ?? 0) - Number(a.listingPrice ?? 0),
      );
    if (sortBy === "grade")
      result.sort((a, b) => a.grade.localeCompare(b.grade));

    return result;
  }, [rawCards, search, rarityFilter, gradeFilter, sortBy]);

  const listedOnly = filtered.filter((c) => c.isListed);

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-3 font-semibold font-sans">
              Live Market
            </p>
            <h1 className="font-display font-bold text-5xl text-foreground mb-3">
              Marketplace
            </h1>
            <p className="text-muted-foreground font-sans text-base">
              {listedOnly.length} cards available &middot; Instant on-chain
              settlement
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-card border border-border rounded-2xl shadow-xs">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 bg-muted border border-border rounded-xl pl-9 pr-3 text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/25 focus:border-teal/50 transition-all"
              data-ocid="marketplace.search_input"
            />
          </div>

          <Select value={rarityFilter} onValueChange={setRarityFilter}>
            <SelectTrigger
              className="w-36 h-9 bg-muted border-border text-sm rounded-xl font-sans"
              data-ocid="marketplace.rarity.select"
            >
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="ultraRare">Ultra Rare</SelectItem>
              <SelectItem value="secretRare">Secret Rare</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger
              className="w-32 h-9 bg-muted border-border text-sm rounded-xl font-sans"
              data-ocid="marketplace.grade.select"
            >
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="psa10">PSA 10</SelectItem>
              <SelectItem value="psa9">PSA 9</SelectItem>
              <SelectItem value="psa8">PSA 8</SelectItem>
              <SelectItem value="bgs10">BGS 10</SelectItem>
              <SelectItem value="bgs95">BGS 9.5</SelectItem>
              <SelectItem value="bgs9">BGS 9</SelectItem>
              <SelectItem value="raw">RAW</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              className="w-40 h-9 bg-muted border-border text-sm rounded-xl font-sans"
              data-ocid="marketplace.sort.select"
            >
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground border border-border hover:border-foreground/30"
              }`}
              data-ocid="marketplace.grid.toggle"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground border border-border hover:border-foreground/30"
              }`}
              data-ocid="marketplace.list.toggle"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <Skeleton
                key={`skel-${n}`}
                className="w-full h-64 rounded-2xl"
                data-ocid="marketplace.loading_state"
              />
            ))}
          </div>
        ) : listedOnly.length === 0 ? (
          <div
            className="text-center py-24"
            data-ocid="marketplace.empty_state"
          >
            <SlidersHorizontal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm font-sans text-muted-foreground">
              No cards match your filters
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRarityFilter("all");
                setGradeFilter("all");
              }}
              className="mt-4 text-xs font-sans text-teal hover:text-teal-dark transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="marketplace.cards.list"
          >
            {listedOnly.map((card, i) => (
              <motion.div
                key={String(card.id)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                data-ocid={`marketplace.cards.item.${i + 1}`}
              >
                <CardTile
                  card={card}
                  price={card.listingPrice}
                  onClick={() => setSelectedCard(card)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3" data-ocid="marketplace.cards.list">
            {listedOnly.map((card, i) => (
              <motion.div
                key={String(card.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl card-premium-hover cursor-pointer"
                onClick={() => setSelectedCard(card)}
                data-ocid={`marketplace.cards.item.${i + 1}`}
              >
                <img
                  src={typeof card.imageUrl === "string" ? card.imageUrl : ""}
                  alt={card.name}
                  className="w-16 h-24 object-cover rounded-xl flex-shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground">
                    {card.name}
                  </p>
                  <p className="text-sm font-sans text-muted-foreground">
                    {card.setName} #{card.cardNumber}
                  </p>
                  <p className="text-xs font-sans text-teal mt-1 font-medium">
                    {formatGrade(card.grade)} &middot;{" "}
                    {formatRarity(card.rarity)}
                  </p>
                </div>
                <div className="text-right">
                  {card.listingPrice && (
                    <p className="font-display font-bold text-sm text-foreground">
                      {(Number(card.listingPrice) / 100).toFixed(2)} ckUSDC
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-4 py-1.5 rounded-xl text-xs font-semibold font-sans uppercase tracking-wider bg-foreground text-background hover:opacity-85 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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

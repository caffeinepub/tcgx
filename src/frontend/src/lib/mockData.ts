import { Grade, Rarity } from "../backend.d";

export interface MockCard {
  id: bigint;
  name: string;
  setName: string;
  cardNumber: string;
  grade: string;
  grader: string;
  rarity: string;
  imageUrl: string;
  description: string;
  owner?: string;
  isListed?: boolean;
  listingPrice?: bigint;
}

export const MOCK_CARDS: MockCard[] = [
  {
    id: 1n,
    name: "Charizard",
    setName: "Base Set",
    cardNumber: "4/102",
    grade: "psa10",
    grader: "PSA",
    rarity: "secretRare",
    imageUrl: "/assets/generated/card-charizard-psa10.dim_400x560.png",
    description:
      "1999 Base Set Charizard Holo — The crown jewel of Pokémon collecting.",
    isListed: true,
    listingPrice: 250000n,
  },
  {
    id: 2n,
    name: "Pikachu",
    setName: "Base Set",
    cardNumber: "58/102",
    grade: "psa9",
    grader: "PSA",
    rarity: "rare",
    imageUrl: "/assets/generated/card-pikachu-psa9.dim_400x560.png",
    description:
      "1999 Base Set Pikachu — The iconic mascot, perfectly preserved.",
    isListed: true,
    listingPrice: 8500n,
  },
  {
    id: 3n,
    name: "Mewtwo",
    setName: "Base Set",
    cardNumber: "10/102",
    grade: "psa10",
    grader: "PSA",
    rarity: "ultraRare",
    imageUrl: "/assets/generated/card-mewtwo-psa10.dim_400x560.png",
    description:
      "1999 Base Set Mewtwo Holo — A perfect specimen of the Psychic legend.",
    isListed: true,
    listingPrice: 45000n,
  },
  {
    id: 4n,
    name: "Blastoise",
    setName: "Base Set",
    cardNumber: "2/102",
    grade: "bgs95",
    grader: "BGS",
    rarity: "rare",
    imageUrl: "/assets/generated/card-blastoise-bgs95.dim_400x560.png",
    description: "1999 Base Set Blastoise Holo — BGS Black Label candidate.",
    isListed: false,
    listingPrice: 18500n,
  },
  {
    id: 5n,
    name: "Venusaur",
    setName: "Base Set",
    cardNumber: "15/102",
    grade: "psa9",
    grader: "PSA",
    rarity: "ultraRare",
    imageUrl: "/assets/generated/card-mewtwo-psa10.dim_400x560.png",
    description:
      "1999 Base Set Venusaur Holo — Completing the starter trifecta.",
    isListed: true,
    listingPrice: 22000n,
  },
  {
    id: 6n,
    name: "Raichu",
    setName: "Base Set",
    cardNumber: "14/102",
    grade: "psa10",
    grader: "PSA",
    rarity: "rare",
    imageUrl: "/assets/generated/card-pikachu-psa9.dim_400x560.png",
    description: "1999 Base Set Raichu — Incredibly rare PSA 10 specimen.",
    isListed: true,
    listingPrice: 35000n,
  },
];

export interface MockListing {
  cardId: bigint;
  price: bigint;
  seller: string;
  isActive: boolean;
}

export const MOCK_LISTINGS: MockListing[] = [
  { cardId: 1n, price: 250000n, seller: "vault.collector", isActive: true },
  { cardId: 2n, price: 8500n, seller: "poke.master", isActive: true },
  { cardId: 3n, price: 45000n, seller: "graded.gems", isActive: true },
  { cardId: 5n, price: 22000n, seller: "base.set.king", isActive: true },
  { cardId: 6n, price: 35000n, seller: "psa10.only", isActive: true },
];

export const PACK_TIERS = [
  {
    name: "Rookie",
    tierName: "Rookie",
    price: 9.99,
    priceCents: 999n,
    cardCount: 5,
    description:
      "Perfect entry point. Discover the thrill of phygital card ownership.",
    imageUrl: "/assets/generated/pack-rookie.dim_300x420.png",
    odds: {
      common: "60%",
      uncommon: "25%",
      rare: "12%",
      ultraRare: "2.5%",
      secretRare: "0.5%",
    },
    color: "from-slate-600 to-slate-800",
    badge: "ENTRY",
  },
  {
    name: "Elite",
    tierName: "Elite",
    price: 24.99,
    priceCents: 2499n,
    cardCount: 5,
    description:
      "Enhanced odds with guaranteed rare pulls. For serious collectors.",
    imageUrl: "/assets/generated/pack-elite.dim_300x420.png",
    odds: {
      common: "30%",
      uncommon: "30%",
      rare: "25%",
      ultraRare: "12%",
      secretRare: "3%",
    },
    color: "from-blue-700 to-blue-900",
    badge: "POPULAR",
    featured: true,
  },
  {
    name: "God Pack",
    tierName: "GodPack",
    price: 99.99,
    priceCents: 9999n,
    cardCount: 5,
    description:
      "Ultra-rare and Secret Rare guaranteed. The ultimate collector's pack.",
    imageUrl: "/assets/generated/pack-godpack.dim_300x420.png",
    odds: {
      common: "0%",
      uncommon: "0%",
      rare: "15%",
      ultraRare: "55%",
      secretRare: "30%",
    },
    color: "from-yellow-700 to-amber-900",
    badge: "LEGENDARY",
  },
];

export const RECENT_PULLS = [
  {
    user: "vault.xyz",
    card: "Charizard PSA 10",
    rarity: "secretRare",
    time: "2m ago",
  },
  {
    user: "poke.master",
    card: "Mewtwo PSA 10",
    rarity: "ultraRare",
    time: "5m ago",
  },
  {
    user: "base.set",
    card: "Blastoise BGS 9.5",
    rarity: "rare",
    time: "8m ago",
  },
  {
    user: "collector.x",
    card: "Pikachu PSA 9",
    rarity: "rare",
    time: "12m ago",
  },
  {
    user: "gem.mint",
    card: "Venusaur PSA 10",
    rarity: "ultraRare",
    time: "15m ago",
  },
  { user: "slab.king", card: "Raichu PSA 10", rarity: "rare", time: "18m ago" },
  {
    user: "card.vault",
    card: "Charizard PSA 9",
    rarity: "secretRare",
    time: "22m ago",
  },
  {
    user: "alpha.pull",
    card: "Mewtwo PSA 9",
    rarity: "ultraRare",
    time: "25m ago",
  },
];

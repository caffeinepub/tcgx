// Utility functions for TCGX
// Note: This file is not the auto-generated lib/utils.ts
// We add TCGX-specific utils here

export function formatPrice(microUsdc: bigint | number): string {
  const amount = typeof microUsdc === "bigint" ? Number(microUsdc) : microUsdc;
  // Assuming price stored in cents (1/100 ckUSDC)
  const dollars = amount / 100;
  return `${dollars.toFixed(2)} ckUSDC`;
}

export function formatPriceLarge(microUsdc: bigint | number): string {
  const amount = typeof microUsdc === "bigint" ? Number(microUsdc) : microUsdc;
  const dollars = amount / 100;
  if (dollars >= 1000) {
    return `${(dollars / 1000).toFixed(1)}K ckUSDC`;
  }
  return `${dollars.toFixed(2)} ckUSDC`;
}

export function formatGrade(grade: string): string {
  const gradeMap: Record<string, string> = {
    psa10: "PSA 10",
    psa9: "PSA 9",
    psa8: "PSA 8",
    psa7: "PSA 7",
    bgs10: "BGS 10",
    bgs95: "BGS 9.5",
    bgs9: "BGS 9",
    bgs85: "BGS 8.5",
    raw: "RAW",
  };
  return gradeMap[grade] ?? grade.toUpperCase();
}

export function formatRarity(rarity: string): string {
  const rarityMap: Record<string, string> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    ultraRare: "Ultra Rare",
    secretRare: "Secret Rare",
  };
  return rarityMap[rarity] ?? rarity;
}

export function getRarityClass(rarity: string): string {
  const classMap: Record<string, string> = {
    common: "rarity-common",
    uncommon: "rarity-uncommon",
    rare: "rarity-rare",
    ultraRare: "rarity-ultra-rare",
    secretRare: "rarity-secret-rare",
  };
  return classMap[rarity] ?? "rarity-common";
}

export function getRarityBadgeStyle(rarity: string): string {
  // Updated for new teal-emerald + champagne palette
  const styles: Record<string, string> = {
    common: "bg-muted text-muted-foreground border-border",
    uncommon: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rare: "bg-blue-50 text-blue-700 border-blue-200",
    ultraRare: "bg-violet-50 text-violet-700 border-violet-200",
    secretRare: "border-champagne/60 text-champagne bg-champagne/10",
  };
  return styles[rarity] ?? styles.common;
}

export function truncatePrincipal(principal: string): string {
  if (!principal || principal.length < 10) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
}

export function formatTimeAgo(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp / 1_000_000n) : timestamp;
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function getCardImageUrl(card: {
  imageUrl?: { getDirectURL?: () => string } | string;
}): string {
  if (!card.imageUrl)
    return "/assets/generated/card-charizard-psa10.dim_400x560.png";
  if (typeof card.imageUrl === "string") return card.imageUrl;
  if (typeof card.imageUrl === "object" && card.imageUrl.getDirectURL) {
    return card.imageUrl.getDirectURL();
  }
  return "/assets/generated/card-charizard-psa10.dim_400x560.png";
}

export function triggerConfetti() {
  // Use teal and champagne colors for the new brand palette
  const colors = ["#4DB8A4", "#D4AF78", "#F5F0EA", "#60a5fa", "#a78bfa"];
  const pieces = 80;
  const container = document.body;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const size = Math.random() * 10 + 5;
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -20px;
      width: ${size}px;
      height: ${size}px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration: ${Math.random() * 2 + 2}s;
      animation-delay: ${Math.random() * 1}s;
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

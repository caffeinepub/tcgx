import { Input } from "@/components/ui/input";
import { Calendar, Loader2, Shield, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDepositBalance,
  useMyBalance,
  useMyCards,
  useMyProfile,
} from "../hooks/useQueries";
import { MOCK_CARDS } from "../lib/mockData";
import { formatGrade, formatPrice } from "../lib/tcgxUtils";

interface ProfilePageProps {
  onLoginClick: () => void;
}

export function ProfilePage({ onLoginClick }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const { data: balance, isLoading: isBalanceLoading } = useMyBalance();
  const { data: myCards } = useMyCards();
  const depositBalance = useDepositBalance();
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  if (!identity) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Your Profile
          </h2>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            Sign in to view your profile.
          </p>
          <button
            type="button"
            onClick={onLoginClick}
            className="px-8 py-3 rounded-2xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-widest hover:opacity-85 transition-opacity"
            data-ocid="profile.login.primary_button"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const displayCards = myCards && myCards.length > 0 ? myCards : MOCK_CARDS;

  const handleDeposit = async () => {
    const amount = Number.parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsDepositing(true);
    try {
      const amountCents = BigInt(Math.round(amount * 100));
      await depositBalance.mutateAsync(amountCents);
      toast.success(`${amount} ckUSDC deposited to your account!`);
      setDepositAmount("");
    } catch {
      toast.info("Demo mode: balance deposit simulated.");
    } finally {
      setIsDepositing(false);
    }
  };

  const principal = identity.getPrincipal().toString();
  const shortPrincipal = `${principal.slice(0, 10)}...${principal.slice(-5)}`;

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-2 font-semibold font-sans">
              Your Account
            </p>
            <h1 className="font-display font-bold text-4xl text-foreground">
              Profile
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Identity card */}
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-xs">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl teal-gradient flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                {isProfileLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {profile?.username ?? "Anonymous"}
                    </h2>
                    <p className="text-xs font-sans text-muted-foreground mt-1">
                      {shortPrincipal}
                    </p>
                    {profile?.joined && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[10px] font-sans text-muted-foreground">
                          Joined{" "}
                          {new Date(
                            Number(profile.joined) / 1_000_000,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Cards Owned",
                  value: displayCards.length.toString(),
                  icon: Shield,
                },
                {
                  label: "Balance",
                  value: isBalanceLoading ? "..." : formatPrice(balance ?? 0n),
                  icon: TrendingUp,
                },
                { label: "Network", value: "ICP", icon: Shield },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-muted rounded-xl p-3 border border-border"
                >
                  <p className="font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Balance / deposit */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
            <h3 className="font-display font-bold text-sm text-foreground mb-4 uppercase tracking-wider">
              ckUSDC Balance
            </h3>

            <div className="text-center py-6 border border-teal/20 rounded-xl bg-teal/5 mb-4">
              <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground mb-1">
                Available
              </p>
              <p className="font-display font-bold text-2xl text-foreground">
                {isBalanceLoading ? "..." : formatPrice(balance ?? 0n)}
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="deposit-amount-input"
                className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground"
              >
                Test Deposit
              </label>
              <Input
                id="deposit-amount-input"
                type="number"
                placeholder="Amount in ckUSDC"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-muted border-border text-foreground focus:border-teal/50"
                data-ocid="profile.deposit.input"
              />
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isDepositing || depositBalance.isPending}
                className="w-full py-2.5 rounded-xl teal-gradient text-white text-xs font-semibold font-sans uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                data-ocid="profile.deposit.submit_button"
              >
                {isDepositing || depositBalance.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                  </>
                ) : (
                  "Add Funds"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Recent cards */}
        <div className="mt-10">
          <h2 className="font-display font-bold text-xl text-foreground mb-5">
            Recent Acquisitions
          </h2>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            data-ocid="profile.cards.list"
          >
            {displayCards.slice(0, 4).map((card, i) => (
              <div
                key={String(card.id)}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs card-premium-hover"
                data-ocid={`profile.cards.item.${i + 1}`}
              >
                <div className="aspect-[2/3] overflow-hidden bg-muted">
                  <img
                    src={typeof card.imageUrl === "string" ? card.imageUrl : ""}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold font-sans text-foreground truncate">
                    {card.name}
                  </p>
                  <p className="text-[10px] font-sans text-teal font-bold">
                    {formatGrade(card.grade)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

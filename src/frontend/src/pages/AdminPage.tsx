import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Plus,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllCards,
  useAllRedemptions,
  useIsAdmin,
  useMintCard,
  usePlatformStats,
  useUpdateRedemptionStatus,
} from "../hooks/useQueries";
import { formatGrade, formatRarity } from "../lib/tcgxUtils";

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: allCards, isLoading: cardsLoading } = useAllCards();
  const { data: allRedemptions, isLoading: redemptionsLoading } =
    useAllRedemptions();
  const { data: stats } = usePlatformStats();
  const mintCard = useMintCard();
  const updateStatus = useUpdateRedemptionStatus();

  const [mintForm, setMintForm] = useState({
    name: "",
    setName: "",
    cardNumber: "",
    description: "",
    grade: "psa10",
    grader: "PSA",
    rarity: "rare",
  });
  const [mintErrors, setMintErrors] = useState<Record<string, string>>({});

  if (!identity) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Admin Panel
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            Authentication required.
          </p>
        </div>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive/50 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground font-sans text-sm">
            You don&apos;t have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  const validateMint = () => {
    const e: Record<string, string> = {};
    if (!mintForm.name.trim()) e.name = "Name required";
    if (!mintForm.setName.trim()) e.setName = "Set name required";
    if (!mintForm.cardNumber.trim()) e.cardNumber = "Card number required";
    return e;
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMint();
    if (Object.keys(errs).length) {
      setMintErrors(errs);
      return;
    }
    setMintErrors({});
    try {
      await mintCard.mutateAsync(mintForm);
      toast.success(`${mintForm.name} minted successfully!`);
      setMintForm({
        name: "",
        setName: "",
        cardNumber: "",
        description: "",
        grade: "psa10",
        grader: "PSA",
        rarity: "rare",
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Mint failed");
    }
  };

  const handleStatusUpdate = async (
    redemptionId: bigint,
    statusKind: string,
    trackingNumber?: string,
  ) => {
    let status: any;
    if (statusKind === "shipped")
      status = { __kind__: "shipped", shipped: trackingNumber ?? "" };
    else if (statusKind === "processing")
      status = { __kind__: "processing", processing: null };
    else if (statusKind === "delivered")
      status = { __kind__: "delivered", delivered: null };
    else status = { __kind__: "pending", pending: null };
    try {
      await updateStatus.mutateAsync({ redemptionId, status });
      toast.success("Status updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-teal font-semibold font-sans">
                  Admin
                </span>
              </div>
            </div>
            <h1 className="font-display font-bold text-4xl text-foreground">
              Admin Panel
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { label: "Total Cards", value: String(stats.totalCards) },
              { label: "Active Listings", value: String(stats.activeListings) },
              {
                label: "Pending Redemptions",
                value: String(stats.pendingRedemptions),
              },
              { label: "Total Users", value: String(stats.totalUsers) },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs"
              >
                <p className="font-display font-bold text-2xl text-foreground">
                  {s.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="mint" data-ocid="admin.tabs">
          <TabsList className="bg-muted border border-border rounded-xl p-1 mb-8 h-auto">
            <TabsTrigger
              value="mint"
              className="rounded-lg font-sans data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-ocid="admin.mint.tab"
            >
              Mint Card
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="rounded-lg font-sans data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-ocid="admin.inventory.tab"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="redemptions"
              className="rounded-lg font-sans data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-ocid="admin.redemptions.tab"
            >
              Redemptions
            </TabsTrigger>
          </TabsList>

          {/* Mint new card */}
          <TabsContent value="mint">
            <div className="max-w-2xl">
              <form
                onSubmit={handleMint}
                className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xs"
                data-ocid="admin.mint.form"
              >
                <h3 className="font-display font-bold text-xl text-foreground">
                  Mint New Phygital Card
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-card-name"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Card Name
                    </label>
                    <Input
                      id="admin-card-name"
                      value={mintForm.name}
                      onChange={(e) =>
                        setMintForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Charizard"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="admin.mint.name.input"
                    />
                    {mintErrors.name && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="admin.mint.name_error"
                      >
                        {mintErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="admin-set-name"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Set Name
                    </label>
                    <Input
                      id="admin-set-name"
                      value={mintForm.setName}
                      onChange={(e) =>
                        setMintForm((f) => ({ ...f, setName: e.target.value }))
                      }
                      placeholder="Base Set"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="admin.mint.setname.input"
                    />
                    {mintErrors.setName && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="admin.mint.setname_error"
                      >
                        {mintErrors.setName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-card-number"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Card Number
                    </label>
                    <Input
                      id="admin-card-number"
                      value={mintForm.cardNumber}
                      onChange={(e) =>
                        setMintForm((f) => ({
                          ...f,
                          cardNumber: e.target.value,
                        }))
                      }
                      placeholder="4/102"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="admin.mint.cardnumber.input"
                    />
                    {mintErrors.cardNumber && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="admin.mint.cardnumber_error"
                      >
                        {mintErrors.cardNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="admin-grader"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Grader
                    </label>
                    <Input
                      id="admin-grader"
                      value={mintForm.grader}
                      onChange={(e) =>
                        setMintForm((f) => ({ ...f, grader: e.target.value }))
                      }
                      placeholder="PSA"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="admin.mint.grader.input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="admin-grade"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Grade
                    </label>
                    <Select
                      value={mintForm.grade}
                      onValueChange={(v) =>
                        setMintForm((f) => ({ ...f, grade: v }))
                      }
                    >
                      <SelectTrigger
                        className="bg-muted border-border font-sans"
                        data-ocid="admin.mint.grade.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="psa10">PSA 10</SelectItem>
                        <SelectItem value="psa9">PSA 9</SelectItem>
                        <SelectItem value="psa8">PSA 8</SelectItem>
                        <SelectItem value="psa7">PSA 7</SelectItem>
                        <SelectItem value="bgs10">BGS 10</SelectItem>
                        <SelectItem value="bgs95">BGS 9.5</SelectItem>
                        <SelectItem value="bgs9">BGS 9</SelectItem>
                        <SelectItem value="bgs85">BGS 8.5</SelectItem>
                        <SelectItem value="raw">RAW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label
                      htmlFor="admin-rarity"
                      className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Rarity
                    </label>
                    <Select
                      value={mintForm.rarity}
                      onValueChange={(v) =>
                        setMintForm((f) => ({ ...f, rarity: v }))
                      }
                    >
                      <SelectTrigger
                        className="bg-muted border-border font-sans"
                        data-ocid="admin.mint.rarity.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="ultraRare">Ultra Rare</SelectItem>
                        <SelectItem value="secretRare">Secret Rare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="admin-description"
                    className="text-[10px] uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                  >
                    Description
                  </label>
                  <Textarea
                    id="admin-description"
                    value={mintForm.description}
                    onChange={(e) =>
                      setMintForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="1999 Base Set Charizard Holo..."
                    className="bg-muted border-border text-foreground focus:border-teal/50 resize-none font-sans"
                    rows={3}
                    data-ocid="admin.mint.description.textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mintCard.isPending}
                  className="w-full py-3 rounded-xl teal-gradient text-white text-sm font-semibold font-sans uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  data-ocid="admin.mint.submit_button"
                >
                  {mintCard.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Minting…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Mint Card
                    </>
                  )}
                </button>
              </form>
            </div>
          </TabsContent>

          {/* Card inventory */}
          <TabsContent value="inventory">
            {cardsLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.inventory.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-teal" />
              </div>
            ) : !allCards || allCards.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="admin.inventory.empty_state"
              >
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-sans">
                  No cards minted yet.
                </p>
              </div>
            ) : (
              <div
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs"
                data-ocid="admin.inventory.table"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left p-4 text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                        Card
                      </th>
                      <th className="text-left p-4 text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                        Set
                      </th>
                      <th className="text-left p-4 text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                        Grade
                      </th>
                      <th className="text-left p-4 text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                        Rarity
                      </th>
                      <th className="text-left p-4 text-[10px] uppercase tracking-wider font-sans text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCards.map((card, i) => (
                      <tr
                        key={String(card.id)}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                        data-ocid={`admin.inventory.row.item.${i + 1}`}
                      >
                        <td className="p-4 font-sans text-sm font-semibold text-foreground">
                          {card.name}
                        </td>
                        <td className="p-4 font-sans text-sm text-muted-foreground">
                          {card.setName} #{card.cardNumber}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold font-sans text-teal">
                            {formatGrade(
                              typeof card.grade === "string"
                                ? card.grade
                                : String(card.grade),
                            )}
                          </span>
                        </td>
                        <td className="p-4 font-sans text-xs text-muted-foreground">
                          {formatRarity(
                            typeof card.rarity === "string"
                              ? card.rarity
                              : String(card.rarity),
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded-full border font-sans font-semibold ${
                              card.isListed
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {card.isListed ? "Listed" : "Vault"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Redemptions queue */}
          <TabsContent value="redemptions">
            {redemptionsLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="admin.redemptions.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-teal" />
              </div>
            ) : !allRedemptions || allRedemptions.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="admin.redemptions.empty_state"
              >
                <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-sans">
                  No redemption requests pending.
                </p>
              </div>
            ) : (
              <div className="space-y-4" data-ocid="admin.redemptions.list">
                {allRedemptions.map((r, i) => (
                  <div
                    key={`rd-${String(r.cardId)}`}
                    className="bg-card border border-border rounded-2xl p-5 shadow-xs"
                    data-ocid={`admin.redemptions.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold font-sans text-foreground">
                          Card #{String(r.cardId)}
                        </p>
                        <p className="text-xs font-sans text-muted-foreground mt-0.5">
                          {r.shippingAddress.name} &middot;{" "}
                          {r.shippingAddress.addressLine1},{" "}
                          {r.shippingAddress.city}
                        </p>
                        <p className="text-xs font-sans text-muted-foreground">
                          {r.shippingAddress.country}{" "}
                          {r.shippingAddress.postalCode}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold font-sans ${
                          r.status.__kind__ === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : r.status.__kind__ === "processing"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : r.status.__kind__ === "shipped"
                                ? "bg-violet-50 text-violet-700 border-violet-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {r.status.__kind__}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {r.status.__kind__ === "pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(r.cardId, "processing")
                          }
                          className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold font-sans bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          data-ocid={`admin.redemptions.processing.button.${i + 1}`}
                        >
                          Mark Processing
                        </button>
                      )}
                      {r.status.__kind__ === "processing" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(r.cardId, "shipped", "TRACK123")
                          }
                          className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold font-sans bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
                          data-ocid={`admin.redemptions.shipped.button.${i + 1}`}
                        >
                          Mark Shipped
                        </button>
                      )}
                      {r.status.__kind__ === "shipped" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(r.cardId, "delivered")
                          }
                          className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-semibold font-sans bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          data-ocid={`admin.redemptions.delivered.button.${i + 1}`}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

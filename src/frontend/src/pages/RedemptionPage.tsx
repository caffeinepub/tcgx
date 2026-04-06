import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyRedemptions, useRequestRedemption } from "../hooks/useQueries";
import { MOCK_CARDS } from "../lib/mockData";

interface RedemptionPageProps {
  onLoginClick: () => void;
}

export function RedemptionPage({ onLoginClick }: RedemptionPageProps) {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const cardIdParam = new URLSearchParams(searchStr).get("card");
  const requestRedemption = useRequestRedemption();
  const { data: redemptions } = useMyRedemptions();

  const [form, setForm] = useState({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedCard = cardIdParam
    ? MOCK_CARDS.find((c) => String(c.id) === cardIdParam)
    : null;

  if (!identity) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Redeem Physical Card
          </h2>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            Sign in to redeem your physical cards.
          </p>
          <button
            type="button"
            onClick={onLoginClick}
            className="px-8 py-3 rounded-2xl bg-foreground text-background text-sm font-semibold font-sans uppercase tracking-widest hover:opacity-85 transition-opacity"
            data-ocid="redeem.login.primary_button"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.addressLine1.trim()) e.addressLine1 = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.postalCode.trim()) e.postalCode = "Postal code is required";
    if (!form.country.trim()) e.country = "Country is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const cardId = BigInt(cardIdParam ?? "1");
    try {
      await requestRedemption.mutateAsync({ cardId, shippingAddress: form });
      setSubmitted(true);
      toast.success("Redemption request submitted!");
    } catch {
      setSubmitted(true);
      toast.info("Demo mode: Redemption request simulated.");
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "pending")
      return <Clock className="w-4 h-4 text-yellow-600" />;
    if (status === "processing")
      return <Package className="w-4 h-4 text-blue-600" />;
    if (status === "shipped")
      return <Truck className="w-4 h-4 text-violet-600" />;
    if (status === "delivered")
      return <CheckCircle className="w-4 h-4 text-teal" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending Review",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
    };
    return labels[status] ?? status;
  };

  const getStatusPill = (status: string) => {
    const pills: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      processing: "bg-blue-50 text-blue-700 border border-blue-200",
      shipped: "bg-violet-50 text-violet-700 border border-violet-200",
      delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return (
      pills[status] ?? "bg-muted text-muted-foreground border border-border"
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Page Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              type="button"
              onClick={() => navigate({ to: "/collection" })}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Collection
            </button>
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-2 font-semibold font-sans">
              Physical Delivery
            </p>
            <h1 className="font-display font-bold text-4xl text-foreground">
              Redeem Card
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {selectedCard && (
          <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl mb-8 shadow-xs">
            <img
              src={
                typeof selectedCard.imageUrl === "string"
                  ? selectedCard.imageUrl
                  : ""
              }
              alt={selectedCard.name}
              className="w-16 h-24 object-cover rounded-xl"
            />
            <div>
              <p className="font-display font-bold text-foreground">
                {selectedCard.name}
              </p>
              <p className="text-sm font-sans text-muted-foreground">
                {selectedCard.setName} #{selectedCard.cardNumber}
              </p>
              <p className="text-xs font-sans text-teal mt-1 font-bold">
                {selectedCard.grade.toUpperCase()} grade
              </p>
            </div>
            <div className="ml-auto text-xs font-sans text-muted-foreground text-right">
              <p>Burning digital token</p>
              <p>to claim physical card</p>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          {["Select Card", "Shipping Details", "Confirm"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans ${
                    i === 1
                      ? "teal-gradient text-white"
                      : i < 1
                        ? "bg-foreground text-background"
                        : "bg-muted border border-border text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs font-sans ${
                    i === 1
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
            data-ocid="redeem.success_state"
          >
            <div className="w-20 h-20 rounded-full teal-gradient flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">
              Request Submitted!
            </h2>
            <p className="text-muted-foreground font-sans text-sm mb-8 max-w-sm mx-auto">
              Your physical card will be shipped within 3-5 business days. Track
              your shipment in the redemption history below.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-sans text-teal hover:text-teal-dark transition-colors"
            >
              Submit another request
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            data-ocid="redeem.form"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <h3 className="font-display font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal" /> Shipping Address
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="redeem-name"
                    className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                  >
                    Full Name
                  </label>
                  <Input
                    id="redeem-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="John Smith"
                    className="bg-muted border-border text-foreground focus:border-teal/50"
                    data-ocid="redeem.name.input"
                  />
                  {errors.name && (
                    <p
                      className="text-xs font-sans text-destructive mt-1"
                      data-ocid="redeem.name_error"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="redeem-address1"
                    className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                  >
                    Address Line 1
                  </label>
                  <Input
                    id="redeem-address1"
                    value={form.addressLine1}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, addressLine1: e.target.value }))
                    }
                    placeholder="123 Main Street"
                    className="bg-muted border-border text-foreground focus:border-teal/50"
                    data-ocid="redeem.address1.input"
                  />
                  {errors.addressLine1 && (
                    <p
                      className="text-xs font-sans text-destructive mt-1"
                      data-ocid="redeem.address1_error"
                    >
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="redeem-address2"
                    className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <Input
                    id="redeem-address2"
                    value={form.addressLine2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, addressLine2: e.target.value }))
                    }
                    placeholder="Apt, Suite, Unit"
                    className="bg-muted border-border text-foreground focus:border-teal/50"
                    data-ocid="redeem.address2.input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="redeem-city"
                      className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      City
                    </label>
                    <Input
                      id="redeem-city"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                      placeholder="New York"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="redeem.city.input"
                    />
                    {errors.city && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="redeem.city_error"
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="redeem-state"
                      className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      State / Province
                    </label>
                    <Input
                      id="redeem-state"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      placeholder="NY"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="redeem.state.input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="redeem-postal"
                      className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Postal Code
                    </label>
                    <Input
                      id="redeem-postal"
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, postalCode: e.target.value }))
                      }
                      placeholder="10001"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="redeem.postal.input"
                    />
                    {errors.postalCode && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="redeem.postal_error"
                      >
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="redeem-country"
                      className="text-xs uppercase tracking-wider font-sans text-muted-foreground block mb-1.5"
                    >
                      Country
                    </label>
                    <Input
                      id="redeem-country"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                      placeholder="United States"
                      className="bg-muted border-border text-foreground focus:border-teal/50"
                      data-ocid="redeem.country.input"
                    />
                    {errors.country && (
                      <p
                        className="text-xs font-sans text-destructive mt-1"
                        data-ocid="redeem.country_error"
                      >
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={requestRedemption.isPending}
              className="w-full py-4 rounded-2xl bg-foreground text-background font-semibold font-sans text-sm uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              data-ocid="redeem.submit_button"
            >
              {requestRedemption.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" /> Submit Redemption Request
                </>
              )}
            </button>

            <p className="text-xs font-sans text-muted-foreground/60 text-center">
              By submitting, your digital token will be burned and you&apos;ll
              receive the physical card. This action is irreversible.
            </p>
          </form>
        )}

        {redemptions && redemptions.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-xl text-foreground mb-6">
              Redemption History
            </h2>
            <div className="space-y-3" data-ocid="redeem.history.list">
              {redemptions.map((r, i) => (
                <div
                  key={`r-${String(r.cardId)}-${r.shippingAddress.city}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-xs"
                  data-ocid={`redeem.history.item.${i + 1}`}
                >
                  {getStatusIcon(r.status.__kind__)}
                  <div className="flex-1">
                    <p className="text-sm font-sans text-foreground font-medium">
                      Card #{String(r.cardId)}
                    </p>
                    <p className="text-xs font-sans text-muted-foreground">
                      {r.shippingAddress.city}, {r.shippingAddress.country}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold font-sans px-2 py-1 rounded-full ${getStatusPill(r.status.__kind__)}`}
                  >
                    {getStatusLabel(r.status.__kind__)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

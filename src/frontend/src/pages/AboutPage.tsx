import { Info, Package, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-muted to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-teal mb-3 font-semibold font-sans">
              The Platform
            </p>
            <h1 className="font-display font-bold text-5xl text-foreground mb-5">
              About TCGX
            </h1>
            <p className="text-muted-foreground font-sans text-base max-w-2xl mx-auto leading-relaxed">
              TCGX is the premier phygital trading card marketplace built
              entirely on the Internet Computer Protocol (ICP). Every digital
              card is a unique on-chain asset, 1:1 backed by a real,
              professionally graded physical trading card.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Shield,
              title: "True On-Chain Ownership",
              desc: "Your cards are stored on the Internet Computer blockchain. No centralized servers, no intermediaries. You own your assets permanently.",
              accent: "teal",
            },
            {
              icon: Zap,
              title: "Instant Settlement",
              desc: "All trades settle instantly on-chain using ckUSDC. No waiting for confirmations, no gas wars, no bridge risks.",
              accent: "teal",
            },
            {
              icon: Package,
              title: "Physical Redemption",
              desc: "Every digital card can be redeemed for the actual physical card. Your digital token is burned and we ship you the real slab.",
              accent: "champagne",
            },
            {
              icon: Info,
              title: "Provably Fair Pulls",
              desc: "Pack openings use ICP\u2019s native verifiable randomness. Every pull is transparent, auditable, and fair by design.",
              accent: "champagne",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-7 shadow-xs card-premium-hover"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                  item.accent === "champagne"
                    ? "champagne-gradient"
                    : "teal-gradient"
                }`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="font-display font-bold text-3xl text-foreground mb-10 text-center">
            How It Works
          </h2>
          <div className="space-y-6">
            {[
              {
                num: "01",
                title: "Browse & Discover",
                desc: "Explore our marketplace of professionally graded, authenticated trading cards. Every card is verified and listed with complete provenance.",
              },
              {
                num: "02",
                title: "Purchase On-Chain",
                desc: "Buy cards or open packs using ckUSDC. All transactions are recorded on the Internet Computer blockchain — no middlemen, no delays.",
              },
              {
                num: "03",
                title: "Own & Trade Digitally",
                desc: "Your cards are unique on-chain assets in your wallet. Trade them instantly on the marketplace at any time.",
              },
              {
                num: "04",
                title: "Redeem The Physical",
                desc: "Ready to hold it? Burn your digital card and we ship you the actual PSA/BGS graded slab, delivered to your door.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-14 h-14 rounded-2xl teal-gradient flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-white text-lg">
                    {step.num}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

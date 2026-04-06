import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

function DiamondIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d="M7 1L13 7L7 13L1 7L7 1Z" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`;

  return (
    <footer className="bg-card border-t-2 border-teal/20 mt-24">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-champagne">
                <DiamondIcon />
              </span>
              <span className="font-display font-bold text-2xl tracking-[0.15em] uppercase text-foreground">
                TCGX
              </span>
            </div>
            <p className="font-serif italic text-muted-foreground text-sm mb-4">
              Own it digitally. Hold it physically.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The premier phygital trading card marketplace on the Internet
              Computer.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com"
                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-display text-xs uppercase tracking-widest text-teal mb-4 font-semibold">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Marketplace", to: "/marketplace" },
                { label: "Pack Store", to: "/store" },
                { label: "My Collection", to: "/collection" },
                { label: "Redeem Physical", to: "/redeem" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xs uppercase tracking-widest text-teal mb-4 font-semibold">
              Info
            </h4>
            <ul className="space-y-3">
              {[
                { label: "How It Works", to: "/about" },
                { label: "Grading Guide", to: "/about" },
                { label: "Provably Fair", to: "/about" },
                { label: "ICP Network", to: "/about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-sans text-muted-foreground/60">
            &copy; {year} TCGX. All rights reserved. Built on the Internet
            Computer.
          </p>
          <p className="text-xs font-sans text-muted-foreground/40">
            Built with <span className="text-champagne/60">&#9829;</span> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

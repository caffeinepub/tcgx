import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyBalance, useMyProfile } from "../hooks/useQueries";
import { formatPrice } from "../lib/tcgxUtils";

interface HeaderProps {
  onLoginClick: () => void;
}

const NAV_LINKS = [
  { label: "Marketplace", to: "/marketplace" },
  { label: "Store", to: "/store" },
  { label: "Collection", to: "/collection" },
  { label: "About", to: "/about" },
];

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

export function Header({ onLoginClick }: HeaderProps) {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useMyProfile();
  const { data: balance } = useMyBalance();
  const routerState = useRouterState();
  const location = routerState.location;
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !!identity;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/96 backdrop-blur-xl shadow-xs border-b border-border"
            : "bg-background/90 backdrop-blur-sm border-b border-border/60"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="header.link"
            className="flex-shrink-0 mr-2 flex items-center gap-1.5"
          >
            <span className="text-champagne">
              <DiamondIcon />
            </span>
            <span className="font-display font-bold text-xl tracking-[0.15em] uppercase text-foreground">
              TCGX
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`nav.${link.label.toLowerCase()}.link`}
                className={`px-3.5 py-1.5 text-sm font-sans font-medium transition-colors relative rounded-lg ${
                  isActive(link.to)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 teal-gradient rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search cards, sets\u2026"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 bg-card border border-border rounded-xl px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/25 focus:border-teal/50 transition-all shadow-xs"
                data-ocid="header.search_input"
                aria-label="Search cards and collections"
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated && balance !== undefined && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-xs">
                <Wallet className="w-3.5 h-3.5 text-teal" />
                <span className="text-xs text-foreground font-medium font-sans">
                  {formatPrice(balance)}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-teal/40 transition-colors text-sm shadow-xs"
                  data-ocid="header.user.button"
                >
                  <User className="w-4 h-4 text-teal" />
                  <span className="text-foreground text-xs font-medium font-sans hidden sm:block">
                    {profile?.username ?? "User"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-card-hover overflow-hidden z-50"
                    data-ocid="header.dropdown_menu"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-sans"
                      onClick={() => setUserMenuOpen(false)}
                      data-ocid="header.profile.link"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/collection"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-sans"
                      onClick={() => setUserMenuOpen(false)}
                      data-ocid="header.collection.link"
                    >
                      <Shield className="w-4 h-4" />
                      My Collection
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-sans"
                      onClick={() => setUserMenuOpen(false)}
                      data-ocid="header.admin.link"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                    <div className="border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          clear();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors font-sans"
                        data-ocid="header.logout.button"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onLoginClick}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold font-sans hover:opacity-85 transition-opacity"
                data-ocid="header.login.button"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 md:hidden bg-transparent w-full h-full cursor-default"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <div
            className="fixed top-16 left-0 right-0 bg-card border-b border-border shadow-card-hover p-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl text-sm font-medium font-sans transition-colors ${
                    isActive(link.to)
                      ? "bg-teal text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </button>
      )}
    </>
  );
}

import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LoginModal } from "./components/LoginModal";
import { AboutPage } from "./pages/AboutPage";
import { AdminPage } from "./pages/AdminPage";
import { CollectionPage } from "./pages/CollectionPage";
import { HomePage } from "./pages/HomePage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { ProfilePage } from "./pages/ProfilePage";
import { RedemptionPage } from "./pages/RedemptionPage";
import { StorePage } from "./pages/StorePage";

// Shared login state - passed via context
let globalLoginClick: (() => void) | null = null;
export function getLoginClickHandler() {
  return globalLoginClick;
}

function Layout() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const handleLoginClick = () => setLoginModalOpen(true);
  globalLoginClick = handleLoginClick;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onLoginClick={handleLoginClick} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.985 0.005 85)",
            border: "1px solid oklch(0.88 0.012 80)",
            color: "oklch(0.12 0.008 30)",
          },
        }}
      />
    </div>
  );
}

// Define routes
const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <HomePage onLoginClick={handleLogin} />;
  },
});

const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/store",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <StorePage onLoginClick={handleLogin} />;
  },
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/marketplace",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <MarketplacePage onLoginClick={handleLogin} />;
  },
});

const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collection",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <CollectionPage onLoginClick={handleLogin} />;
  },
});

const redeemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/redeem",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <RedemptionPage onLoginClick={handleLogin} />;
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => {
    const handleLogin = () => globalLoginClick?.();
    return <ProfilePage onLoginClick={handleLogin} />;
  },
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  storeRoute,
  marketplaceRoute,
  collectionRoute,
  redeemRoute,
  adminRoute,
  profileRoute,
  aboutRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

export { Link, useNavigate, useSearch };

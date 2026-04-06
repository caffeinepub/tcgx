import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useRegisterUser } from "../hooks/useQueries";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login, isLoggingIn, identity, loginStatus } = useInternetIdentity();
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const registerUser = useRegisterUser();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const isLoggedIn = !!identity;
  const needsUsername = isLoggedIn && !isProfileLoading && !profile;

  const handleUsernameSubmit = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError("Username is required");
      return;
    }
    if (trimmed.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      setUsernameError(
        "Only letters, numbers, dots, underscores and hyphens allowed",
      );
      return;
    }
    setUsernameError("");
    try {
      await registerUser.mutateAsync(trimmed);
      onClose();
    } catch {
      setUsernameError("Username may already be taken. Try another.");
    }
  };

  if (isLoggedIn && !needsUsername) {
    onClose();
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-white border-border shadow-card-hover max-w-sm p-0 overflow-hidden"
        data-ocid="login.modal"
      >
        {needsUsername ? (
          <div className="p-8">
            <div className="mb-6 text-center">
              <ShieldCheck className="w-10 h-10 text-green-DEFAULT mx-auto mb-3" />
              <h2 className="font-serif text-xl text-foreground font-bold">
                Choose a Username
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                This will be your public identity on TCGX.
              </p>
            </div>

            <div className="space-y-3">
              <Input
                id="username-input"
                placeholder="e.g. card.collector"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUsernameSubmit()}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                data-ocid="login.username.input"
                autoFocus
              />
              {usernameError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="login.username_error"
                >
                  {usernameError}
                </p>
              )}

              <button
                type="button"
                onClick={handleUsernameSubmit}
                disabled={registerUser.isPending}
                className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                data-ocid="login.submit_button"
              >
                {registerUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                  </>
                ) : (
                  "Enter TCGX"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Top accent bar */}
            <div className="h-0.5 green-gradient rounded-full mb-6" />

            <div className="text-center mb-8">
              <span className="font-serif text-3xl tracking-widest uppercase block mb-2 text-foreground font-bold">
                TCGX
              </span>
              <h2 className="text-base font-semibold text-foreground">
                Sign in to your account
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Powered by Internet Identity on the ICP network.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted border border-border">
                <Lock className="w-4 h-4 text-green-DEFAULT mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Internet Identity provides secure, private authentication
                  without passwords or email. Your identity stays in your
                  control.
                </p>
              </div>

              <button
                type="button"
                onClick={login}
                disabled={isLoggingIn || loginStatus === "initializing"}
                className="w-full py-3.5 rounded-xl bg-foreground text-background text-sm font-semibold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                data-ocid="login.primary_button"
              >
                {isLoggingIn || loginStatus === "initializing" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
                  </>
                ) : (
                  "Connect with Internet Identity"
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="login.cancel_button"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

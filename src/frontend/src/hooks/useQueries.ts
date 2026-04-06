import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Card, Listing, Redemption, UserProfile } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAllCards() {
  const { actor, isFetching } = useActor();
  return useQuery<Card[]>({
    queryKey: ["cards", "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCards();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useActiveListings() {
  const { actor, isFetching } = useActor();
  return useQuery<Listing[]>({
    queryKey: ["listings", "active"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveListings();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useMyCards() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Card[]>({
    queryKey: ["cards", "mine", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getCardsByOwner(identity.getPrincipal());
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 30_000,
  });
}

export function useMyRedemptions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Redemption[]>({
    queryKey: ["redemptions", "mine"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getMyRedemptions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 15_000,
  });
}

export function useAllRedemptions() {
  const { actor, isFetching } = useActor();
  return useQuery<Redemption[]>({
    queryKey: ["redemptions", "all"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllRedemptions();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 60_000,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", "mine", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 60_000,
  });
}

export function useMyBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<bigint>({
    queryKey: ["balance", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return 0n;
      try {
        return await actor.getBalance();
      } catch {
        return 0n;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 15_000,
  });
}

export function usePlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPlatformStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useBuyCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.buyCard(cardId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useMakeOffer() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      cardId,
      offerPrice,
    }: { cardId: bigint; offerPrice: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return await actor.makeOffer(cardId, offerPrice);
    },
  });
}

export function useListCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      price,
    }: { cardId: bigint; price: bigint }) => {
      if (!actor) throw new Error("Not connected");
      await actor.listCard(cardId, price);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDelistCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cardId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.delistCard(cardId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function usePurchasePack() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (tierName: string) => {
      if (!actor) throw new Error("Not connected");
      return await actor.purchasePack(tierName);
    },
  });
}

export function useOpenPack() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (packId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return await actor.openPack(packId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.registerUser(username);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRequestRedemption() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      shippingAddress,
    }: {
      cardId: bigint;
      shippingAddress: {
        country: string;
        city: string;
        postalCode: string;
        name: string;
        state: string;
        addressLine1: string;
        addressLine2: string;
      };
    }) => {
      if (!actor) throw new Error("Not connected");
      return await actor.requestRedemption(cardId, shippingAddress);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["redemptions"] });
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useUpdateRedemptionStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      redemptionId,
      status,
    }: {
      redemptionId: bigint;
      status:
        | { __kind__: "shipped"; shipped: string }
        | { __kind__: "pending"; pending: null }
        | { __kind__: "delivered"; delivered: null }
        | { __kind__: "processing"; processing: null };
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateRedemptionStatus(redemptionId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["redemptions"] });
    },
  });
}

export function useMintCard() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      setName: string;
      cardNumber: string;
      description: string;
      grade: string;
      grader: string;
      rarity: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { ExternalBlob } = await import("../backend");
      return await actor.mintCard({
        name: input.name,
        setName: input.setName,
        cardNumber: input.cardNumber,
        description: input.description,
        grader: input.grader,
        grade: input.grade as any,
        rarity: input.rarity as any,
        imageUrl: ExternalBlob.fromURL(
          "/assets/generated/card-charizard-psa10.dim_400x560.png",
        ),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useDepositBalance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deposit(amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

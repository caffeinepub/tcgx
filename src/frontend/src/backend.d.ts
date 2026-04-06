import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PackTierInput {
    rarityWeights: {
        ultraRare: bigint;
        rare: bigint;
        secretRare: bigint;
        common: bigint;
        uncommon: bigint;
    };
    name: string;
    description: string;
    isActive: boolean;
    imageUrl: ExternalBlob;
    cardCount: bigint;
    price: bigint;
}
export interface Card {
    id: bigint;
    setName: string;
    grader: string;
    owner: Principal;
    isListed: boolean;
    name: string;
    description: string;
    listingPrice?: bigint;
    imageUrl: ExternalBlob;
    grade: Grade;
    rarity: Rarity;
    cardNumber: string;
}
export type Time = bigint;
export interface Listing {
    seller: Principal;
    isActive: boolean;
    cardId: bigint;
    price: bigint;
}
export interface Redemption {
    status: {
        __kind__: "shipped";
        shipped: string;
    } | {
        __kind__: "pending";
        pending: null;
    } | {
        __kind__: "delivered";
        delivered: null;
    } | {
        __kind__: "processing";
        processing: null;
    };
    owner: Principal;
    shippingAddress: {
        country: string;
        city: string;
        postalCode: string;
        name: string;
        state: string;
        addressLine1: string;
        addressLine2: string;
    };
    cardId: bigint;
}
export interface CardMintInput {
    setName: string;
    grader: string;
    name: string;
    description: string;
    imageUrl: ExternalBlob;
    grade: Grade;
    rarity: Rarity;
    cardNumber: string;
}
export interface UserProfile {
    principal: Principal;
    username: string;
    joined: Time;
}
export enum Grade {
    raw = "raw",
    bgs9 = "bgs9",
    psa7 = "psa7",
    psa8 = "psa8",
    psa9 = "psa9",
    bgs10 = "bgs10",
    bgs85 = "bgs85",
    bgs95 = "bgs95",
    psa10 = "psa10"
}
export enum Rarity {
    ultraRare = "ultraRare",
    rare = "rare",
    secretRare = "secretRare",
    common = "common",
    uncommon = "uncommon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptOffer(offerId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyCard(cardId: bigint): Promise<void>;
    createPackTier(tier: PackTierInput): Promise<void>;
    delistCard(cardId: bigint): Promise<void>;
    deposit(amount: bigint): Promise<void>;
    getActiveListings(): Promise<Array<Listing>>;
    getAllCards(): Promise<Array<Card>>;
    getAllRedemptions(): Promise<Array<Redemption>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCard(id: bigint): Promise<Card>;
    getCardsByIds(ids: Array<bigint>): Promise<Array<Card>>;
    getCardsByOwner(owner: Principal): Promise<Array<Card>>;
    getMyProfile(): Promise<UserProfile>;
    getMyRedemptions(): Promise<Array<Redemption>>;
    getPlatformStats(): Promise<{
        totalCards: bigint;
        activeListings: bigint;
        pendingRedemptions: bigint;
        totalUsers: bigint;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isRegistered(user: Principal): Promise<boolean>;
    listCard(cardId: bigint, price: bigint): Promise<void>;
    makeOffer(cardId: bigint, offerPrice: bigint): Promise<bigint>;
    mintCard(card: CardMintInput): Promise<bigint>;
    openPack(packId: bigint): Promise<Array<Card>>;
    purchasePack(tierName: string): Promise<bigint>;
    registerUser(username: string): Promise<void>;
    rejectOffer(offerId: bigint): Promise<void>;
    requestRedemption(cardId: bigint, shippingAddress: {
        country: string;
        city: string;
        postalCode: string;
        name: string;
        state: string;
        addressLine1: string;
        addressLine2: string;
    }): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transferCard(cardId: bigint, newOwner: Principal): Promise<void>;
    updateRedemptionStatus(redemptionId: bigint, status: {
        __kind__: "shipped";
        shipped: string;
    } | {
        __kind__: "pending";
        pending: null;
    } | {
        __kind__: "delivered";
        delivered: null;
    } | {
        __kind__: "processing";
        processing: null;
    }): Promise<void>;
}

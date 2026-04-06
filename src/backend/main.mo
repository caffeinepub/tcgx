import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Blob "mo:core/Blob";
import List "mo:core/List";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      switch (Text.compare(a.username, b.username)) {
        case (#equal) { Principal.compare(a.principal, b.principal) };
        case (order) { order };
      };
    };
  };

  let users = Map.empty<Principal, UserProfile>();
  let userBalances = Map.empty<Principal, Nat>();
  let cards = Map.empty<Nat, Card>();
  let packTiers = Map.empty<Text, PackTier>();
  let packs = Map.empty<Nat, Pack>();
  let listings = Map.empty<Nat, Listing>();
  let offers = Map.empty<Nat, Offer>();
  let redemptions = Map.empty<Nat, Redemption>();

  public type Rarity = {
    #common;
    #uncommon;
    #rare;
    #ultraRare;
    #secretRare;
  };

  public type Grade = {
    #raw;
    #psa7;
    #psa8;
    #psa9;
    #psa10;
    #bgs85;
    #bgs9;
    #bgs95;
    #bgs10;
  };

  public type Card = {
    id : Nat;
    name : Text;
    setName : Text;
    cardNumber : Text;
    rarity : Rarity;
    grade : Grade;
    grader : Text;
    imageUrl : Storage.ExternalBlob;
    description : Text;
    owner : Principal;
    isListed : Bool;
    listingPrice : ?Nat;
  };

  public type PackTier = {
    name : Text;
    price : Nat;
    cardCount : Nat;
    rarityWeights : {
      common : Nat;
      uncommon : Nat;
      rare : Nat;
      ultraRare : Nat;
      secretRare : Nat;
    };
    imageUrl : Storage.ExternalBlob;
    description : Text;
    isActive : Bool;
  };

  public type Pack = {
    id : Nat;
    tier : Text;
    owner : Principal;
    cards : [Nat];
    isOpened : Bool;
  };

  public type Listing = {
    cardId : Nat;
    seller : Principal;
    price : Nat;
    isActive : Bool;
  };

  public type Offer = {
    cardId : Nat;
    buyer : Principal;
    offerPrice : Nat;
    isAccepted : Bool;
    isRejected : Bool;
  };

  public type Redemption = {
    cardId : Nat;
    owner : Principal;
    status : {
      #pending;
      #processing;
      #shipped : Text;
      #delivered;
    };
    shippingAddress : {
      name : Text;
      addressLine1 : Text;
      addressLine2 : Text;
      city : Text;
      state : Text;
      postalCode : Text;
      country : Text;
    };
  };

  public type UserProfile = {
    principal : Principal;
    username : Text;
    joined : Time.Time;
  };

  var nextCardId = 1;
  var nextPackId = 1;
  var nextOfferId = 1;
  var nextRedemptionId = 1;

  // User Management - Registration is open to guests
  public shared ({ caller }) func registerUser(username : Text) : async () {
    if (users.containsKey(caller)) { Runtime.trap("User already registered") };
    let profile : UserProfile = {
      principal = caller;
      username;
      joined = Time.now();
    };
    users.add(caller, profile);
    userBalances.add(caller, 0);
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.principal != caller) {
      Runtime.trap("Cannot save profile for another user");
    };
    users.add(caller, profile);
  };

  // Legacy profile function - requires user role
  public query ({ caller }) func getMyProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  // Balance management - requires user role
  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    switch (userBalances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func deposit(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deposit");
    };
    let current = switch (userBalances.get(caller)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
    userBalances.add(caller, current + amount);
  };

  // Card Management - Admin only
  public shared ({ caller }) func mintCard(card : CardMintInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mint cards");
    };
    let newCard : Card = {
      id = nextCardId;
      name = card.name;
      setName = card.setName;
      cardNumber = card.cardNumber;
      rarity = card.rarity;
      grade = card.grade;
      grader = card.grader;
      imageUrl = card.imageUrl;
      description = card.description;
      owner = caller;
      isListed = false;
      listingPrice = null;
    };
    cards.add(nextCardId, newCard);
    nextCardId += 1;
    nextCardId - 1;
  };

  public type CardMintInput = {
    name : Text;
    setName : Text;
    cardNumber : Text;
    rarity : Rarity;
    grade : Grade;
    grader : Text;
    imageUrl : Storage.ExternalBlob;
    description : Text;
  };

  // Pack Tier Management - Admin only
  public shared ({ caller }) func createPackTier(tier : PackTierInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create pack tiers");
    };
    let newTier : PackTier = {
      name = tier.name;
      price = tier.price;
      cardCount = tier.cardCount;
      rarityWeights = tier.rarityWeights;
      imageUrl = tier.imageUrl;
      description = tier.description;
      isActive = tier.isActive;
    };
    packTiers.add(tier.name, newTier);
  };

  public type PackTierInput = {
    name : Text;
    price : Nat;
    cardCount : Nat;
    rarityWeights : {
      common : Nat;
      uncommon : Nat;
      rare : Nat;
      ultraRare : Nat;
      secretRare : Nat;
    };
    imageUrl : Storage.ExternalBlob;
    description : Text;
    isActive : Bool;
  };

  // Card queries - accessible to all (including guests for marketplace browsing)
  public query ({ caller }) func getCard(id : Nat) : async Card {
    switch (cards.get(id)) {
      case (null) { Runtime.trap("Card not found") };
      case (?card) { card };
    };
  };

  public query ({ caller }) func getAllCards() : async [Card] {
    cards.values().toArray();
  };

  public query ({ caller }) func getCardsByOwner(owner : Principal) : async [Card] {
    cards.values().toArray().filter(func(card) { card.owner == owner });
  };

  public query ({ caller }) func getCardsByIds(ids : [Nat]) : async [Card] {
    ids.map(func(id) { cards.get(id) }).filter(func(c) { c != null }).map(func(c) { switch (c) { case (null) { Runtime.trap("Card not found") }; case (?card) { card } } });
  };

  // Card transfer - requires user role and ownership
  public shared ({ caller }) func transferCard(cardId : Nat, newOwner : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer cards");
    };
    switch (cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?card) {
        if (card.owner != caller) {
          Runtime.trap("Not authorized: You don't own this card");
        };
        let updatedCard = { card with owner = newOwner };
        cards.add(cardId, updatedCard);
      };
    };
  };

  // Pack purchasing - requires user role
  public shared ({ caller }) func purchasePack(tierName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase packs");
    };
    let tier = switch (packTiers.get(tierName)) {
      case (null) { Runtime.trap("Pack tier not found") };
      case (?tier) { tier };
    };
    let balance = switch (userBalances.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?balance) { balance };
    };
    if (balance < tier.price) {
      Runtime.trap("Insufficient balance");
    };
    userBalances.add(caller, balance - tier.price);
    let newPack : Pack = {
      id = nextPackId;
      tier = tierName;
      owner = caller;
      cards = [];
      isOpened = false;
    };
    packs.add(nextPackId, newPack);
    nextPackId += 1;
    nextPackId - 1;
  };

  // Pack opening - requires user role and ownership
  public shared ({ caller }) func openPack(packId : Nat) : async [Card] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can open packs");
    };
    let pack = switch (packs.get(packId)) {
      case (null) { Runtime.trap("Pack not found") };
      case (?p) { p };
    };
    if (pack.owner != caller) {
      Runtime.trap("Not authorized: You don't own this pack");
    };
    if (pack.isOpened) {
      Runtime.trap("Pack already opened");
    };
    // Return empty array for now - full implementation would assign cards
    [];
  };

  // Marketplace listing - requires user role and ownership
  public shared ({ caller }) func listCard(cardId : Nat, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list cards");
    };
    let card = switch (cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?c) { c };
    };
    if (card.owner != caller) {
      Runtime.trap("Not authorized: You don't own this card");
    };
    let listing : Listing = {
      cardId;
      seller = caller;
      price;
      isActive = true;
    };
    listings.add(cardId, listing);
    let updatedCard = { card with isListed = true; listingPrice = ?price };
    cards.add(cardId, updatedCard);
  };

  // Delist card - requires user role and ownership
  public shared ({ caller }) func delistCard(cardId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delist cards");
    };
    let listing = switch (listings.get(cardId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (listing.seller != caller) {
      Runtime.trap("Not authorized: You don't own this listing");
    };
    listings.remove(cardId);
    switch (cards.get(cardId)) {
      case (null) {};
      case (?card) {
        let updatedCard = { card with isListed = false; listingPrice = null };
        cards.add(cardId, updatedCard);
      };
    };
  };

  // Buy card - requires user role
  public shared ({ caller }) func buyCard(cardId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy cards");
    };
    let listing = switch (listings.get(cardId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (not listing.isActive) {
      Runtime.trap("Listing is not active");
    };
    let buyerBalance = switch (userBalances.get(caller)) {
      case (null) { Runtime.trap("Buyer not found") };
      case (?b) { b };
    };
    if (buyerBalance < listing.price) {
      Runtime.trap("Insufficient balance");
    };
    let sellerBalance = switch (userBalances.get(listing.seller)) {
      case (null) { 0 };
      case (?b) { b };
    };
    userBalances.add(caller, buyerBalance - listing.price);
    userBalances.add(listing.seller, sellerBalance + listing.price);
    switch (cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?card) {
        let updatedCard = { card with owner = caller; isListed = false; listingPrice = null };
        cards.add(cardId, updatedCard);
      };
    };
    listings.remove(cardId);
  };

  // Make offer - requires user role
  public shared ({ caller }) func makeOffer(cardId : Nat, offerPrice : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can make offers");
    };
    let card = switch (cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?c) { c };
    };
    if (card.owner == caller) {
      Runtime.trap("Cannot make offer on your own card");
    };
    let offer : Offer = {
      cardId;
      buyer = caller;
      offerPrice;
      isAccepted = false;
      isRejected = false;
    };
    offers.add(nextOfferId, offer);
    nextOfferId += 1;
    nextOfferId - 1;
  };

  // Accept offer - requires user role and ownership
  public shared ({ caller }) func acceptOffer(offerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept offers");
    };
    let offer = switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?o) { o };
    };
    let card = switch (cards.get(offer.cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?c) { c };
    };
    if (card.owner != caller) {
      Runtime.trap("Not authorized: You don't own this card");
    };
    let buyerBalance = switch (userBalances.get(offer.buyer)) {
      case (null) { Runtime.trap("Buyer not found") };
      case (?b) { b };
    };
    if (buyerBalance < offer.offerPrice) {
      Runtime.trap("Buyer has insufficient balance");
    };
    let sellerBalance = switch (userBalances.get(caller)) {
      case (null) { 0 };
      case (?b) { b };
    };
    userBalances.add(offer.buyer, buyerBalance - offer.offerPrice);
    userBalances.add(caller, sellerBalance + offer.offerPrice);
    let updatedCard = { card with owner = offer.buyer; isListed = false; listingPrice = null };
    cards.add(offer.cardId, updatedCard);
    let updatedOffer = { offer with isAccepted = true };
    offers.add(offerId, updatedOffer);
  };

  // Reject offer - requires user role and ownership
  public shared ({ caller }) func rejectOffer(offerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject offers");
    };
    let offer = switch (offers.get(offerId)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?o) { o };
    };
    let card = switch (cards.get(offer.cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?c) { c };
    };
    if (card.owner != caller) {
      Runtime.trap("Not authorized: You don't own this card");
    };
    let updatedOffer = { offer with isRejected = true };
    offers.add(offerId, updatedOffer);
  };

  // Get active listings - accessible to all
  public query ({ caller }) func getActiveListings() : async [Listing] {
    listings.values().toArray().filter(func(l) { l.isActive });
  };

  // Redemption request - requires user role and ownership
  public shared ({ caller }) func requestRedemption(
    cardId : Nat,
    shippingAddress : {
      name : Text;
      addressLine1 : Text;
      addressLine2 : Text;
      city : Text;
      state : Text;
      postalCode : Text;
      country : Text;
    }
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request redemption");
    };
    let card = switch (cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?c) { c };
    };
    if (card.owner != caller) {
      Runtime.trap("Not authorized: You don't own this card");
    };
    let redemption : Redemption = {
      cardId;
      owner = caller;
      status = #pending;
      shippingAddress;
    };
    redemptions.add(nextRedemptionId, redemption);
    nextRedemptionId += 1;
    nextRedemptionId - 1;
  };

  // Update redemption status - Admin only
  public shared ({ caller }) func updateRedemptionStatus(
    redemptionId : Nat,
    status : {
      #pending;
      #processing;
      #shipped : Text;
      #delivered;
    }
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update redemption status");
    };
    let redemption = switch (redemptions.get(redemptionId)) {
      case (null) { Runtime.trap("Redemption not found") };
      case (?r) { r };
    };
    let updatedRedemption = { redemption with status };
    redemptions.add(redemptionId, updatedRedemption);
  };

  // Get user redemptions - requires user role and ownership
  public query ({ caller }) func getMyRedemptions() : async [Redemption] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their redemptions");
    };
    redemptions.values().toArray().filter(func(r) { r.owner == caller });
  };

  // Get all redemptions - Admin only
  public query ({ caller }) func getAllRedemptions() : async [Redemption] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all redemptions");
    };
    redemptions.values().toArray();
  };

  // Platform statistics - Admin only
  public query ({ caller }) func getPlatformStats() : async {
    totalCards : Nat;
    totalUsers : Nat;
    activeListings : Nat;
    pendingRedemptions : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view platform statistics");
    };
    {
      totalCards = cards.size();
      totalUsers = users.size();
      activeListings = listings.values().toArray().filter(func(l) { l.isActive }).size();
      pendingRedemptions = redemptions.values().toArray().filter(func(r) {
        switch (r.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }).size();
    };
  };

  // Helper function - accessible to all
  public query ({ caller }) func isRegistered(user : Principal) : async Bool {
    users.containsKey(user);
  };
};

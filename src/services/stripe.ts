// src/services/stripe.ts - Updated with streamlined pricing and trial flow
import { supabase } from "../lib/supabase";

export interface PricingTier {
  id: string;
  title: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  stripePrice: string;
  popular?: boolean;
  isTrial?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free-trial",
    title: "Free Trial",
    price: "$0",
    period: "",
    credits: "14-day free trial",
    features: [
      "Full access to all features",
      "Unlimited file organization",
      "Local processing & privacy",
      "Email support",
      "No commitment required",
    ],
    stripePrice: "price_trial_14day", // This would be your Stripe price ID for trial
    popular: true,
    isTrial: true,
  },
  {
    id: "professional",
    title: "Professional",
    price: "$5",
    period: "/month",
    credits: "Unlimited credits",
    features: [
      "All trial features included",
      "Priority email support",
      "Advanced organization rules",
      "Batch processing",
      "Export organized structures",
    ],
    stripePrice: "price_professional_monthly", // Replace with actual Stripe price ID
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "$30",
    period: "/month",
    credits: "Unlimited + team features",
    features: [
      "All Professional features",
      "Team collaboration tools",
      "Admin dashboard",
      "Custom organization rules",
      "Phone support",
      "SLA guarantee",
    ],
    stripePrice: "price_enterprise_monthly", // Replace with actual Stripe price ID
  },
];

// Unified function to handle all subscription flows
export const createSubscriptionSession = async (
  tierId: string,
  userId: string
) => {
  try {
    const tier = pricingTiers.find((t) => t.id === tierId);
    if (!tier) {
      throw new Error("Invalid pricing tier");
    }

    // All flows go through the same trial session for new users
    // This ensures payment info is collected before download access
    const response = await fetch("/api/create-subscription-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tierId,
        priceId: tier.stripePrice,
        userId,
        isTrial: tier.isTrial,
        successUrl: `${window.location.origin}/dashboard?subscription=success&tier=${tierId}`,
        cancelUrl: `${window.location.origin}/?subscription=cancelled`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create subscription session");
    }

    const { url } = await response.json();

    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error("Error creating subscription session:", error);
    throw error;
  }
};

// Legacy functions for backwards compatibility
export const createTrialSession = async (userId: string) => {
  return createSubscriptionSession("free-trial", userId);
};

export const createCheckoutSession = async (
  priceId: string,
  userId: string
) => {
  // Find the tier by price ID
  const tier = pricingTiers.find((t) => t.stripePrice === priceId);
  if (tier) {
    return createSubscriptionSession(tier.id, userId);
  }
  throw new Error("Invalid price ID");
};

export const createPortalSession = async (customerId: string) => {
  try {
    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create portal session");
    }

    const { url } = await response.json();

    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw error;
  }
};

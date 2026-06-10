export type Platform = 'etsy' | 'amazon' | 'shopify' | 'tiktok';

export interface FeeBreakdown {
  name: string;
  amount: number;
  description: string;
}

export interface PlatformFees {
  platform: Platform;
  label: string;
  fees: FeeBreakdown[];
  totalFees: number;
}

export interface ProfitResult {
  revenue: number;
  totalCost: number;
  totalFees: number;
  profit: number;
  margin: number;
  roi: number;
  platformFees: PlatformFees;
}

export interface ProfitInput {
  costOfGoods: number;
  sellingPrice: number;
  shippingCost: number;
  platform: Platform;
  quantity: number;
}

/**
 * Calculate platform-specific fees for a given selling price.
 */
export function calculatePlatformFees(platform: Platform, sellingPrice: number): PlatformFees {
  const fees: FeeBreakdown[] = [];

  switch (platform) {
    case 'etsy': {
      fees.push({ name: 'Listing Fee', amount: 0.20, description: '$0.20 per listing' });
      fees.push({ name: 'Transaction Fee', amount: round(sellingPrice * 0.065), description: '6.5% of sale price' });
      fees.push({ name: 'Payment Processing', amount: round(sellingPrice * 0.03 + 0.25), description: '3% + $0.25' });
      break;
    }
    case 'amazon': {
      fees.push({ name: 'Referral Fee', amount: round(sellingPrice * 0.15), description: '15% referral fee (standard category)' });
      fees.push({ name: 'Closing Fee', amount: 1.80, description: '$1.80 per item (media)' });
      break;
    }
    case 'shopify': {
      fees.push({ name: 'Payment Processing', amount: round(sellingPrice * 0.029 + 0.30), description: '2.9% + $0.30 (Basic plan)' });
      break;
    }
    case 'tiktok': {
      fees.push({ name: 'Platform Commission', amount: round(sellingPrice * 0.08), description: '8% commission' });
      fees.push({ name: 'Payment Processing', amount: round(sellingPrice * 0.02 + 0.30), description: '2% + $0.30' });
      break;
    }
  }

  const totalFees = round(fees.reduce((sum, f) => sum + f.amount, 0));

  return { platform, label: PLATFORM_LABELS[platform], fees, totalFees };
}

/**
 * Calculate full profit analysis for a product.
 */
export function calculateProfit(input: ProfitInput): ProfitResult {
  const { costOfGoods, sellingPrice, shippingCost, platform, quantity } = input;

  const platformFees = calculatePlatformFees(platform, sellingPrice);
  const perUnitFees = platformFees.totalFees;
  const totalFees = round(perUnitFees * quantity);
  const revenue = round(sellingPrice * quantity);
  const totalCost = round((costOfGoods + shippingCost) * quantity);
  const profit = round(revenue - totalCost - totalFees);
  const margin = revenue > 0 ? round((profit / revenue) * 100) : 0;
  const roi = totalCost > 0 ? round((profit / totalCost) * 100) : 0;

  return { revenue, totalCost, totalFees, profit, margin, roi, platformFees };
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  etsy: 'Etsy',
  amazon: 'Amazon',
  shopify: 'Shopify',
  tiktok: 'TikTok Shop',
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

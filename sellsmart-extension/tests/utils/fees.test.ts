import { describe, it, expect } from 'vitest';
import {
  calculatePlatformFees,
  calculateProfit,
  PLATFORM_LABELS,
  type Platform,
  type ProfitInput,
} from '~/utils/fees';

describe('calculatePlatformFees', () => {
  describe('Etsy', () => {
    it('calculates fees for a $25 item', () => {
      const result = calculatePlatformFees('etsy', 25);
      expect(result.platform).toBe('etsy');
      expect(result.label).toBe('Etsy');
      expect(result.fees).toHaveLength(3);

      const listing = result.fees.find((f) => f.name === 'Listing Fee')!;
      expect(listing.amount).toBe(0.2);

      const transaction = result.fees.find((f) => f.name === 'Transaction Fee')!;
      expect(transaction.amount).toBe(1.63); // 25 * 0.065 = 1.625, rounded

      const processing = result.fees.find((f) => f.name === 'Payment Processing')!;
      expect(processing.amount).toBe(1); // 25 * 0.03 + 0.25 = 1.0

      expect(result.totalFees).toBe(2.83); // 0.2 + 1.63 + 1.0
    });

    it('calculates fees for a $0 item', () => {
      const result = calculatePlatformFees('etsy', 0);
      expect(result.totalFees).toBe(0.45); // 0.2 + 0 + 0.25
    });
  });

  describe('Amazon', () => {
    it('calculates fees for a $50 item', () => {
      const result = calculatePlatformFees('amazon', 50);
      expect(result.fees).toHaveLength(2);

      const referral = result.fees.find((f) => f.name === 'Referral Fee')!;
      expect(referral.amount).toBe(7.5); // 50 * 0.15

      const closing = result.fees.find((f) => f.name === 'Closing Fee')!;
      expect(closing.amount).toBe(1.8);

      expect(result.totalFees).toBe(9.3);
    });

    it('calculates fees for a $10 item', () => {
      const result = calculatePlatformFees('amazon', 10);
      expect(result.totalFees).toBe(3.3); // 1.5 + 1.8
    });
  });

  describe('Shopify', () => {
    it('calculates fees for a $100 item', () => {
      const result = calculatePlatformFees('shopify', 100);
      expect(result.fees).toHaveLength(1);

      const processing = result.fees.find((f) => f.name === 'Payment Processing')!;
      expect(processing.amount).toBe(3.2); // 100 * 0.029 + 0.30 = 3.2

      expect(result.totalFees).toBe(3.2);
    });

    it('calculates fees for a $10 item', () => {
      const result = calculatePlatformFees('shopify', 10);
      expect(result.totalFees).toBe(0.59); // 10 * 0.029 + 0.30 = 0.59
    });
  });

  describe('TikTok Shop', () => {
    it('calculates fees for a $30 item', () => {
      const result = calculatePlatformFees('tiktok', 30);
      expect(result.fees).toHaveLength(2);

      const commission = result.fees.find((f) => f.name === 'Platform Commission')!;
      expect(commission.amount).toBe(2.4); // 30 * 0.08

      const processing = result.fees.find((f) => f.name === 'Payment Processing')!;
      expect(processing.amount).toBe(0.9); // 30 * 0.02 + 0.30

      expect(result.totalFees).toBe(3.3);
    });
  });
});

describe('calculateProfit', () => {
  const baseInput: ProfitInput = {
    costOfGoods: 10,
    sellingPrice: 25,
    shippingCost: 3,
    platform: 'etsy',
    quantity: 1,
  };

  it('calculates profit for single unit on Etsy', () => {
    const result = calculateProfit(baseInput);
    expect(result.revenue).toBe(25);
    expect(result.totalCost).toBe(13); // 10 + 3
    expect(result.totalFees).toBe(2.83);
    expect(result.profit).toBe(9.17); // 25 - 13 - 2.83
    expect(result.margin).toBe(36.68); // 9.17 / 25 * 100
    expect(result.roi).toBe(70.54); // 9.17 / 13 * 100
  });

  it('calculates profit for multiple units', () => {
    const result = calculateProfit({ ...baseInput, quantity: 10 });
    expect(result.revenue).toBe(250);
    expect(result.totalCost).toBe(130);
    expect(result.totalFees).toBe(28.3);
    expect(result.profit).toBe(91.7);
  });

  it('handles zero selling price', () => {
    const result = calculateProfit({ ...baseInput, sellingPrice: 0, quantity: 1 });
    expect(result.revenue).toBe(0);
    expect(result.margin).toBe(0);
    // Etsy listing fee still applies
    expect(result.totalFees).toBe(0.45);
    expect(result.profit).toBe(-13.45);
  });

  it('handles negative profit (loss)', () => {
    const result = calculateProfit({
      costOfGoods: 50,
      sellingPrice: 25,
      shippingCost: 5,
      platform: 'amazon',
      quantity: 1,
    });
    expect(result.profit).toBeLessThan(0);
    expect(result.profit).toBe(-35.55); // 25 - 55 - 5.55 (amazon fees)
  });

  it('handles zero cost (free product)', () => {
    const result = calculateProfit({
      costOfGoods: 0,
      sellingPrice: 20,
      shippingCost: 0,
      platform: 'shopify',
      quantity: 1,
    });
    expect(result.roi).toBe(0); // avoid division by zero
    expect(result.profit).toBe(19.12); // 20 - 0 - 0.88 (shopify fees)
  });

  it('calculates across all platforms', () => {
    const platforms: Platform[] = ['etsy', 'amazon', 'shopify', 'tiktok'];
    for (const platform of platforms) {
      const result = calculateProfit({ ...baseInput, platform });
      expect(result.platformFees.platform).toBe(platform);
      expect(result.platformFees.label).toBe(PLATFORM_LABELS[platform]);
      expect(result.profit).toBeGreaterThan(0);
    }
  });

  it('Shopify is cheapest for fees', () => {
    const shopifyResult = calculateProfit({ ...baseInput, platform: 'shopify' });
    const amazonResult = calculateProfit({ ...baseInput, platform: 'amazon' });
    expect(shopifyResult.totalFees).toBeLessThan(amazonResult.totalFees);
    expect(shopifyResult.profit).toBeGreaterThan(amazonResult.profit);
  });
});

describe('PLATFORM_LABELS', () => {
  it('has labels for all platforms', () => {
    expect(PLATFORM_LABELS.etsy).toBe('Etsy');
    expect(PLATFORM_LABELS.amazon).toBe('Amazon');
    expect(PLATFORM_LABELS.shopify).toBe('Shopify');
    expect(PLATFORM_LABELS.tiktok).toBe('TikTok Shop');
  });
});

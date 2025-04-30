export type ShippingRule = {
  countryCodes: string[];        // ISO alpha-2 codes
  regions?: string[];            // optional region names (for ES subdivisions)
  currency: string;              // 'USD' | 'CAD' | 'EUR' | 'GBP'
  flatRate: number;              // in that currency
  freeThreshold: number;         // free over this amount (same currency)
};

const shippingRules: ShippingRule[] = [
  { countryCodes: ['US'],                                    currency: 'USD', flatRate: 9,   freeThreshold: 100 },
  { countryCodes: ['CA'],                                    currency: 'CAD', flatRate: 7,   freeThreshold: 100 },
  { countryCodes: ['ES','PT'],                               currency: 'EUR', flatRate: 4,   freeThreshold: 100 },
  { countryCodes: ['ES'], regions: ['Canary Islands','Ceuta','Melilla'], currency: 'EUR', flatRate: 9.5, freeThreshold: 100 },
  { countryCodes: ['AD','DE','IT','BE','DK','FR','AT','NL','LU'], currency: 'EUR', flatRate: 5,   freeThreshold: 100 },
  { countryCodes: ['CH'],                                    currency: 'EUR', flatRate: 20,  freeThreshold: 200 },
  { countryCodes: ['GB'],                                    currency: 'GBP', flatRate: 10,  freeThreshold: 100 },
  // rest of EU
  { countryCodes: [],                                        currency: 'EUR', flatRate: 8,   freeThreshold: 100 },
  // rest of world
  { countryCodes: [],                                        currency: 'USD', flatRate: 10,  freeThreshold: 100 },
];

// simple cache to speed up repeated shipping lookups
const shippingCache = new Map<string, { fee: number; currency: string }>();

export function getShippingFee(
  country: string,
  region: string | null,
  subtotal: number
): { fee: number; currency: string } {
  // cache key
  const key = `${country}|${region || ''}|${subtotal}`;
  if (shippingCache.has(key)) {
    return shippingCache.get(key)!;
  }

  // 1) try exact country+region
  let rule = shippingRules.find(r =>
    r.countryCodes.includes(country) &&
    r.regions?.includes(region || '')
  );
  // 2) then country-only
  if (!rule) rule = shippingRules.find(r =>
    r.countryCodes.includes(country) && !r.regions
  );
  // 3) fallback: if EU country, pick "rest of EU"
  const euCodes = ['AD','DE','IT','BE','DK','FR','AT','NL','LU','ES','PT'];
  if (!rule && euCodes.includes(country)) {
    rule = shippingRules.find(r => r.countryCodes.length === 0 && r.currency === 'EUR');
  }
  // 4) final fallback = rest of world
  if (!rule) {
    rule = shippingRules.find(r => r.countryCodes.length === 0 && r.currency === 'USD');
  }

  const fee = subtotal >= (rule!.freeThreshold) ? 0 : rule!.flatRate;
  const result = { fee, currency: rule!.currency };
  // store in cache
  shippingCache.set(key, result);

  return result;
}

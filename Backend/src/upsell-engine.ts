export type UpsellRecommendation = {
  productId: number;
  productName: string;
  reason: string;
  additionalRevenue: number;
  estimatedMargin: number;
};

const UPSELL_RULES = [
  { keywords: ["laptop", "notebook", "computer"], recommendedProducts: ["Extended Warranty", "Wireless Business Mouse", "USB-C Docking Station"] },
  { keywords: ["monitor", "display"], recommendedProducts: ["USB-C Docking Station", "Wireless Business Mouse"] },
];

export function generateUpsellRecommendations(
  purchasedProductName: string,
  availableProducts: Array<{ id: number; name: string; sellingPrice: number; costPrice: number }>
): UpsellRecommendation[] {
  const rule = UPSELL_RULES.find(({ keywords }) => keywords.some((keyword) => purchasedProductName.toLowerCase().includes(keyword)));
  if (!rule) return [];

  return rule.recommendedProducts
    .map((recommendedName) => {
      const product = availableProducts.find((item) => item.name === recommendedName);
      if (!product) return null;
      return {
        productId: product.id,
        productName: product.name,
        reason: `Customers purchasing ${purchasedProductName} commonly add ${product.name}.`,
        additionalRevenue: product.sellingPrice,
        estimatedMargin: product.sellingPrice - product.costPrice,
      };
    })
    .filter((recommendation): recommendation is UpsellRecommendation => recommendation !== null);
}
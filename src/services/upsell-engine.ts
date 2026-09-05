export type UpsellRecommendation = {
  productId: number;
  productName: string;
  reason: string;
  additionalRevenue: number;
  estimatedMargin: number;
};

type UpsellRule = {
  keywords: string[];
  recommendedProducts: string[];
};

const UPSELL_RULES: UpsellRule[] = [
  {
    keywords: ["laptop", "notebook", "computer"],
    recommendedProducts: [
      "Extended Warranty",
      "Wireless Business Mouse",
      "USB-C Docking Station",
    ],
  },
  {
    keywords: ["monitor", "display"],
    recommendedProducts: [
      "USB-C Docking Station",
      "Wireless Business Mouse",
    ],
  },
];

export function generateUpsellRecommendations(
  purchasedProductName: string,
  availableProducts: Array<{
    id: number;
    name: string;
    sellingPrice: number;
    costPrice: number;
  }>
): UpsellRecommendation[] {
  const productName = purchasedProductName.toLowerCase();

  const rule = UPSELL_RULES.find((candidate) =>
    candidate.keywords.some((keyword) =>
      productName.includes(keyword)
    )
  );

  if (!rule) {
    return [];
  }

  return rule.recommendedProducts
    .map((recommendedName) => {
      const product = availableProducts.find(
        (item) => item.name === recommendedName
      );

      if (!product) {
        return null;
      }

      const estimatedMargin =
        product.sellingPrice - product.costPrice;

      return {
        productId: product.id,
        productName: product.name,
        reason: `Customers purchasing ${purchasedProductName} commonly add ${product.name}.`,
        additionalRevenue: product.sellingPrice,
        estimatedMargin,
      };
    })
    .filter(
      (recommendation): recommendation is UpsellRecommendation =>
        recommendation !== null
    );
}
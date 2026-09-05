import { NextResponse } from "next/server";

import { db } from "@/backend/db";
import { generateUpsellRecommendations } from "@/backend/upsell-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("productId"));

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const products = await db.orm.public.Product.all();

    const purchasedProduct = products.find(
      (product) => product.id === productId
    );

    if (!purchasedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const recommendations = generateUpsellRecommendations(
      purchasedProduct.name,
      products
        .filter((product) => product.id !== productId && product.active)
        .map((product) => ({
          id: product.id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
        }))
    );

    return NextResponse.json({
      success: true,
      purchasedProduct: {
        id: purchasedProduct.id,
        name: purchasedProduct.name,
      },
      recommendations,
    });
  } catch (error) {
    console.error("Upsell error:", error);

    return NextResponse.json(
      { error: "Failed to generate upsell recommendations" },
      { status: 500 }
    );
  }
}
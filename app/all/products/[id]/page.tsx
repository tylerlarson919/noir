import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";
import { getProductById, getFeaturedProducts } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const featuredProducts = (await getFeaturedProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetails product={product} featuredProducts={featuredProducts} />
  );
}

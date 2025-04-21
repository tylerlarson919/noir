import ProductDetails from "@/components/ProductDetails";
import { notFound } from "next/navigation";
import { getProductById, getFeaturedProducts } from "@/lib/products";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductPage({ params, searchParams }: Props) {
   // await the async params/searchParams
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};

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
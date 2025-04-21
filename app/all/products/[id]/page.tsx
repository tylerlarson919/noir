import ProductPageClient from '@/components/ProductPageClient';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductPageClient params={params} />;
}
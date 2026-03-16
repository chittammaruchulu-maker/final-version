import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/supabase/products"
import ProductDetailPage from "./product-detail"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  const relatedProducts = product ? await fetchRelatedProducts(product) : []

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />
}

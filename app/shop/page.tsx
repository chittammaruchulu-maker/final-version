import { fetchProducts } from "@/lib/supabase/products"
import { ShopPageClient } from "./shop-content"

export default async function ShopPage() {
  const allProducts = await fetchProducts()
  return <ShopPageClient allProducts={allProducts} />
}

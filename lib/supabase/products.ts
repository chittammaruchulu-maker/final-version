import { createClient } from "@/lib/supabase/server"
import type { Product, SizeVariant } from "@/lib/products"

// Map a Supabase DB row to the frontend Product interface
function mapRowToProduct(row: Record<string, unknown>): Product {
  const ingredients = row.ingredients as string[] | null
  const sizes = row.sizes as SizeVariant[] | null

  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: row.price as number,
    originalPrice: (row.original_price as number) ?? null,
    rating: row.rating as number,
    reviews: row.reviews_count as number,
    image: row.image as string,
    images: (row.images as string[]) ?? [],
    badge: (row.badge as string) ?? "",
    category: row.category as string,
    weight: (row.weight as string) ?? "250g",
    sizes: sizes ?? [],
    description: (row.description as string) ?? "",
    ingredients: ingredients ? ingredients.join(", ") : "",
    shelfLife: (row.shelf_life as string) ?? "",
    isVeg: (row.is_veg as boolean) ?? true,
    isBestseller: (row.is_bestseller as boolean) ?? false,
    isNew: (row.is_new as boolean) ?? false,
  }
}

const PRODUCT_COLUMNS =
  "id, name, slug, price, original_price, rating, reviews_count, image, images, badge, category, weight, sizes, description, ingredients, shelf_life, storage_info, is_veg, is_bestseller, is_new, is_active"

/**
 * Fetch all active products
 */
export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching products:", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

/**
 * Fetch a single product by slug
 */
export async function fetchProductBySlug(
  slug: string
): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return null
  }

  return mapRowToProduct(data)
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(
  category: string
): Promise<Product[]> {
  if (category === "All") return fetchProducts()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("category", category)
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching products by category:", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

/**
 * Fetch featured products for the homepage.
 * Returns top-rated products from EVERY category so all filter tabs are populated.
 * Bestsellers/highest-rated products appear first within each category.
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()

  // Fetch top products from each tab category (up to 8 per category) sorted
  // by bestseller status first, then rating, so the "All" tab shows the best.
  const categories = ["Sweets", "Pickles", "Snacks", "Podis"]
  const perCategory = 8

  const results = await Promise.all(
    categories.map((cat) =>
      supabase
        .from("products")
        .select(PRODUCT_COLUMNS)
        .eq("is_active", true)
        .eq("category", cat)
        .order("is_bestseller", { ascending: false })
        .order("rating", { ascending: false })
        .limit(perCategory)
    )
  )

  const products: Product[] = []
  for (const { data, error } of results) {
    if (error) {
      console.error("Error fetching featured products:", error.message)
      continue
    }
    products.push(...(data ?? []).map(mapRowToProduct))
  }

  return products
}

/**
 * Fetch related products (same category, excluding current product)
 */
export async function fetchRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("id", product.id)
    .order("rating", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching related products:", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

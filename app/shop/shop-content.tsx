"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  ShoppingBag,
  Heart,
  Eye,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { categories, type Category, type Product } from "@/lib/products"
import { useCart } from "@/lib/cart-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "newest"

function ShopContent({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams()
  const initialCategory = (searchParams.get("category") || "All") as Category

  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory)
  const [searchQuery, setSearchQuery] = useState("")

  // Sync category and search from URL when navigating from other pages
  useEffect(() => {
    const urlCategory = (searchParams.get("category") || "All") as Category
    setActiveCategory(urlCategory)
    const urlSearch = searchParams.get("search") || ""
    setSearchQuery(urlSearch)
  }, [searchParams])
  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500])
  const [showVegOnly, setShowVegOnly] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    // Price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Veg only
    if (showVegOnly) {
      result = result.filter((p) => p.isVeg)
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
    }

    return result
  }, [allProducts, activeCategory, searchQuery, sortBy, priceRange, showVegOnly])

  const clearFilters = () => {
    setActiveCategory("All")
    setSearchQuery("")
    setSortBy("featured")
    setPriceRange([0, 1500])
    setShowVegOnly(false)
  }

  const hasActiveFilters =
    activeCategory !== "All" ||
    searchQuery.trim() !== "" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 1500 ||
    showVegOnly

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="font-serif font-bold text-foreground mb-3 text-sm uppercase tracking-widest">
          {"Search"}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-serif font-bold text-foreground mb-3 text-sm uppercase tracking-widest">
          {"Categories"}
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? allProducts.length
                : allProducts.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-xs ${
                    activeCategory === cat
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {`(${count})`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-serif font-bold text-foreground mb-3 text-sm uppercase tracking-widest">
          {"Price Range"}
        </h3>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0] || ""}
            onChange={(e) =>
              setPriceRange([Number(e.target.value) || 0, priceRange[1]])
            }
            className="bg-background border-border text-sm"
          />
          <span className="text-muted-foreground">{"to"}</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1] || ""}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value) || 1500])
            }
            className="bg-background border-border text-sm"
          />
        </div>
      </div>

      {/* Veg only toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${
              showVegOnly ? "bg-primary" : "bg-border"
            }`}
            onClick={() => setShowVegOnly(!showVegOnly)}
            role="switch"
            aria-checked={showVegOnly}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-all duration-300 ${
                showVegOnly ? "left-5" : "left-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
            {"100% Vegetarian Only"}
          </span>
        </label>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-3.5 w-3.5 mr-2" />
          {"Clear All Filters"}
        </Button>
      )}
    </div>
  )

  return (
    <>
      <PageHeader
        title={activeCategory === "All" ? "All Products" : activeCategory}
        subtitle="Handcrafted traditional Andhra-Telangana delicacies made with love and heritage recipes."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />

      <section className="py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex gap-10">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-28">
                <FilterSidebar />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  {"Showing "}
                  <span className="font-semibold text-foreground">
                    {filteredProducts.length}
                  </span>
                  {" products"}
                </p>

                <div className="flex items-center gap-3">
                  {/* Mobile filter button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="lg:hidden border-border"
                      >
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        {"Filters"}
                        {hasActiveFilters && (
                          <span className="ml-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {"!"}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 bg-background p-6 overflow-y-auto">
                      <h2 className="font-serif font-bold text-lg mb-6">{"Filters"}</h2>
                      <FilterSidebar />
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onValueChange={(val) => setSortBy(val as SortOption)}
                  >
                    <SelectTrigger className="w-44 bg-background border-border text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">{"Featured"}</SelectItem>
                      <SelectItem value="price-low">
                        {"Price: Low to High"}
                      </SelectItem>
                      <SelectItem value="price-high">
                        {"Price: High to Low"}
                      </SelectItem>
                      <SelectItem value="rating">{"Highest Rated"}</SelectItem>
                      <SelectItem value="newest">{"Newest First"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filter tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {activeCategory !== "All" && (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 pr-1.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {activeCategory}
                      <button
                        onClick={() => setActiveCategory("All")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery.trim() && (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 pr-1.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {`"${searchQuery}"`}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {showVegOnly && (
                    <Badge
                      variant="secondary"
                      className="gap-1.5 pr-1.5 bg-primary/10 text-primary border-primary/20"
                    >
                      {"Veg Only"}
                      <button
                        onClick={() => setShowVegOnly(false)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Product grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-2">
                    {"No products found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {"Try adjusting your filters or search query."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {"Clear All Filters"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ShopProductCard({
  product,
}: {
  product: Product
}) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedSize, setSelectedSize] = useState(0)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { add } = useCart()

  const currentVariant = product.sizes[selectedSize]

  const handleAddToCart = () => {
    add(product.id, currentVariant.size, currentVariant.price, 1, {
      name: product.name,
      slug: product.slug,
      image: product.image,
    })
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1200)
  }

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold text-xs px-3 py-1 rounded-full">
            {product.badge}
          </Badge>
          {currentVariant.originalPrice && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-bold text-xs px-2 py-1 rounded-full">
              {`-${Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100)}%`}
            </Badge>
          )}
          <div
            className={`absolute inset-0 bg-charcoal/20 flex items-center justify-center gap-3 transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
              }}
              className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isWishlisted ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/shop/${product.slug}`)
              }}
              className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-card hover:scale-110"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 font-semibold">
          {product.category}
        </p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-serif font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating)
                    ? "fill-saffron text-saffron"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {`(${product.reviews})`}
          </span>
        </div>

        {/* Size selector */}
        {product.sizes.length > 1 && (
          <div className="flex gap-1.5 mb-3">
            {product.sizes.map((variant, i) => (
              <button
                key={variant.size}
                onClick={() => setSelectedSize(i)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedSize === i
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-foreground/60 hover:bg-secondary/80 border border-border"
                }`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              {`\u20B9${currentVariant.price}`}
            </span>
            {currentVariant.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {`\u20B9${currentVariant.originalPrice}`}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`rounded-full h-9 px-3 transition-all duration-300 hover:scale-105 ${
              addedFeedback
                ? "bg-green-600 text-white hover:bg-green-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="ml-1.5 text-xs font-semibold">
              {addedFeedback ? "Added!" : "Add"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Suspense } from "react"

export function ShopPageClient({ allProducts }: { allProducts: Product[] }) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted-foreground">{"Loading..."}</div>}>
        <ShopContent allProducts={allProducts} />
      </Suspense>
      <Footer />
    </main>
  )
}

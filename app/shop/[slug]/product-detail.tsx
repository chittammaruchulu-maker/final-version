"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Leaf,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-store"

const fakeReviews = [
  {
    name: "Priya Reddy",
    location: "Hyderabad",
    rating: 5,
    date: "2 weeks ago",
    text: "Absolutely amazing! Tastes exactly like my grandmother used to make. The flavors are authentic and the quality is top-notch. Will definitely order again.",
  },
  {
    name: "Ravi Kumar",
    location: "Dallas, USA",
    rating: 5,
    date: "1 month ago",
    text: "Being an NRI, I miss home food every day. This product brought back so many memories. Packaging was excellent and arrived fresh.",
  },
  {
    name: "Sunitha Devi",
    location: "Bangalore",
    rating: 4,
    date: "3 weeks ago",
    text: "Very tasty and traditional. Loved the authentic flavor. Would appreciate a larger pack option. Overall a wonderful product.",
  },
  {
    name: "Venkat Rao",
    location: "Chennai",
    rating: 5,
    date: "1 week ago",
    text: "The best I have ever tasted from any online store. Fresh, flavorful, and packed with love. My whole family enjoyed it!",
  },
]

interface ProductDetailPageProps {
  product: Product | null
  relatedProducts: Product[]
}

export default function ProductDetailPage({ product, relatedProducts }: ProductDetailPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedSize, setSelectedSize] = useState(0)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { add } = useCart()

  const currentVariant = product ? product.sizes[selectedSize] : null

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-serif text-foreground mb-4">
              {"Product Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {"The product you are looking for does not exist."}
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                {"Back to Shop"}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-secondary/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {"Home"}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href="/shop"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {"Shop"}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {product.category}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product section */}
      <section className="py-10 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30 border border-border">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {discountPercent && (
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold text-sm px-3 py-1.5 rounded-full">
                    {`-${discountPercent}% OFF`}
                  </Badge>
                )}
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-semibold text-sm px-3 py-1.5 rounded-full">
                  {product.badge}
                </Badge>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs uppercase tracking-widest"
                >
                  {product.category}
                </Badge>
                {product.isVeg && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-700 border-green-500/20 text-xs"
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    {"Vegetarian"}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-saffron text-saffron"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground">
                  {product.rating}
                </span>
                <span className="text-muted-foreground text-sm">
                  {`(${product.reviews} reviews)`}
                </span>
              </div>

              {/* Old static price removed - dynamic price shown above size selector */}

              <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                {product.description}
              </p>

              {/* Price (dynamic based on selected size) */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {`\u20B9${currentVariant!.price}`}
                </span>
                {currentVariant!.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {`\u20B9${currentVariant!.originalPrice}`}
                    </span>
                    <Badge className="bg-accent text-accent-foreground font-bold rounded-full">
                      {`Save \u20B9${currentVariant!.originalPrice - currentVariant!.price}`}
                    </Badge>
                  </>
                )}
              </div>

              {/* Weight / Size */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">
                  {"Weight / Size"}
                </p>
                <div className="flex gap-2">
                  {product.sizes.map((variant, i) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedSize(i)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                        selectedSize === i
                          ? "border-2 border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-2 border-border text-foreground/60 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  onClick={() => {
                    add(product.id, currentVariant!.size, currentVariant!.price, quantity, {
                      name: product.name,
                      slug: product.slug,
                      image: product.image,
                    })
                    setAddedFeedback(true)
                    setTimeout(() => setAddedFeedback(false), 1500)
                  }}
                  className={`flex-1 rounded-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-xl ${
                    addedFeedback
                      ? "bg-green-600 text-white hover:bg-green-600 hover:shadow-green-600/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {addedFeedback
                    ? "Added to Cart!"
                    : `Add to Cart - \u20B9${currentVariant!.price * quantity}`}
                </Button>

                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      isWishlisted
                        ? "fill-primary text-primary"
                        : "text-foreground/70"
                    }`}
                  />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-secondary/50 rounded-2xl border border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    {"Free Delivery"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"Above \u20B9500"}
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    {"100% Authentic"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"Guaranteed"}
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">
                    {"Easy Returns"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"7-day policy"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Details, Ingredients, Reviews */}
          <div className="mt-16 lg:mt-24">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-auto p-0 gap-8">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-4 px-0 font-semibold text-base data-[state=active]:shadow-none"
                >
                  {"Product Details"}
                </TabsTrigger>
                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-4 px-0 font-semibold text-base data-[state=active]:shadow-none"
                >
                  {"Ingredients"}
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-4 px-0 font-semibold text-base data-[state=active]:shadow-none"
                >
                  {`Reviews (${product.reviews})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="pt-8">
                <div className="max-w-3xl space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {"Weight"}
                      </p>
                      <p className="font-semibold text-foreground">
                        {product.weight}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {"Shelf Life"}
                      </p>
                      <p className="font-semibold text-foreground">
                        {product.shelfLife}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {"Category"}
                      </p>
                      <p className="font-semibold text-foreground">
                        {product.category}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {"Diet"}
                      </p>
                      <p className="font-semibold text-foreground">
                        {product.isVeg ? "Pure Vegetarian" : "Non-Vegetarian"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="pt-8">
                <div className="max-w-3xl space-y-6">
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {"All our products are made with carefully sourced, premium-quality ingredients. No artificial preservatives, colors, or flavors."}
                  </p>
                  <div className="p-6 bg-secondary/50 rounded-2xl border border-border">
                    <h4 className="font-serif font-bold text-foreground mb-3">
                      {"Ingredients"}
                    </h4>
                    <p className="text-foreground leading-relaxed">
                      {product.ingredients}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                    <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {"100% Natural & Handmade"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {"Made without any artificial preservatives, colors, or flavors. Cold-pressed oils and farm-fresh ingredients only."}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-8">
                <div className="max-w-3xl space-y-6">
                  {/* Summary */}
                  <div className="flex items-center gap-6 p-6 bg-secondary/50 rounded-2xl border border-border">
                    <div className="text-center">
                      <p className="text-4xl font-bold font-serif text-foreground">
                        {product.rating}
                      </p>
                      <div className="flex items-center gap-0.5 mt-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-saffron text-saffron"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {`${product.reviews} reviews`}
                      </p>
                    </div>
                    <div className="h-16 w-px bg-border" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {"Our customers love this product! Based on verified purchases from across India and abroad."}
                    </p>
                  </div>

                  {/* Individual reviews */}
                  <div className="space-y-5">
                    {fakeReviews.map((review) => (
                      <div
                        key={review.name}
                        className="p-5 bg-card rounded-xl border border-border"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {review.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {review.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.location}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-saffron text-saffron"
                                  : "text-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-primary" />
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
                  {"You May Also Like"}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/shop/${rp.slug}`}
                    className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={rp.image}
                        alt={rp.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold text-xs px-3 py-1 rounded-full">
                        {rp.badge}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {rp.category}
                      </p>
                      <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {rp.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {`\u20B9${rp.price}`}
                        </span>
                        {rp.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {`\u20B9${rp.originalPrice}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MarqueeBanner } from "@/components/marquee-banner"
import { Categories } from "@/components/categories"
import { FeaturedProducts } from "@/components/featured-products"
import { StorySection } from "@/components/story-section"
import { ProcessSection } from "@/components/process-section"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { fetchFeaturedProducts } from "@/lib/supabase/products"

export default async function Home() {
  const featuredProducts = await fetchFeaturedProducts()

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <MarqueeBanner />
      <Categories />
      <FeaturedProducts products={featuredProducts} />
      <StorySection />
      <ProcessSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  )
}

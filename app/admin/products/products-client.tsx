"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Plus, Pencil, Trash2, Search, Loader2, X, Tag, Star,
  Package, AlertCircle, ChevronDown, ToggleLeft, ToggleRight,
  RefreshCw, Eye, Grid, List, Check, Upload
} from "lucide-react"
import Image from "next/image"
import { saveProduct as saveProductAction, deleteProduct as deleteProductAction, toggleProductActive, getProducts } from "./actions"
import ImageUploader from "./image-uploader"

interface SizeVariant { size: string; price: number; originalPrice: number | null }
interface Product {
  id: string; name: string; slug: string; price: number; original_price: number | null
  description: string | null; short_description: string | null; category: string
  image: string | null; images: string[]; gallery: string[]; badge: string | null
  weight: string; rating: number; reviews_count: number; is_bestseller: boolean
  is_new: boolean; is_active: boolean; is_veg: boolean; sizes: SizeVariant[]
  ingredients: string[]; shelf_life: string | null; storage_info: string | null
  stock_quantity: number | null
}

const emptyProduct: Omit<Product, "id"> = {
  name: "", slug: "", price: 0, original_price: null, description: "", short_description: "",
  category: "Sweets", image: null, images: [], gallery: [], badge: "", weight: "250g",
  rating: 4.5, reviews_count: 0, is_bestseller: false, is_new: false, is_active: true,
  is_veg: true, sizes: [{ size: "250g", price: 0, originalPrice: null }],
  ingredients: [], shelf_life: "30 days", storage_info: "Store in cool, dry place", stock_quantity: null,
}

const categories = ["All", "Sweets", "Pickles", "Snacks", "Podis", "Gift Packs"]

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(Math.round(n))

export default function AdminProductsPage({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [ingredientsInput, setIngredientsInput] = useState("")
  const [newSize, setNewSize] = useState<SizeVariant>({ size: "", price: 0, originalPrice: null })

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }, [])

  // Only fetch on mount if no server-side data was provided
  useEffect(() => { if (initialProducts.length === 0) loadProducts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setEditProduct(null)
    setForm(emptyProduct)
    setIngredientsInput("")
    setError("")
    setFormOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setForm({ ...p })
    setIngredientsInput((p.ingredients || []).join(", "))
    setError("")
    setFormOpen(true)
  }

  const closeForm = () => { setFormOpen(false); setEditProduct(null); setError("") }

  const handleField = (key: keyof Omit<Product, "id">, value: unknown) => {
    setForm(f => ({
      ...f,
      [key]: value,
      ...(key === "name" && !editProduct ? { slug: slug(String(value)) } : {}),
    }))
  }

  const saveProduct = async () => {
    if (!form.name.trim()) { setError("Product name is required."); return }
    if (form.price <= 0 && form.sizes.length === 0) { setError("Add at least one size/price."); return }
    setSaving(true); setError("")
    const payload = {
      ...form,
      ingredients: ingredientsInput.split(",").map(s => s.trim()).filter(Boolean),
      price: Number(form.sizes[0]?.price || form.price),
      ...(editProduct ? { id: editProduct.id } : {}),
    }
    try {
      await saveProductAction(payload)
      setSuccess(editProduct ? "Product updated!" : "Product created!")
      setTimeout(() => setSuccess(""), 3000)
      closeForm()
      loadProducts()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    setDeleting(id)
    try {
      await deleteProductAction(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {}
    setDeleting(null)
  }

  const toggleActive = async (p: Product) => {
    try {
      await toggleProductActive(p.id, !p.is_active)
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    } catch {}
  }

  const addSize = () => {
    if (!newSize.size.trim() || newSize.price <= 0) return
    setForm(f => ({ ...f, sizes: [...f.sizes, { ...newSize }] }))
    setNewSize({ size: "", price: 0, originalPrice: null })
  }

  const removeSize = (i: number) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }))

  const updateSize = (i: number, field: keyof SizeVariant, value: string | number | null) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.map((s, idx) => idx === i ? { ...s, [field]: value } : s),
    }))
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "All" || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const lowStock = products.filter(p => (p.stock_quantity ?? 999) < 5).length
  const inactive = products.filter(p => !p.is_active).length

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Main Products Panel ── */}
      <div className={`flex flex-col flex-1 overflow-hidden ${formOpen ? "hidden lg:flex" : ""}`}>

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-card border-b border-border">
          <div className="flex items-center gap-2 p-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={() => setRefreshing(true) || loadProducts()} disabled={refreshing}
              className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 transition-colors">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setViewMode(v => v === "list" ? "grid" : "list")}
              className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground transition-colors">
              {viewMode === "list" ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />Add
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-3 pb-3 overflow-x-auto">
            {categories.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  categoryFilter === c ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}>
                {c} ({c === "All" ? products.length : products.filter(p => p.category === c).length})
              </button>
            ))}
          </div>

          {/* Summary strip */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filtered.length}</strong> products</span>
            {lowStock > 0 && <span className="text-amber-600"><AlertCircle className="h-3 w-3 inline mr-0.5" /><strong>{lowStock}</strong> low stock</span>}
            {inactive > 0 && <span className="text-red-500"><strong>{inactive}</strong> inactive</span>}
            {success && <span className="text-emerald-600 ml-auto flex items-center gap-1"><Check className="h-3 w-3" />{success}</span>}
          </div>
        </div>

        {/* Products content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Package className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">No products found</p>
              <button onClick={openNew} className="text-xs text-primary hover:underline">Add your first product</button>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["Product", "Category", "Price", "Stock", "Status", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ${i === 1 ? "hidden md:table-cell" : ""} ${i === 2 ? "hidden sm:table-cell" : ""} ${i === 3 ? "hidden lg:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-border bg-muted flex-shrink-0 overflow-hidden">
                            {p.image ? (
                              <Image src={p.image} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {p.is_bestseller && <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">Bestseller</span>}
                              {p.is_new && <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-semibold">New</span>}
                              {p.is_veg && <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-semibold">Veg</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm font-bold text-foreground">₹{fmt(p.price)}</p>
                        {p.original_price && <p className="text-[10px] text-muted-foreground line-through">₹{fmt(p.original_price)}</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {p.stock_quantity !== null ? (
                          <span className={`text-xs font-semibold ${p.stock_quantity < 5 ? "text-red-600" : "text-emerald-600"}`}>
                            {p.stock_quantity < 5 ? <AlertCircle className="h-3 w-3 inline mr-0.5" /> : null}
                            {p.stock_quantity} left
                          </span>
                        ) : <span className="text-xs text-muted-foreground">Unlimited</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(p)} className="flex items-center gap-1.5 transition-colors">
                          {p.is_active
                            ? <span className="flex items-center gap-1 text-xs text-emerald-700"><ToggleRight className="h-4 w-4 text-emerald-600" />Active</span>
                            : <span className="flex items-center gap-1 text-xs text-muted-foreground"><ToggleLeft className="h-4 w-4" />Inactive</span>
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                            {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p => (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-muted">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground/30" /></div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {!p.is_active && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Inactive</span>}
                      {p.is_bestseller && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Best</span>}
                    </div>
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 bg-white rounded-lg text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id} className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                        {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    <p className="text-sm font-bold text-primary mt-1">₹{fmt(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel: Product Form ── */}
      {formOpen && (
        <div className="w-full lg:w-[460px] flex flex-col border-l border-border bg-background overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
            <p className="text-sm font-bold text-foreground">{editProduct ? "Edit Product" : "Add New Product"}</p>
            <button onClick={closeForm} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</p>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Product Name *</label>
                <input value={form.name} onChange={e => handleField("name", e.target.value)}
                  placeholder="e.g. Mango Pickle"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Slug</label>
                <input value={form.slug} onChange={e => handleField("slug", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
                  <select value={form.category} onChange={e => handleField("category", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                    {categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Badge</label>
                  <input value={form.badge || ""} onChange={e => handleField("badge", e.target.value)}
                    placeholder="e.g. New, Hot, Sale"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Short Description</label>
                <input value={form.short_description || ""} onChange={e => handleField("short_description", e.target.value)}
                  placeholder="One-line summary"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Full Description</label>
                <textarea value={form.description || ""} onChange={e => handleField("description", e.target.value)}
                  rows={3} placeholder="Detailed product description"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
            </section>

            {/* Image */}
            <section className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Image</p>
              <ImageUploader
                value={form.image || null}
                onChange={url => handleField("image", url)}
              />
            </section>

            {/* Sizes & Pricing */}
            <section className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sizes & Pricing</p>
              {form.sizes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.size}
                    onChange={e => updateSize(i, "size", e.target.value)}
                    placeholder="250g"
                    className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  />
                  <input
                    type="number"
                    value={s.price || ""}
                    onChange={e => updateSize(i, "price", Number(e.target.value))}
                    placeholder="Price"
                    className="w-20 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="number"
                    value={s.originalPrice || ""}
                    onChange={e => updateSize(i, "originalPrice", e.target.value ? Number(e.target.value) : null)}
                    placeholder="MRP"
                    className="w-20 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={() => removeSize(i)} className="text-red-500 hover:text-red-700 flex-shrink-0 p-1">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newSize.size} onChange={e => setNewSize(p => ({ ...p, size: e.target.value }))}
                  placeholder="250g" className="flex-1 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="number" value={newSize.price || ""} onChange={e => setNewSize(p => ({ ...p, price: Number(e.target.value) }))}
                  placeholder="Price" className="w-20 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="number" value={newSize.originalPrice || ""} onChange={e => setNewSize(p => ({ ...p, originalPrice: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="MRP" className="w-20 px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={addSize} className="px-2 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            {/* Details */}
            <section className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Shelf Life</label>
                  <input value={form.shelf_life || ""} onChange={e => handleField("shelf_life", e.target.value)}
                    placeholder="30 days"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Stock Qty</label>
                  <input type="number" value={form.stock_quantity ?? ""} onChange={e => handleField("stock_quantity", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Storage Info</label>
                <input value={form.storage_info || ""} onChange={e => handleField("storage_info", e.target.value)}
                  placeholder="Store in cool, dry place"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Ingredients (comma separated)</label>
                <input value={ingredientsInput} onChange={e => setIngredientsInput(e.target.value)}
                  placeholder="Mango, Salt, Red Chilli..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </section>

            {/* Flags */}
            <section className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Flags</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "is_active", label: "Active", desc: "Visible on store" },
                  { key: "is_bestseller", label: "Bestseller", desc: "Show bestseller badge" },
                  { key: "is_new", label: "New", desc: "Show new badge" },
                  { key: "is_veg", label: "Vegetarian", desc: "Pure veg product" },
                ] as const).map(({ key, label, desc }) => (
                  <button key={key} onClick={() => handleField(key, !form[key])}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${form[key] ? "bg-primary/5 border-primary text-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form[key] ? "bg-primary border-primary" : "border-border"}`}>
                      {form[key] && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-[9px] opacity-70">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-card flex-shrink-0">
            <button onClick={closeForm} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button onClick={saveProduct} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editProduct ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

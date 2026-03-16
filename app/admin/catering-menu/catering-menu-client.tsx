"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, X, Check, Loader2, GripVertical, ChefHat } from "lucide-react"
import { addCateringItem, updateCateringItem, deleteCateringItem } from "./actions"

interface MenuItem {
  id: string
  category: string
  item_name: string
  sort_order: number
  is_active: boolean
}

type GroupedMenu = Record<string, MenuItem[]>

export default function AdminCateringMenuPage({ initialItems = [] }: { initialItems?: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Add item state (global panel)
  const [addCategory, setAddCategory] = useState("")
  const [addItemName, setAddItemName] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  // Per-category inline add state: category -> draft name
  const [inlineAddCategory, setInlineAddCategory] = useState<string | null>(null)
  const [inlineAddName, setInlineAddName] = useState("")
  const [inlineAdding, setInlineAdding] = useState(false)

  // Edit state
  const [editId, setEditId] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState("")
  const [editName, setEditName] = useState("")

  // Add category modal
  const [addCategoryModal, setAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // Data is seeded server-side via initialItems — no client fetch needed on mount

  const grouped: GroupedMenu = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as GroupedMenu)

  const categories = Object.keys(grouped).sort()

  const handleAdd = async () => {
    const cat = addCategory === "__new__" ? customCategory.trim() : addCategory.trim()
    const name = addItemName.trim()
    if (!cat || !name) return
    setAddingItem(true)
    try {
      const maxSort = items.filter(i => i.category === cat).reduce((m, i) => Math.max(m, i.sort_order), 0)
      const newItem = await addCateringItem(cat, name, maxSort + 1)
      setItems(prev => [...prev, newItem])
      setAddItemName("")
      if (addCategory === "__new__") { setAddCategory(cat); setCustomCategory("") }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add item")
    } finally {
      setAddingItem(false)
    }
  }

  const handleEditSave = async (id: string) => {
    if (!editName.trim() || !editCategory.trim()) return
    setSaving(true)
    try {
      const updated = await updateCateringItem(id, { item_name: editName.trim(), category: editCategory.trim() })
      setItems(prev => prev.map(i => i.id === id ? updated : i))
      setEditId(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item: MenuItem) => {
    try {
      const updated = await updateCateringItem(item.id, { is_active: !item.is_active })
      setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return
    try {
      await deleteCateringItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const handleInlineAdd = async (category: string) => {
    const name = inlineAddName.trim()
    if (!name) return
    setInlineAdding(true)
    try {
      const maxSort = items.filter(i => i.category === category).reduce((m, i) => Math.max(m, i.sort_order), 0)
      const newItem = await addCateringItem(category, name, maxSort + 1)
      setItems(prev => [...prev, newItem])
      setInlineAddName("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add item")
    } finally {
      setInlineAdding(false)
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    setAddCategory(newCategoryName.trim())
    setAddCategoryModal(false)
    setNewCategoryName("")
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Catering Menu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} items across {categories.length} categories</p>
        </div>
        <button
          onClick={() => setAddCategoryModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <X className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Add new item row */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add New Item</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={addCategory}
              onChange={e => setAddCategory(e.target.value)}
              className="h-9 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select category...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">+ New category...</option>
            </select>
            {addCategory === "__new__" && (
              <input
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="New category name"
                className="mt-1 h-9 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>
          <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground">Item Name</label>
            <input
              value={addItemName}
              onChange={e => setAddItemName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Gutti Vankaya Koora"
              className="h-9 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={addingItem || !addItemName.trim() || !addCategory || (addCategory === "__new__" && !customCategory.trim())}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Item
          </button>
        </div>
      </div>

      {/* Menu by category */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ChefHat className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">No menu items yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add your first category and item above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map(category => (
            <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground text-sm">{category}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {grouped[category].length} items
                </span>
              </div>

              {/* Items */}
              <ul className="divide-y divide-border">
                {grouped[category].map(item => (
                  <li key={item.id} className={`flex items-center gap-2 px-4 py-2.5 group transition-colors hover:bg-muted/20 ${!item.is_active ? "opacity-50" : ""}`}>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />

                    {editId === item.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="h-7 px-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleEditSave(item.id); if (e.key === "Escape") setEditId(null) }}
                          autoFocus
                          className="flex-1 h-7 px-2 text-xs border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={() => handleEditSave(item.id)} disabled={saving} className="text-green-600 hover:text-green-700">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`flex-1 text-sm text-foreground ${!item.is_active ? "line-through" : ""}`}>
                          {item.item_name}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleActive(item)}
                            title={item.is_active ? "Hide item" : "Show item"}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${item.is_active ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}
                          >
                            {item.is_active ? "✓" : "○"}
                          </button>
                          <button
                            onClick={() => { setEditId(item.id); setEditName(item.item_name); setEditCategory(item.category) }}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* Per-category inline add */}
              <div className="px-4 py-2.5 border-t border-border bg-muted/10">
                {inlineAddCategory === category ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={inlineAddName}
                      onChange={e => setInlineAddName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleInlineAdd(category)
                        if (e.key === "Escape") { setInlineAddCategory(null); setInlineAddName("") }
                      }}
                      placeholder="Item name..."
                      autoFocus
                      className="flex-1 h-7 px-2.5 text-xs border border-primary/50 rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => handleInlineAdd(category)}
                      disabled={inlineAdding || !inlineAddName.trim()}
                      className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {inlineAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Add
                    </button>
                    <button
                      onClick={() => { setInlineAddCategory(null); setInlineAddName("") }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setInlineAddCategory(category); setInlineAddName("") }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {addCategoryModal && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-foreground mb-4">New Category</h3>
            <input
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCategory()}
              placeholder="e.g. Rice Dishes"
              autoFocus
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setAddCategoryModal(false); setNewCategoryName("") }}
                className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import {
  Search, Plus, Loader2, Trash2, Shield, User,
  Mail, Phone, RefreshCw, X, Eye, EyeOff, CheckCircle2, AlertCircle
} from "lucide-react"

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
}

const roleBadge = (role: string) =>
  role === "admin"
    ? "bg-primary/10 text-primary border-primary/20"
    : "bg-muted text-muted-foreground border-border"

export default function AdminUsersClient({ initialProfiles = [] }: { initialProfiles?: Profile[] }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<{ id: string; role: string } | null>(null)

  const [form, setForm] = useState({
    email: "", password: "", full_name: "", phone: "", role: "customer",
  })

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      setProfiles(data.profiles || [])
    }
    setLoading(false)
  }, [])

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || "").includes(search)
    const matchRole = roleFilter === "all" || p.role === roleFilter
    return matchSearch && matchRole
  })

  const adminCount = profiles.filter(p => p.role === "admin").length
  const customerCount = profiles.filter(p => p.role === "customer").length

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")
    setFormLoading(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Failed to create user.")
      } else {
        setFormSuccess(`${form.role === "admin" ? "Admin" : "Customer"} account created for ${form.email}`)
        setForm({ email: "", password: "", full_name: "", phone: "", role: "customer" })
        await refresh()
        setTimeout(() => { setShowForm(false); setFormSuccess("") }, 2000)
      }
    } catch {
      setFormError("Network error. Please try again.")
    }
    setFormLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setProfiles(prev => prev.filter(p => p.id !== id))
    }
    setDeletingId(null)
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    setEditingRole({ id, role: newRole })
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    })
    if (res.ok) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
    }
    setEditingRole(null)
  }

  return (
    <div className="p-4 lg:p-6 h-[calc(100vh-64px)] overflow-y-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add and manage admin and customer accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => { setShowForm(true); setFormError(""); setFormSuccess("") }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: profiles.length, icon: User, color: "text-foreground", bg: "bg-muted" },
          { label: "Admins", value: adminCount, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
          { label: "Customers", value: customerCount, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-10 px-3 text-sm border border-border rounded-lg bg-card"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins only</option>
          <option value="customer">Customers only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  {search || roleFilter !== "all" ? "No users match your filter." : "No users yet."}
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary uppercase">
                        {(p.full_name || p.email || "?").charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{p.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 flex-shrink-0" />{p.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Phone className="h-3 w-3" />{p.phone || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {editingRole?.id === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <select
                      value={p.role}
                      onChange={e => handleRoleChange(p.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${roleBadge(p.role)} bg-transparent cursor-pointer`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(p.id, p.full_name || p.email || p.id)}
                    disabled={deletingId === p.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Add New User</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
                  <div className="flex gap-2">
                    {["customer", "admin"].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, role: r }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          form.role === r
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {r === "admin" ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sanjeeva Reddy"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email <span className="text-destructive">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="w-full h-10 pl-3 pr-10 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{formError}</p>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">{formSuccess}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-10 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 h-10 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

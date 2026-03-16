"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, Calendar, Users, Package, MessageSquare, Eye, Check, Archive, Loader2, Filter, Bell } from "lucide-react"

interface FormSubmission {
  id: string
  form_type: "contact" | "catering"
  status: "new" | "read" | "replied" | "archived"
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string | null
  event_type: string | null
  guest_count: string | null
  event_date: string | null
  created_at: string
}

interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
  source: string
  status: "active" | "unsubscribed"
}

export default function FormSubmissionsPage({
  initialSubmissions = [],
  initialSubscribers = [],
}: {
  initialSubmissions?: FormSubmission[]
  initialSubscribers?: NewsletterSubscriber[]
}) {
  const [activeTab, setActiveTab] = useState<"submissions" | "newsletter">("submissions")
  const [submissions, setSubmissions] = useState<FormSubmission[]>(initialSubmissions)
  const [subscribers] = useState<NewsletterSubscriber[]>(initialSubscribers)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [subscriberSearch, setSubscriberSearch] = useState("")

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ form_type: filterType, status: filterStatus })
      const res = await fetch(`/api/form-submissions?${params}`)
      const data = await res.json()
      if (data.submissions) setSubmissions(data.submissions)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [filterType, filterStatus])

  const handleStatusChange = async (id: string, status: string) => {
    setStatusUpdating(true)
    try {
      const res = await fetch("/api/form-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: status as FormSubmission["status"] } : s))
        )
      }
    } finally {
      setStatusUpdating(false)
    }
  }

  const selected = submissions.find((s) => s.id === selectedId)
  const newCount = submissions.filter((s) => s.status === "new").length
  const activeSubscribers = subscribers.filter((s) => s.status === "active").length
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">

      {/* Tab switcher */}
      <div className="flex border-b border-border bg-card px-4 pt-3 gap-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === "submissions"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          {"Form Submissions"}
          {newCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
              {newCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("newsletter")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === "newsletter"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          {"Newsletter"}
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-full">
            {activeSubscribers}
          </span>
        </button>
      </div>

      {/* ── Newsletter tab ── */}
      {activeTab === "newsletter" && (
        <div className="flex-1 overflow-hidden flex flex-col bg-background">
          <div className="flex items-center gap-6 px-6 py-4 border-b border-border bg-card flex-shrink-0">
            <div>
              <p className="text-xs text-muted-foreground">{"Total Subscribers"}</p>
              <p className="text-2xl font-bold text-foreground">{subscribers.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{"Active"}</p>
              <p className="text-2xl font-bold text-green-600">{activeSubscribers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{"Unsubscribed"}</p>
              <p className="text-2xl font-bold text-muted-foreground">{subscribers.length - activeSubscribers}</p>
            </div>
            <div className="ml-auto">
              <input
                type="text"
                placeholder="Search email..."
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="h-8 px-3 text-sm border border-border rounded-lg bg-background w-56"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{"#"}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{"Email"}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{"Source"}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{"Subscribed At"}</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{"Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-muted-foreground text-sm">
                      {subscriberSearch ? "No subscribers match your search." : "No subscribers yet."}
                    </td>
                  </tr>
                ) : filteredSubscribers.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-foreground">
                      <a href={`mailto:${sub.email}`} className="hover:text-primary hover:underline">
                        {sub.email}
                      </a>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-secondary text-secondary-foreground">
                        {sub.source || "website"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(sub.subscribed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        sub.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Submissions tab ── */}
      {activeTab === "submissions" && (
        <div className="flex-1 overflow-hidden flex">

          {/* Left panel - list */}
          <div className="w-full lg:w-[420px] border-r border-border flex flex-col bg-card">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif font-bold text-foreground text-lg">{"Form Submissions"}</h2>
                {newCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {newCount} {"New"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs border border-border rounded bg-background"
                >
                  <option value="all">{"All Forms"}</option>
                  <option value="contact">{"Contact Only"}</option>
                  <option value="catering">{"Catering Only"}</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs border border-border rounded bg-background"
                >
                  <option value="all">{"All Status"}</option>
                  <option value="new">{"New"}</option>
                  <option value="read">{"Read"}</option>
                  <option value="replied">{"Replied"}</option>
                  <option value="archived">{"Archived"}</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Filter className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{"No submissions found"}</p>
                </div>
              ) : submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedId(sub.id)
                    if (sub.status === "new") handleStatusChange(sub.id, "read")
                  }}
                  className={`w-full text-left p-4 border-b border-border transition-colors ${
                    selectedId === sub.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/50"
                  } ${sub.status === "new" ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        sub.form_type === "catering" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {sub.form_type}
                      </span>
                      {sub.status === "new" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {new Date(sub.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-foreground mb-1 truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                  {sub.form_type === "catering" && sub.event_type && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {sub.event_type} {"\u00B7"} {sub.guest_count || "\u2014"} {"guests"}
                    </p>
                  )}
                  {sub.form_type === "contact" && sub.subject && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{sub.subject}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel - details */}
          <div className="flex-1 overflow-y-auto bg-background hidden lg:block">
            {selected == null ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{"Select a submission to view details"}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 max-w-3xl mx-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                        selected.form_type === "catering" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {selected.form_type} {"Submission"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selected.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <h2 className="font-serif font-bold text-2xl text-foreground">{selected.name}</h2>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {(["read", "replied", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selected.id, status)}
                      disabled={statusUpdating || selected.status === status}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        selected.status === status
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      } disabled:opacity-50`}
                    >
                      {status === "read" && <Eye className="inline h-3 w-3 mr-1" />}
                      {status === "replied" && <Check className="inline h-3 w-3 mr-1" />}
                      {status === "archived" && <Archive className="inline h-3 w-3 mr-1" />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">{"Email"}</p>
                        <a href={`mailto:${selected.email}`} className="text-sm font-medium text-primary hover:underline">
                          {selected.email}
                        </a>
                      </div>
                    </div>
                    {selected.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{"Phone"}</p>
                          <a href={`tel:${selected.phone}`} className="text-sm font-medium text-primary hover:underline">
                            {selected.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {selected.form_type === "contact" && selected.subject && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{"Subject"}</p>
                      <p className="text-sm font-medium text-foreground">{selected.subject}</p>
                    </div>
                  )}

                  {selected.form_type === "catering" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                      {selected.event_type && (
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{"Event Type"}</p>
                            <p className="text-sm font-medium text-foreground">{selected.event_type}</p>
                          </div>
                        </div>
                      )}
                      {selected.guest_count && (
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{"Guests"}</p>
                            <p className="text-sm font-medium text-foreground">{selected.guest_count}</p>
                          </div>
                        </div>
                      )}
                      {selected.event_date && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{"Event Date"}</p>
                            <p className="text-sm font-medium text-foreground">{selected.event_date}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selected.message && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">{"Message"}</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    {"Reply via Email"}
                  </a>
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors text-center"
                    >
                      {"WhatsApp"}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

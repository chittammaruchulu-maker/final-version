import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"

// GET — list all profiles merged with auth user emails
export async function GET() {
  try {
    const supabase = getServiceClient()

    const [{ data: profiles, error: profilesError }, { data: authData, error: authError }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ])

    if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 })
    if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

    // Build a map of id -> email from auth users
    const emailMap: Record<string, string> = {}
    for (const u of authData?.users || []) {
      emailMap[u.id] = u.email || ""
    }

    // Merge email into each profile
    const merged = (profiles || []).map((p) => ({ ...p, email: emailMap[p.id] || "" }))

    return NextResponse.json({ profiles: merged })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST — create a new user (admin or customer) via Supabase Admin API
export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "email, password and role are required." }, { status: 400 })
    }
    if (!["admin", "customer"].includes(role)) {
      return NextResponse.json({ error: "role must be 'admin' or 'customer'." }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Create the auth user using the admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, phone },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json({ error: "User created but ID not returned." }, { status: 500 })
    }

    // Upsert the profile with the chosen role (email lives in auth.users, not profiles)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: full_name || null,
        phone: phone || null,
        role,
      }, { onConflict: "id" })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH — update a user's role
export async function PATCH(req: NextRequest) {
  try {
    const { id, role, full_name, phone } = await req.json()
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })

    const supabase = getServiceClient()
    const updates: Record<string, string> = {}
    if (role) updates.role = role
    if (full_name !== undefined) updates.full_name = full_name
    if (phone !== undefined) updates.phone = phone

    const { error } = await supabase.from("profiles").update(updates).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE — delete a user by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 })

    const supabase = getServiceClient()
    // Delete from auth (this cascades to profile via FK or trigger)
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

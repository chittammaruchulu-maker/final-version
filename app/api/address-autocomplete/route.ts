import { NextRequest, NextResponse } from "next/server"

// Photon (photon.komoot.io) has far better Indian address/locality coverage
// than raw Nominatim. It uses the same OSM data but with a smarter index.

type PhotonFeature = {
  properties: {
    name?: string
    street?: string
    housenumber?: string
    suburb?: string
    district?: string
    city?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
    countrycode?: string
    osm_value?: string
  }
}

type NominatimItem = {
  display_name: string
  address: {
    house_number?: string
    road?: string
    suburb?: string
    neighbourhood?: string
    amenity?: string
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    state_district?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get("q") || ""
  const city = searchParams.get("city") || ""
  const state = searchParams.get("state") || ""
  const pincode = searchParams.get("pincode") || ""
  const countryCode = searchParams.get("countryCode") || "in"

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Build a context-enriched query so local results rank higher
  const contextQ = [query, city, state, pincode].filter(Boolean).join(", ")

  const headers = {
    "User-Agent": "ChittammaRuchulu/1.0 (food delivery; contact@chittammaruchulu.com)",
    "Accept-Language": "en",
  }

  try {
    // 1. Photon search — great for localities, areas, apartments in India
    // Restrict to India bbox if country is IN for tighter results
    const indiaBbox = "68.1,8.0,97.4,37.6"
    const photonUrl = countryCode === "in"
      ? `https://photon.komoot.io/api/?q=${encodeURIComponent(contextQ)}&limit=8&lang=en&bbox=${indiaBbox}`
      : `https://photon.komoot.io/api/?q=${encodeURIComponent(contextQ)}&limit=8&lang=en`

    // 2. Nominatim as fallback with freeform query
    const nominatimParams = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      limit: "6",
      q: contextQ,
      ...(countryCode && { countrycodes: countryCode }),
    })

    const [photonRes, nominatimRes] = await Promise.allSettled([
      fetch(photonUrl, { headers }),
      fetch(`https://nominatim.openstreetmap.org/search?${nominatimParams}`, { headers }),
    ])

    const results: Array<{
      displayName: string
      street: string
      city: string
      state: string
      postcode: string
      country: string
      countryCode: string
    }> = []

    // Parse Photon results (GeoJSON FeatureCollection)
    if (photonRes.status === "fulfilled" && photonRes.value.ok) {
      const geojson = await photonRes.value.json()
      const features: PhotonFeature[] = geojson.features || []
      for (const f of features) {
        const p = f.properties
        const streetParts = [p.housenumber, p.street || p.name, p.suburb || p.district].filter(Boolean)
        const mainStreet = streetParts.join(", ") || p.name || ""
        const cityName = p.city || p.county || p.district || ""
        const stateName = p.state || ""
        const display = [mainStreet, cityName, stateName, p.postcode, p.country].filter(Boolean).join(", ")
        if (!mainStreet) continue
        results.push({
          displayName: display,
          street: mainStreet,
          city: cityName,
          state: stateName,
          postcode: p.postcode || "",
          country: p.country || "",
          countryCode: (p.countrycode || "").toUpperCase(),
        })
      }
    }

    // Parse Nominatim results as fallback
    if (nominatimRes.status === "fulfilled" && nominatimRes.value.ok) {
      const data: NominatimItem[] = await nominatimRes.value.json()
      for (const item of data) {
        const a = item.address
        const streetParts = [a.house_number, a.road || a.amenity, a.suburb || a.neighbourhood].filter(Boolean)
        const mainStreet = streetParts.join(", ") || ""
        const cityName = a.city || a.town || a.village || a.county || ""
        results.push({
          displayName: item.display_name,
          street: mainStreet,
          city: cityName,
          state: a.state || a.state_district || "",
          postcode: a.postcode || "",
          country: a.country || "",
          countryCode: (a.country_code || "").toUpperCase(),
        })
      }
    }

    // Deduplicate by street+city combo
    const seen = new Set<string>()
    const unique = results.filter((s) => {
      const key = `${s.street}|${s.city}`.toLowerCase()
      if (seen.has(key) || !s.street) return false
      seen.add(key)
      return true
    }).slice(0, 7)

    return NextResponse.json({ results: unique })
  } catch (err) {
    console.error("[v0] address autocomplete error:", err)
    return NextResponse.json({ results: [] })
  }
}

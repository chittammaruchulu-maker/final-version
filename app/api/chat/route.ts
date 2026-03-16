import { getServiceClient } from "@/lib/supabase/service"

export const maxDuration = 30

const PRODUCT_COLS = "id, name, slug, price, original_price, image, category, sizes, badge, is_veg, is_bestseller"

const SYSTEM_PROMPT = `You are Chittamma, a warm helpful assistant for Chittamma Ruchulu — an authentic Andhra-Telangana traditional food brand.

Be friendly, concise (2-4 sentences). You help customers:
- Find and recommend products (Pickles, Sweets, Snacks, Podis, Gift Packs)
- Answer questions about ingredients, shelf life, pricing
- Guide them to add items to cart and checkout at /cart

Store policies:
- Delivery charge: ₹99 flat. Free delivery on orders above ₹1500
- Shelf life: pickles 6 months, sweets 30 days, snacks 45 days, podis 3 months
- 100% natural, no preservatives in sweets
- Returns within 7 days

When searching for products, use the search_products or get_bestsellers function.
CRITICAL: When product cards are shown to the customer (i.e. you called a product tool), do NOT list the products again in your text reply. The product cards are already displayed visually. Just write a short intro sentence like "Here are some options for you!" and let the cards do the work. Never repeat product names, prices or URLs in text when cards are available.`

const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search for products by name, category or keyword",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Product name, category (Sweets, Pickles, Snacks, Podis, Gift Packs), or keyword" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_bestsellers",
      description: "Get top bestselling products, optionally filtered by category",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Optional category filter" },
        },
        required: [],
      },
    },
  },
]

async function searchProducts(query: string) {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
    .order("is_bestseller", { ascending: false })
    .limit(6)
  return data || []
}

async function getBestsellers(category?: string) {
  const supabase = getServiceClient()
  let q = supabase
    .from("products")
    .select(PRODUCT_COLS)
    .eq("is_active", true)
    .eq("is_bestseller", true)
    .limit(6)
  if (category) q = q.eq("category", category)
  const { data } = await q
  return data || []
}

function formatProducts(rows: Record<string, unknown>[]) {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.original_price,
    image: p.image,
    category: p.category,
    badge: p.badge || "",
    isVeg: p.is_veg,
    sizes: (p.sizes as Array<{ size: string; price: number }>) || [],
    url: `/products/${p.slug}`,
  }))
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const openaiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ]

  const GW_URL = "https://ai-gateway.vercel.sh/v1/chat/completions"
  const GW_KEY = process.env.AI_GATEWAY_API_KEY

  // First call — may result in tool use
  const response = await fetch(GW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GW_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: openaiMessages,
      tools,
      tool_choice: "auto",
      stream: false,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error("[v0] chat API error:", response.status, err)
    return new Response(JSON.stringify({ error: err }), { status: 500 })
  }

  const data = await response.json()
  const choice = data.choices[0]

  // Handle tool calls
  if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
    const toolMessages: unknown[] = [choice.message]

    for (const tc of choice.message.tool_calls) {
      const args = JSON.parse(tc.function.arguments || "{}")
      let result: Record<string, unknown>[] = []

      if (tc.function.name === "search_products") {
        result = await searchProducts(args.query)
      } else if (tc.function.name === "get_bestsellers") {
        result = await getBestsellers(args.category)
      }

      const products = formatProducts(result)
      toolMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify({ products }),
      })
    }

    // Second call with tool results
    const response2 = await fetch(GW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GW_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [...openaiMessages, ...toolMessages],
        stream: false,
      }),
    })

    const data2 = await response2.json()
    const reply = data2.choices[0].message.content || ""

    // Extract products from tool results to pass along
    const allProducts = toolMessages
      .filter((m) => (m as { role: string }).role === "tool")
      .flatMap((m) => {
        try {
          return JSON.parse((m as { content: string }).content).products || []
        } catch {
          return []
        }
      })

    // Safety net: strip any numbered/bulleted product list lines from reply
    // when product cards are already being shown, to avoid double rendering
    const cleanReply = allProducts.length > 0
      ? reply
          .split("\n")
          .filter((line: string) => !/^\d+\.\s|\^[\-\*]\s/.test(line))
          .join("\n")
          .trim()
      : reply

    return Response.json({ reply: cleanReply, products: allProducts })
  }

  // Plain text response
  return Response.json({ reply: choice.message.content || "", products: [] })
}

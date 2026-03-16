export async function register() {
  // The v0 sandbox runtime injects <Analytics /> into app/layout.tsx which calls
  // JSON.parse("pageview") during SSR, causing a SyntaxError crash.
  // This patches JSON.parse on the server before any module evaluates.
  const originalParse = JSON.parse
  ;(JSON as { parse: typeof JSON.parse }).parse = function (text: string, reviver?: Parameters<typeof JSON.parse>[1]) {
    try {
      return originalParse(text, reviver)
    } catch (e) {
      if (typeof text === "string" && text.indexOf("pageview") !== -1) {
        return {}
      }
      throw e
    }
  }
}

// Safe no-op stub replacing @vercel/analytics to prevent JSON.parse("pageview") crash in v0 sandbox
export function Analytics() { return null }
export function inject() {}
export function track() {}
export function webVitals() {}
export function SpeedInsights() { return null }
export default { Analytics, inject, track, webVitals, SpeedInsights }

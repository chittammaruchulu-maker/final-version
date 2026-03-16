import { readFileSync, writeFileSync } from "fs";

const content = readFileSync("/vercel/share/v0-project/lib/products.ts", "utf-8");

// Extract everything between "export const products: Product[] = [" and the closing "];"
const startMarker = "export const products: Product[] = [";
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.error("Could not find products array start");
  process.exit(1);
}

// Find the matching closing bracket
let depth = 0;
let arrayStart = startIdx + startMarker.length - 1; // position of the [
let arrayEnd = -1;
for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === "[") depth++;
  if (content[i] === "]") {
    depth--;
    if (depth === 0) {
      arrayEnd = i + 1;
      break;
    }
  }
}

const arrayStr = content.substring(arrayStart, arrayEnd);

// Evaluate it as JS (the TS product objects are valid JS)
let products;
try {
  products = eval(arrayStr);
} catch (e) {
  console.error("Failed to eval products array:", e.message);
  process.exit(1);
}

console.log(`Parsed ${products.length} products`);

function esc(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "''");
}

// Generate SQL INSERT
const values = products.map((p) => {
  const sizesJson = JSON.stringify(
    p.sizes.map((s) => ({
      size: s.size,
      price: s.price,
      originalPrice: s.originalPrice ?? null,
    }))
  );

  const imagesArr =
    p.images && p.images.length > 0
      ? `ARRAY[${p.images.map((i) => `'${esc(i)}'`).join(",")}]`
      : "'{}'::text[]";

  const ingredientsList =
    typeof p.ingredients === "string"
      ? p.ingredients.split(", ")
      : Array.isArray(p.ingredients)
        ? p.ingredients
        : [];
  const ingredientsArr =
    ingredientsList.length > 0
      ? `ARRAY[${ingredientsList.map((i) => `'${esc(i)}'`).join(",")}]`
      : "'{}'::text[]";

  return `(
    '${esc(p.id)}', '${esc(p.name)}', '${esc(p.description)}', '${esc(p.name)}',
    '${esc(p.category)}', '${esc(p.image)}', '${esc(p.badge)}',
    ${p.rating}, ${p.reviews}, ${!!p.isBestseller}, ${!!p.isNew}, true,
    '${esc(sizesJson)}'::jsonb, ${ingredientsArr}, '${esc(p.shelfLife)}',
    'Store in cool, dry place', '${esc(p.slug)}', ${p.price},
    ${p.originalPrice == null ? "NULL" : p.originalPrice},
    '${esc(p.weight)}', ${p.isVeg !== false}, ${imagesArr}
  )`;
});

const sql = `-- Auto-generated: seed all products from lib/products.ts
-- Delete existing and re-seed
DELETE FROM public.products;

INSERT INTO public.products (
  id, name, description, short_description, category, image, badge,
  rating, reviews_count, is_bestseller, is_new, is_active,
  sizes, ingredients, shelf_life, storage_info, slug, price,
  original_price, weight, is_veg, images
) VALUES
${values.join(",\n")}
ON CONFLICT (id) DO NOTHING;
`;

writeFileSync("/vercel/share/v0-project/scripts/seed-products.sql", sql);
console.log(`Generated seed SQL with ${products.length} products -> scripts/seed-products.sql`);

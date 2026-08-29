import type { Model } from "mongoose";
import { slugify } from "@/lib/cache/tags";

/**
 * Slug that is unique within a collection. Appends -2, -3, … on collision
 * rather than failing the save on the unique index.
 */
export async function uniqueSlug(
  model: Pick<Model<{ slug: string }>, "findOne">,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base).slice(0, 80) || "item";
  let candidate = root;
  let n = 1;

  for (;;) {
    const existing = await model
      .findOne({ slug: candidate })
      .select("_id")
      .lean<{ _id: unknown } | null>();
    if (!existing || (excludeId && String(existing._id) === excludeId)) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

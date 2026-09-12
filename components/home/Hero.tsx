import { getDestinationCities } from "@/lib/services/public-hotels";
import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache/tags";
import HeroSection from "./HeroSection";

/**
 * Cached UI, not just cached data — same pattern as the other home rails, so
 * the hero is part of the static shell and the search box paints without
 * waiting on the database.
 *
 * The city list feeds the destination suggestions: only cities that actually
 * have a published property, so a suggestion can never lead to no results.
 */
export default async function Hero() {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.home(), tags.hotels());

  // Suggestions are a convenience, not a dependency. The search box is the
  // main conversion path on the site, so a failed city lookup degrades to an
  // ordinary text field rather than taking the hero down with it.
  let cities: string[] = [];
  try {
    cities = (await getDestinationCities()).map((c) => c.city);
  } catch (error) {
    console.error("[home] could not load destination cities:", error);
  }

  return <HeroSection cities={cities} />;
}

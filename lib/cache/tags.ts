/**
 * Every cache tag in one typed place. Using string literals inline is how a
 * revalidation silently stops matching after a rename.
 */
export const tags = {
  /** Homepage content blocks — destinations, promos, featured hotels. */
  home: () => "home",
  /** Every published hotel. Broad; prefer a narrower tag where possible. */
  hotels: () => "hotels",
  /** Published hotels in one city, as used by search. */
  hotelsByCity: (city: string) => `hotels-city-${slug(city)}`,
  /** One hotel's descriptive content. */
  hotel: (hotelId: string) => `hotel-${hotelId}`,
  /** One hotel's room definitions (not availability — that is never cached). */
  rooms: (hotelId: string) => `rooms-${hotelId}`,
  /** One hotel's published reviews. */
  reviews: (hotelId: string) => `reviews-${hotelId}`,
  /** Platform settings singleton. */
  settings: () => "settings",
  /** One vendor's public-facing data. */
  vendor: (vendorId: string) => `vendor-${vendorId}`,
} as const;

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export { slug as slugify };

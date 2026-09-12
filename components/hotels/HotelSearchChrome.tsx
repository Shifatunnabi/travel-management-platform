import { defaultStay } from "@/lib/utils/stay";
import { getDestinationCities } from "@/lib/services/public-hotels";
import HotelSearchBar from "./HotelSearchBar";
import type { HotelSearchParams } from "@/app/(site)/hotels/search/page";

/**
 * Reads the search from the URL and hands it to the editable bar. The city list
 * is cached, so adding suggestions here costs the page nothing per request.
 */
export default async function HotelSearchChrome({
  searchParams,
}: {
  searchParams: Promise<HotelSearchParams>;
}) {
  const params = await searchParams;
  const stay = defaultStay(params.checkIn, params.checkOut);

  // Suggestions are a convenience — losing them must not cost the visitor the
  // ability to change their dates. Same reasoning as the homepage hero.
  let cities: string[] = [];
  try {
    cities = (await getDestinationCities()).map((c) => c.city);
  } catch (error) {
    console.error("[search] could not load destination cities:", error);
  }

  return (
    <HotelSearchBar
      destination={params.destination?.trim() ?? ""}
      checkIn={stay.checkIn}
      checkOut={stay.checkOut}
      guests={params.guests ?? "2"}
      rooms={params.rooms ?? "1"}
      nights={stay.nights}
      checkInLabel={stay.checkInLabel}
      checkOutLabel={stay.checkOutLabel}
      cities={cities}
    />
  );
}

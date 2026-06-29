import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Star, Wifi, Waves, Utensils,
  CheckCircle, XCircle, ChevronRight, Users, Calendar, Shield,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockHotels } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils/formatters";
import Badge from "@/components/ui/Badge";
import RatingStars from "@/components/ui/RatingStars";

export default async function HotelDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = mockHotels.find((h) => h.id === id);
  if (!hotel) notFound();

  const nights = 2;
  const taxes = Math.round(hotel.pricePerNight * nights * 0.05);
  const subtotal = hotel.pricePerNight * nights;
  const total = subtotal + taxes;

  const rooms = [
    {
      id: "r1",
      name: "Superior Room",
      bed: "1 King Bed",
      size: "32 sqm",
      occupancy: 2,
      price: hotel.pricePerNight,
      breakfast: hotel.breakfast,
      freeCancellation: hotel.freeCancellation,
      perks: ["Free WiFi", "City View", "Mini-bar"],
    },
    {
      id: "r2",
      name: "Deluxe Ocean View",
      bed: "1 King Bed + Sofa",
      size: "48 sqm",
      occupancy: 3,
      price: Math.round(hotel.pricePerNight * 1.35),
      breakfast: true,
      freeCancellation: true,
      perks: ["Free WiFi", "Ocean View", "Balcony", "Mini-bar", "Bathtub"],
    },
    {
      id: "r3",
      name: "Family Suite",
      bed: "2 Double Beds",
      size: "65 sqm",
      occupancy: 4,
      price: Math.round(hotel.pricePerNight * 1.8),
      breakfast: true,
      freeCancellation: false,
      perks: ["Free WiFi", "Kitchenette", "2 Bathrooms", "Living Area"],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight size={14} />
              <Link href="/hotels/search" className="hover:text-blue-600">Hotels</Link>
              <ChevronRight size={14} />
              <span className="text-slate-800 font-medium truncate">{hotel.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/hotels/search" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium mb-5">
            <ArrowLeft size={15} />
            Back to results
          </Link>

          {/* Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6 rounded-2xl overflow-hidden h-64 sm:h-80">
            <div className="col-span-2 row-span-2 relative">
              <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
            </div>
            {hotel.images.slice(1, 5).map((img, i) => (
              <div key={i} className="relative">
                <Image src={img} alt={`${hotel.name} ${i + 2}`} fill className="object-cover" />
                {i === 2 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">+{Math.max(0, hotel.images.length - 4)} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 space-y-5">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: hotel.starCategory }).map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{hotel.name}</h1>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
                      <MapPin size={14} />
                      <span>{hotel.address}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.tags.map((tag) => (
                        <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="bg-blue-700 text-white text-lg font-bold px-2.5 py-1 rounded-xl">
                        {hotel.rating.toFixed(1)}
                      </span>
                    </div>
                    <RatingStars rating={hotel.rating} size="md" showNumber />
                    <p className="text-xs text-slate-400 mt-1">{hotel.reviewCount.toLocaleString()} reviews</p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mt-4">{hotel.description}</p>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {hotel.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-sm text-slate-700">
                      <CheckCircle size={14} className="text-blue-500 shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Room types */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-5">Available Rooms</h2>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-base">{room.name}</h3>
                          <p className="text-slate-500 text-sm mt-0.5">
                            {room.bed} · {room.size} · Up to {room.occupancy} guests
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {room.perks.map((p) => (
                              <span key={p} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                                {p}
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-2 text-xs">
                            <span className={room.breakfast ? "text-emerald-600" : "text-slate-400"}>
                              {room.breakfast ? "✓ Breakfast included" : "✗ No breakfast"}
                            </span>
                            <span className={room.freeCancellation ? "text-emerald-600" : "text-amber-600"}>
                              {room.freeCancellation ? "✓ Free cancellation" : "⚠ Non-refundable"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right sm:w-40 shrink-0">
                          <p className="text-xs text-slate-400">per night</p>
                          <p className="text-xl font-bold text-slate-900">
                            {formatCurrency(room.price, hotel.currency)}
                          </p>
                          <Link
                            href={`/hotels/book/guests?hotelId=${hotel.id}&roomId=${room.id}`}
                            className="mt-2 block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors text-center"
                          >
                            Select Room
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-4">Property Policies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: "Check-in", value: "From 14:00" },
                    { label: "Check-out", value: "Until 12:00" },
                    { label: "Pets", value: "Not allowed" },
                    { label: "Smoking", value: "Non-smoking rooms only" },
                    { label: "Children", value: "Children welcome" },
                    { label: "Extra beds", value: "Available on request" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4">Book This Hotel</h3>
                <div className="space-y-3 mb-4">
                  <div className="border border-slate-200 rounded-xl p-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Check-in</label>
                    <input type="date" defaultValue="2026-07-04" className="w-full text-sm font-bold text-slate-800 mt-0.5 focus:outline-none" />
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Check-out</label>
                    <input type="date" defaultValue="2026-07-06" className="w-full text-sm font-bold text-slate-800 mt-0.5 focus:outline-none" />
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-800">2 Guests · 1 Room</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-slate-100 pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{formatCurrency(hotel.pricePerNight, hotel.currency)} × {nights} nights</span>
                    <span>{formatCurrency(subtotal, hotel.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxes & fees</span>
                    <span>{formatCurrency(taxes, hotel.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                    <span>Total ({nights} nights)</span>
                    <span className="text-blue-700">{formatCurrency(total, hotel.currency)}</span>
                  </div>
                </div>

                <Link
                  href={`/hotels/book/guests?hotelId=${hotel.id}`}
                  className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition-colors"
                >
                  Reserve Now
                </Link>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Shield size={13} className="text-emerald-500" />
                  No charge until check-in. Secured by SSL.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

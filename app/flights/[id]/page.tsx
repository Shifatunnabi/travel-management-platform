import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Plane, Clock, Luggage, CheckCircle,
  XCircle, Shield, Info, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { mockFlights } from "@/lib/mock-data";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils/formatters";
import Badge from "@/components/ui/Badge";

export default async function FlightDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flight = mockFlights.find((f) => f.id === id);
  if (!flight) notFound();

  const taxes = Math.round(flight.price * 0.05);
  const total = flight.price + taxes;

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
              <Link href="/flights/search" className="hover:text-blue-600">Flights</Link>
              <ChevronRight size={14} />
              <span className="text-slate-800 font-medium">Flight Details</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content */}
            <div className="flex-1 space-y-5">
              <Link
                href="/flights/search"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <ArrowLeft size={15} />
                Back to search results
              </Link>

              {/* Itinerary card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-slate-900 text-lg">Flight Itinerary</h2>
                  <Badge variant="success" size="md">
                    {flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop`}
                  </Badge>
                </div>

                {/* Airline info */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 p-1.5 flex items-center justify-center">
                    <Image
                      src={flight.airlineLogo}
                      alt={flight.airline}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{flight.airline}</p>
                    <p className="text-slate-500 text-sm">{flight.flightNumber} · {flight.aircraft}</p>
                    <Badge variant="default" size="sm" className="mt-1">{flight.cabinClass}</Badge>
                  </div>
                </div>

                {/* Route timeline */}
                <div className="flex items-start gap-6">
                  <div className="text-center w-28 shrink-0">
                    <p className="text-3xl font-bold text-slate-900">{formatTime(flight.departure)}</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">{flight.from.code}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{flight.from.city}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(flight.departure)}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{flight.from.airport}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center py-2">
                    <p className="text-sm text-slate-500 mb-2 font-medium">{flight.duration}</p>
                    <div className="w-full flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <div className="flex-1 h-0.5 bg-blue-200" />
                      <Plane size={18} className="text-blue-500 shrink-0" />
                      <div className="flex-1 h-0.5 bg-blue-200" />
                      <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {flight.stops === 0 ? "Non-stop" : `Via ${flight.layoverAirport}`}
                    </p>
                  </div>

                  <div className="text-center w-28 shrink-0">
                    <p className="text-3xl font-bold text-slate-900">{formatTime(flight.arrival)}</p>
                    <p className="text-lg font-bold text-blue-700 mt-1">{flight.to.code}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{flight.to.city}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(flight.arrival)}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{flight.to.airport}</p>
                  </div>
                </div>
              </div>

              {/* Fare details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-5">Fare Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { icon: Luggage, label: "Checked Baggage", value: flight.baggage },
                    { icon: Luggage, label: "Carry-On", value: flight.carryOn },
                    { icon: flight.refundable ? CheckCircle : XCircle, label: "Refundable", value: flight.refundable ? "Yes" : "No", color: flight.refundable ? "text-emerald-600" : "text-red-500" },
                    { icon: Shield, label: "Fare Type", value: flight.fareType },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <Icon size={18} className={color || "text-blue-500"} />
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className={`font-semibold text-sm mt-0.5 ${color || "text-slate-800"}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" />
                  Fare Rules & Policies
                </h2>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="font-semibold text-amber-800 mb-1">Cancellation Policy</p>
                    <p>{flight.refundable ? "Free cancellation up to 24 hours before departure. Cancellation fee applies within 24 hours." : "This is a non-refundable ticket. No refund on cancellation."}</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="font-semibold text-blue-800 mb-1">Date Change Policy</p>
                    <p>Date changes are allowed subject to availability and applicable change fees. Contact our support team at least 48 hours before departure.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-semibold text-slate-700 mb-1">General Terms</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Passport valid for at least 6 months required</li>
                      <li>Check-in counter closes 45 minutes before departure</li>
                      <li>Online check-in available 24 hours before</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking summary sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
                <h3 className="font-bold text-slate-900 mb-4">Price Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base fare (1 pax)</span>
                    <span className="font-medium">{formatCurrency(flight.price, flight.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Taxes & fees</span>
                    <span className="font-medium">{formatCurrency(taxes, flight.currency)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="font-bold text-blue-700 text-lg">{formatCurrency(total, flight.currency)}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500 mb-5">
                  Price includes all taxes and surcharges
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    Instant e-ticket delivery
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    Secure payment gateway
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    24/7 customer support
                  </div>
                </div>

                <Link
                  href={`/flights/book/passengers?flightId=${flight.id}`}
                  className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition-colors"
                >
                  Continue to Book
                </Link>

                {flight.seatsLeft && flight.seatsLeft <= 5 && (
                  <p className="mt-3 text-center text-xs text-red-500 font-medium">
                    ⚡ Only {flight.seatsLeft} seats left at this price!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

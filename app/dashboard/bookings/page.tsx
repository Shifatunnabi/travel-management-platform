"use client";

import { useState } from "react";
import { Plane, Building2, Calendar, Download, Eye, XCircle, CheckCircle, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";

type BookingTab = "upcoming" | "completed" | "cancelled";

const allBookings = [
  { id: "b1", type: "flight", ref: "TFZ7XKP3Q", route: "Dhaka → Cox's Bazar", date: "4 Jul 2026", status: "upcoming", price: "৳4,725", airline: "Biman", passengers: 1 },
  { id: "b2", type: "hotel", ref: "TFZ8MNB2W", name: "The Peninsula", dates: "4–6 Jul 2026", status: "upcoming", price: "৳26,250", nights: 2 },
  { id: "b3", type: "flight", ref: "TFZ2PQR8M", route: "Dhaka → Dubai", date: "15 Jun 2026", status: "completed", price: "৳42,000", airline: "Emirates", passengers: 2 },
  { id: "b4", type: "hotel", ref: "TFZ5NXK1R", name: "Radisson Blu Dhaka", dates: "12–14 May 2026", status: "completed", price: "৳44,000", nights: 2 },
  { id: "b5", type: "flight", ref: "TFZ9VWX4T", route: "Dhaka → Bangkok", date: "1 Apr 2026", status: "cancelled", price: "৳22,000", airline: "Air Arabia", passengers: 1 },
];

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "success" | "info" | "danger" | "warning"; icon: typeof CheckCircle }> = {
    upcoming: { variant: "info", icon: Clock },
    completed: { variant: "success", icon: CheckCircle },
    cancelled: { variant: "danger", icon: XCircle },
  };
  const cfg = map[status] || { variant: "default" as const, icon: Clock };
  return (
    <Badge variant={cfg.variant} size="sm" className="flex items-center gap-1">
      <cfg.icon size={10} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function BookingsPage() {
  const [tab, setTab] = useState<BookingTab>("upcoming");

  const filtered = allBookings.filter((b) => b.status === tab);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage all your flight and hotel reservations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["upcoming", "completed", "cancelled"] as BookingTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      <div className="space-y-4">
        {filtered.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${booking.type === "flight" ? "bg-blue-100" : "bg-purple-100"}`}>
                {booking.type === "flight" ? (
                  <Plane size={20} className="text-blue-600" />
                ) : (
                  <Building2 size={20} className="text-purple-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">
                    {booking.type === "flight" ? (booking as typeof booking & { route: string }).route : (booking as typeof booking & { name: string }).name}
                  </h3>
                  {statusBadge(booking.status)}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {booking.type === "flight" ? (booking as typeof booking & { date: string }).date : (booking as typeof booking & { dates: string }).dates}
                  </span>
                  {booking.type === "flight" && (
                    <span>{(booking as typeof booking & { airline: string }).airline} · {(booking as typeof booking & { passengers: number }).passengers} pax</span>
                  )}
                  {booking.type === "hotel" && (
                    <span>{(booking as typeof booking & { nights: number }).nights} nights</span>
                  )}
                  <span className="font-mono text-slate-400">Ref: {booking.ref}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <Eye size={13} />
                    View Details
                  </button>
                  {booking.status === "completed" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Download size={13} />
                      Download Ticket
                    </button>
                  )}
                  {booking.status === "upcoming" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                      <XCircle size={13} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-slate-900 text-lg">{booking.price}</p>
                <p className="text-xs text-slate-400">Total paid</p>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="text-4xl mb-3">✈️</div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">No {tab} bookings</h3>
            <p className="text-slate-500 text-sm">
              {tab === "upcoming" ? "Start planning your next adventure!" : `Your ${tab} bookings will appear here.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

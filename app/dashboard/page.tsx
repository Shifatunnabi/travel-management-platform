import Link from "next/link";
import {
  Plane, Building2, Clock, CheckCircle, XCircle,
  TrendingUp, ArrowRight, Calendar, MapPin,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

const upcomingBookings = [
  {
    id: "b1",
    type: "flight",
    ref: "TFZ7XKP3Q",
    route: "Dhaka → Cox's Bazar",
    date: "4 Jul 2026",
    status: "upcoming",
    price: "৳4,725",
    airline: "Biman Bangladesh Airlines",
  },
  {
    id: "b2",
    type: "hotel",
    ref: "TFZ8MNB2W",
    name: "The Peninsula Cox's Bazar",
    dates: "4–6 Jul 2026",
    status: "upcoming",
    price: "৳26,250",
    nights: 2,
  },
];

const stats = [
  { icon: Plane, label: "Flights Booked", value: "12", color: "bg-blue-100 text-blue-600" },
  { icon: Building2, label: "Hotels Stayed", value: "8", color: "bg-purple-100 text-purple-600" },
  { icon: CheckCircle, label: "Completed Trips", value: "18", color: "bg-emerald-100 text-emerald-600" },
  { icon: TrendingUp, label: "Miles Saved", value: "₹42K", color: "bg-amber-100 text-amber-600" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, Farhan! ✈️</h1>
        <p className="text-blue-200 text-sm">
          You have {upcomingBookings.length} upcoming trip{upcomingBookings.length > 1 ? "s" : ""}. Have a great journey!
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/flights/search"
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <Plane size={15} />
            Book a Flight
          </Link>
          <Link
            href="/hotels/search"
            className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors"
          >
            <Building2 size={15} />
            Book a Hotel
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Upcoming Bookings
          </h2>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${booking.type === "flight" ? "bg-blue-100" : "bg-purple-100"}`}>
                {booking.type === "flight" ? (
                  <Plane size={18} className="text-blue-600" />
                ) : (
                  <Building2 size={18} className="text-purple-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {booking.type === "flight" ? booking.route : (booking as typeof booking & { name: string }).name}
                  </p>
                  <Badge variant="info" size="sm">Upcoming</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {booking.type === "flight" ? booking.date : (booking as typeof booking & { dates: string }).dates}
                  </span>
                  <span>Ref: {booking.ref}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-slate-900 text-sm">{booking.price}</p>
                <Link
                  href="/dashboard/bookings"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Popular Destinations", desc: "Explore trending travel spots", href: "/flights/search", icon: MapPin, color: "blue" },
          { title: "Hotel Deals", desc: "Find great stays at low prices", href: "/hotels/search", icon: Building2, color: "purple" },
        ].map(({ title, desc, href, icon: Icon, color }) => (
          <Link
            key={title}
            href={href}
            className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon size={18} className={`text-${color}-600`} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
            <p className="text-slate-500 text-xs">{desc}</p>
            <div className="mt-3 flex items-center gap-1 text-blue-600 text-xs font-medium group-hover:gap-2 transition-all">
              Explore <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { CheckCircle, Download, Mail, Building2, Calendar, Users, LayoutDashboard, Home } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateBookingRef } from "@/lib/utils/formatters";

export default function HotelConfirmationPage() {
  const bookingRef = generateBookingRef();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-5">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Hotel Booked!</h1>
            <p className="text-slate-500 text-lg">Your hotel reservation is confirmed. Check your email for details.</p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 text-center mb-5">
            <p className="text-slate-500 text-sm mb-2">Booking Reference</p>
            <p className="text-3xl font-bold text-blue-700 tracking-widest font-mono mb-1">{bookingRef}</p>
            <p className="text-xs text-slate-400">Save this reference for future communication</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
            <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Building2 size={18} className="text-blue-500" />
              Booking Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: "Hotel", value: "The Peninsula" },
                { icon: Calendar, label: "Check-in", value: "4 Jul 2026" },
                { icon: Calendar, label: "Check-out", value: "6 Jul 2026" },
                { icon: Users, label: "Guests", value: "2 Adults" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                  <Icon size={16} className="text-blue-500 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">Total Paid</span>
              <span className="font-bold text-xl text-slate-900">৳26,250</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <Mail size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm">Confirmation sent to your email</p>
              <p className="text-blue-700 text-xs mt-0.5">Your booking voucher has been sent to your registered email address.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
              <Download size={18} />
              Download Voucher
            </button>
            <Link href="/dashboard/bookings" className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-colors">
              <LayoutDashboard size={18} />
              My Bookings
            </Link>
            <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-colors">
              <Home size={18} />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

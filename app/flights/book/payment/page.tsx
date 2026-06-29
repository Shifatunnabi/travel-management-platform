"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, CreditCard, Smartphone, Shield,
  Tag, CheckCircle, Lock,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

type PaymentMethod = "card" | "bkash" | "nagad" | "rocket" | "bank";

const paymentMethods: { id: PaymentMethod; name: string; icon: string; color: string }[] = [
  { id: "card", name: "Credit / Debit Card", icon: "💳", color: "border-blue-500 bg-blue-50" },
  { id: "bkash", name: "bKash", icon: "📱", color: "border-pink-500 bg-pink-50" },
  { id: "nagad", name: "Nagad", icon: "📱", color: "border-orange-500 bg-orange-50" },
  { id: "rocket", name: "Rocket (DBBL)", icon: "🚀", color: "border-purple-500 bg-purple-50" },
  { id: "bank", name: "Net Banking", icon: "🏦", color: "border-slate-400 bg-slate-50" },
];

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const base = 4500;
  const taxes = 225;
  const discount = couponApplied ? 300 : 0;
  const total = base + taxes - discount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    router.push("/flights/book/confirmation");
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "TOFIZA300") setCouponApplied(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* Progress bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-800 font-medium">Payment</span>
            </div>
            <div className="flex items-center gap-0">
              {["Passenger Info", "Payment", "Confirmation"].map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center gap-2 ${i === 1 ? "text-blue-700" : i === 0 ? "text-emerald-600" : "text-slate-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? "bg-blue-600 text-white" : i === 0 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {i === 0 ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${i === 1 ? "text-blue-700" : i === 0 ? "text-emerald-600" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {i < 2 && <div className={`h-px w-8 sm:w-16 mx-2 ${i === 0 ? "bg-emerald-300" : "bg-slate-200"}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handlePay}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Payment form */}
              <div className="flex-1 space-y-5">
                {/* Payment method selector */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-500" />
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMethod(pm.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${method === pm.id ? pm.color : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <span className={`text-xs font-semibold text-center leading-tight ${method === pm.id ? "text-slate-800" : "text-slate-600"}`}>
                          {pm.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Card form */}
                  {method === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number *</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry Date *</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            maxLength={7}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV *</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cardholder Name *</label>
                        <input
                          type="text"
                          placeholder="As on card"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile banking */}
                  {["bkash", "nagad", "rocket"].includes(method) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        {paymentMethods.find(p => p.id === method)?.name} Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="+880 1XXX-XXXXXX"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">
                        You will receive a payment request on this number
                      </p>
                    </div>
                  )}

                  {method === "bank" && (
                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                      <p className="font-semibold mb-2">Net Banking Instructions:</p>
                      <p>Select your bank from the list and complete the payment on your bank's secure portal. Your booking will be confirmed immediately upon payment.</p>
                    </div>
                  )}
                </div>

                {/* Security badges */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center gap-4 justify-center">
                    {["🔒 SSL Secured", "🛡️ PCI DSS", "✓ 3D Secure", "🏦 Bank Verified"].map((b) => (
                      <span key={b} className="text-xs text-slate-500 font-medium">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary sidebar */}
              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24 space-y-4">
                  <h3 className="font-bold text-slate-900">Order Summary</h3>

                  {/* Flight info */}
                  <div className="p-3 bg-blue-50 rounded-xl text-sm">
                    <p className="font-semibold text-blue-900">Dhaka → Cox's Bazar</p>
                    <p className="text-blue-700 text-xs mt-0.5">4 Jul 2026 · 1 Passenger · Economy</p>
                  </div>

                  {/* Coupon */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Tag size={12} /> Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        placeholder="TOFIZA300"
                        disabled={couponApplied}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponApplied}
                        className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={11} /> ৳300 discount applied!
                      </p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base fare</span>
                      <span>৳{base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxes & fees</span>
                      <span>৳{taxes}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>−৳{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                      <span>Total</span>
                      <span className="text-blue-700 text-lg">৳{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                    <Lock size={15} />
                    {loading ? "Processing..." : `Pay ৳${total.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-center text-slate-400">
                    By completing this purchase you agree to our{" "}
                    <Link href="/terms" className="text-blue-500 hover:underline">Terms of Service</Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

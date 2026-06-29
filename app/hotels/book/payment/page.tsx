"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Lock, Shield, Tag, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

type PaymentMethod = "card" | "bkash" | "nagad";

export default function HotelPaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const discount = couponApplied ? 500 : 0;
  const total = 26250 - discount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    router.push("/hotels/book/confirmation");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm mb-3">
              <Link href="/" className="text-slate-500 hover:text-blue-600">Home</Link>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-800 font-medium">Hotel Payment</span>
            </div>
            <div className="flex items-center gap-0">
              {["Guest Info", "Payment", "Confirmation"].map((step, i) => (
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
              <div className="flex-1 space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-lg mb-5">Select Payment Method</h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { id: "card" as PaymentMethod, name: "Card", icon: "💳" },
                      { id: "bkash" as PaymentMethod, name: "bKash", icon: "📱" },
                      { id: "nagad" as PaymentMethod, name: "Nagad", icon: "📱" },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setMethod(pm.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${method === pm.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <span className="text-xs font-semibold">{pm.name}</span>
                      </button>
                    ))}
                  </div>
                  {method === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry</label>
                          <input type="text" placeholder="MM / YY" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                          <input type="password" placeholder="•••" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                      </div>
                    </div>
                  )}
                  {["bkash", "nagad"].includes(method) && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number</label>
                      <input type="tel" placeholder="+880 1XXX-XXXXXX" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center gap-4 justify-center text-xs text-slate-500">
                    {["🔒 SSL Secured", "🛡️ PCI DSS", "✓ 3D Secure"].map(b => <span key={b}>{b}</span>)}
                  </div>
                </div>
              </div>

              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24 space-y-4">
                  <h3 className="font-bold text-slate-900">Order Summary</h3>
                  <div className="p-3 bg-blue-50 rounded-xl text-sm">
                    <p className="font-semibold text-blue-900">The Peninsula Cox's Bazar</p>
                    <p className="text-blue-700 text-xs mt-0.5">Superior Room · Jul 4–6, 2026</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1">
                      <Tag size={12} /> Coupon
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        placeholder="HOTEL500"
                        disabled={couponApplied}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => { if (coupon) setCouponApplied(true); }}
                        disabled={couponApplied}
                        className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle size={11} /> ৳500 discount applied!
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
                    <div className="flex justify-between"><span className="text-slate-500">Room × 2 nights</span><span>৳25,000</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Taxes</span><span>৳1,250</span></div>
                    {couponApplied && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>−৳500</span></div>}
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
                      <span>Total</span>
                      <span className="text-blue-700 text-lg">৳{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                    <Lock size={15} />
                    {loading ? "Processing..." : `Pay ৳${total.toLocaleString()}`}
                  </Button>
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

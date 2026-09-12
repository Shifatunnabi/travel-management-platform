import type { Destination, Testimonial, PromoOffer, FAQ, Partner } from "@/lib/types";

export const featuredDestinations: Destination[] = [
  {
    id: "dest-001",
    city: "Cox's Bazar",
    country: "Bangladesh",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    startingPrice: 3900,
    currency: "BDT",
    description: "World's longest natural sandy beach",
    flightDuration: "1h 05m",
  },
  {
    id: "dest-002",
    city: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
    startingPrice: 28500,
    currency: "BDT",
    description: "City of gold and luxury living",
    flightDuration: "4h 35m",
  },
  {
    id: "dest-003",
    city: "Bangkok",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600",
    startingPrice: 22000,
    currency: "BDT",
    description: "Vibrant street food and golden temples",
    flightDuration: "3h 20m",
  },
  {
    id: "dest-004",
    city: "Kuala Lumpur",
    country: "Malaysia",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600",
    startingPrice: 24000,
    currency: "BDT",
    description: "Modern skyscrapers meet rich culture",
    flightDuration: "4h 10m",
  },
  {
    id: "dest-005",
    city: "Singapore",
    country: "Singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600",
    startingPrice: 31000,
    currency: "BDT",
    description: "Asia's premier city-state experience",
    flightDuration: "4h 50m",
  },
  {
    id: "dest-006",
    city: "Istanbul",
    country: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600",
    startingPrice: 38000,
    currency: "BDT",
    description: "Where East meets West beautifully",
    flightDuration: "7h 30m",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t-001",
    name: "Farhan Ahmed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    location: "Dhaka, Bangladesh",
    rating: 5,
    review:
      "Tofiza made booking my family vacation to Cox's Bazar incredibly easy. The search was fast, the prices were unbeatable, and our tickets arrived instantly. Will definitely use again!",
    tripType: "Family Trip",
    date: "June 2026",
  },
  {
    id: "t-002",
    name: "Nusrat Jahan",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    location: "Chittagong, Bangladesh",
    rating: 5,
    review:
      "I was skeptical about booking online but Tofiza completely changed my mind. The customer support team was incredibly helpful when I needed to change my return date. Exceptional service!",
    tripType: "Business Travel",
    date: "May 2026",
  },
  {
    id: "t-003",
    name: "Rifat Hossain",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    location: "Sylhet, Bangladesh",
    rating: 4,
    review:
      "Found amazing hotel deals in Dubai through Tofiza. The hotel was exactly as described and the booking process was seamless. Great platform for international travel.",
    tripType: "International Vacation",
    date: "April 2026",
  },
  {
    id: "t-004",
    name: "Tasnim Sultana",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    location: "Dhaka, Bangladesh",
    rating: 5,
    review:
      "The interface is so clean and user-friendly. I could compare flights side by side and find the best deal in minutes. The price was much lower than other platforms I checked.",
    tripType: "Honeymoon",
    date: "March 2026",
  },
  {
    id: "t-005",
    name: "Mohammad Karim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    location: "Rajshahi, Bangladesh",
    rating: 5,
    review:
      "Booked a last-minute flight to Cox's Bazar and it went through perfectly. Got a great price and the entire process from search to confirmation took less than 10 minutes!",
    tripType: "Weekend Getaway",
    date: "June 2026",
  },
];

export const promoOffers: PromoOffer[] = [
  {
    id: "promo-001",
    title: "Summer Beach Escape",
    description: "Up to 40% off on Cox's Bazar hotel bookings this summer season",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    badgeColor: "bg-orange-500",
    expiresAt: "2026-08-31",
    type: "hotel",
    code: "BEACH40",
  },
  {
    id: "promo-002",
    title: "Fly to Dubai from BDT 24,999",
    description: "Limited seats available. Book now and save big on international flights",
    discount: "BDT 3,500 OFF",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    badgeColor: "bg-brand-600",
    expiresAt: "2026-07-31",
    type: "flight",
    code: "DUBAI25",
  },
  {
    id: "promo-003",
    title: "Weekend City Breaks",
    description: "Stay 2 nights, pay for 1 at selected hotels across Bangladesh",
    discount: "Buy 1 Get 1",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    badgeColor: "bg-emerald-500",
    expiresAt: "2026-07-15",
    type: "hotel",
    code: "WEEKEND50",
  },
];

export const trustFeatures = [
  {
    icon: "shield-check",
    title: "Secure Payments",
    description: "Bank-grade SSL encryption protects every transaction you make on our platform.",
  },
  {
    icon: "verified",
    title: "Verified Properties",
    description: "Every hotel is hand-verified by our team to ensure quality and accuracy.",
  },
  {
    icon: "zap",
    title: "Instant Confirmation",
    description: "Receive your booking confirmation and e-tickets within seconds of payment.",
  },
  {
    icon: "tag",
    title: "Best Price Guarantee",
    description: "Found a lower price elsewhere? We'll match it and refund the difference.",
  },
  {
    icon: "headphones",
    title: "24/7 Support",
    description: "Our dedicated travel experts are available around the clock to assist you.",
  },
  {
    icon: "refresh",
    title: "Easy Refunds",
    description: "Hassle-free cancellations and refunds processed within 5-7 business days.",
  },
];

/**
 * Guest-facing answers. Keep these true to what the platform actually does —
 * hotels are live, flights are not — and route every enquiry to the single
 * support address in lib/config/contact.ts rather than inventing new ones.
 */
export const faqs: FAQ[] = [
  {
    id: "faq-001",
    question: "How do I book a hotel on Tofiza?",
    answer:
      "Search by city and your dates, then compare properties and pick a room. Choosing a room holds it for 15 minutes while you enter guest details and pay on our gateway's secure page. As soon as the payment clears, your booking is confirmed, the property is notified, and your invoice arrives by email with a booking reference starting TFZ — show that at check-in.",
  },
  {
    id: "faq-002",
    question: "Can I cancel or change my booking?",
    answer:
      "Cancel any time from My Bookings. What comes back depends on the rate you booked: refundable rates are refunded in full if you cancel before the cut-off shown on the room, commonly 24 hours before check-in, and non-refundable rates are not refunded. The page tells you the exact refund amount before you confirm. To change dates, cancel and rebook if your rate allows it, or call us and we will help.",
  },
  {
    id: "faq-003",
    question: "What payment methods do you accept?",
    answer:
      "Credit and debit cards including Visa and Mastercard, the mobile wallets bKash, Nagad and Rocket, and internet banking — all handled by SSLCommerz. You enter your payment details on their secure page, never on ours, so we never see or store your card number.",
  },
  {
    id: "faq-004",
    question: "How do I get my confirmation and invoice?",
    answer:
      "Both are emailed to you the moment your payment is confirmed, with a full breakdown of the room, any extras, taxes and fees. You can also open the booking any time under My Bookings. If nothing has arrived within a few minutes, check your spam folder, then contact us with the name and dates you booked under.",
  },
  {
    id: "faq-005",
    question: "Is it safe to book hotels through Tofiza?",
    answer:
      "Every property is checked by our team before it goes live, and the reviews you see are written by guests who actually stayed. Payment is taken through SSLCommerz rather than by us directly. If a property cannot honour a booking we have confirmed, you are refunded in full regardless of the rate, and we will help you find a comparable alternative for the same dates.",
  },
  {
    id: "faq-006",
    question: "Can I book flights on Tofiza?",
    answer:
      "Not yet. Hotel booking is live across Bangladesh and beyond, and flights are in progress — the Flight tab on the homepage will open for bookings once airline fares and ticketing are in place. Nothing on the site can currently be booked as a flight.",
  },
  {
    id: "faq-007",
    question: "Do you handle group bookings?",
    answer:
      "Yes. For several rooms, a long stay, or a corporate or event booking, call us or email support@tofiza.com with your dates, city and room count, and we will put rates together for you rather than having you book room by room.",
  },
];

export const partners: Partner[] = [
  { id: "p-001", name: "Biman Bangladesh Airlines", logo: "/demo/biman-bd.png" },
  { id: "p-002", name: "US-Bangla Airlines", logo: "/demo/us-bangla.png" },
  { id: "p-003", name: "Novo Air", logo: "/demo/novoair.png" },
  { id: "p-004", name: "Air Astra", logo: "/demo/air-astra.png" },
  { id: "p-005", name: "Biman Bangladesh Airlines", logo: "/demo/biman-bd.png" },
  { id: "p-006", name: "US-Bangla Airlines", logo: "/demo/us-bangla.png" },
  { id: "p-007", name: "Novo Air", logo: "/demo/novoair.png" },
  { id: "p-008", name: "Air Astra", logo: "/demo/air-astra.png" },
];

export { mockFlights } from "./flights";

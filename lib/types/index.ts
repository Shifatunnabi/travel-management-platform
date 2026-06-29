// ─── Flight Types ────────────────────────────────────────────────────────────

export interface Airport {
  city: string;
  code: string;
  airport: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo: string;
  flightNumber: string;
  from: Airport;
  to: Airport;
  departure: string; // ISO datetime
  arrival: string;   // ISO datetime
  duration: string;  // "2h 30m"
  stops: number;
  stopInfo?: string;
  layoverAirport?: string;
  layoverDuration?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  cabinClass: "economy" | "business" | "first";
  baggage: string;
  carryOn: string;
  refundable: boolean;
  fareType: string;
  seatsLeft?: number;
  aircraft?: string;
}

export interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  tripType: "one-way" | "round-trip";
}

// ─── Hotel Types ─────────────────────────────────────────────────────────────

export interface HotelAmenity {
  name: string;
  icon: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  occupancy: number;
  bedType: string;
  size: string;
  price: number;
  originalPrice?: number;
  currency: string;
  breakfast: boolean;
  freeCancellation: boolean;
  images: string[];
  amenities: string[];
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  location: string;
  rating: number;
  reviewCount: number;
  starCategory: number;
  images: string[];
  amenities: string[];
  pricePerNight: number;
  originalPrice?: number;
  currency: string;
  breakfast: boolean;
  freeCancellation: boolean;
  distanceFromCenter: number;
  tags: string[];
  rooms?: RoomType[];
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

// ─── Destination Types ────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  city: string;
  country: string;
  image: string;
  startingPrice: number;
  currency: string;
  description: string;
  flightDuration?: string;
}

// ─── Testimonial Types ────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  review: string;
  tripType: string;
  date: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportExpiry?: string;
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export type BookingStatus =
  | "upcoming"
  | "completed"
  | "cancelled"
  | "pending"
  | "refunded";

export interface Passenger {
  id: string;
  title: "Mr" | "Ms" | "Mrs" | "Dr";
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  email?: string;
  phone?: string;
}

export interface FlightBooking {
  id: string;
  bookingRef: string;
  type: "flight";
  status: BookingStatus;
  flight: Flight;
  returnFlight?: Flight;
  passengers: Passenger[];
  totalPrice: number;
  currency: string;
  bookingDate: string;
  paymentMethod: string;
  pnr?: string;
}

export interface HotelBooking {
  id: string;
  bookingRef: string;
  type: "hotel";
  status: BookingStatus;
  hotel: Hotel;
  room: RoomType;
  guests: Passenger[];
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  currency: string;
  bookingDate: string;
  paymentMethod: string;
}

export type Booking = FlightBooking | HotelBooking;

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface FlightFilters {
  airlines: string[];
  stops: number[];
  priceRange: [number, number];
  refundable: boolean | null;
  departureTime: string[];
  arrivalTime: string[];
  baggage: string[];
}

export interface HotelFilters {
  priceRange: [number, number];
  starCategory: number[];
  rating: number | null;
  amenities: string[];
  breakfast: boolean | null;
  freeCancellation: boolean | null;
  propertyType: string[];
  distanceFromCenter: number | null;
}

// ─── Partner Types ────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface PromoOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
  badgeColor: string;
  expiresAt: string;
  type: "flight" | "hotel" | "combo";
  code?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

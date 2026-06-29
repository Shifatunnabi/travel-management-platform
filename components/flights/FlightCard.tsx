"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plane, Clock, Luggage, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Info, Zap,
} from "lucide-react";
import type { Flight } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/utils/formatters";
import Badge from "@/components/ui/Badge";

interface FlightCardProps {
  flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Main card */}
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Airline info */}
          <div className="flex items-center gap-3 lg:w-44 shrink-0">
            <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1 shrink-0">
              <Image
                src={flight.airlineLogo}
                alt={flight.airline}
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">{flight.airline}</p>
              <p className="text-slate-400 text-xs mt-0.5">{flight.flightNumber}</p>
              <Badge variant="default" size="sm" className="mt-1">{flight.cabinClass}</Badge>
            </div>
          </div>

          {/* Route & times */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{formatTime(flight.departure)}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{flight.from.code}</p>
              <p className="text-xs text-slate-400">{flight.from.city}</p>
            </div>

            {/* Flight path */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">{flight.duration}</p>
              <div className="w-full flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full border-2 border-blue-400 shrink-0" />
                <div className="flex-1 h-px bg-slate-300 relative">
                  {flight.stops > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                  )}
                </div>
                <Plane size={14} className="text-blue-500 shrink-0" />
                <div className="flex-1 h-px bg-slate-300" />
                <div className="w-2 h-2 rounded-full border-2 border-slate-400 shrink-0" />
              </div>
              <p className={`text-xs font-medium ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {flight.stops === 0 ? "Direct" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival)}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{flight.to.code}</p>
              <p className="text-xs text-slate-400">{flight.to.city}</p>
            </div>
          </div>

          {/* Info & price */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:w-40 shrink-0 lg:pl-4 lg:border-l border-slate-100">
            <div className="flex flex-col gap-1.5 lg:items-end">
              <div className="flex items-center gap-1.5 text-xs">
                <Luggage size={13} className="text-slate-400" />
                <span className="text-slate-600">{flight.baggage}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {flight.refundable ? (
                  <CheckCircle size={13} className="text-emerald-500" />
                ) : (
                  <XCircle size={13} className="text-slate-400" />
                )}
                <span className={flight.refundable ? "text-emerald-600" : "text-slate-500"}>
                  {flight.refundable ? "Refundable" : "Non-refundable"}
                </span>
              </div>
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <Zap size={11} />
                  {flight.seatsLeft} seats left
                </div>
              )}
            </div>

            <div className="text-right lg:mt-3">
              {flight.originalPrice && (
                <p className="text-xs text-slate-400 line-through">
                  {formatCurrency(flight.originalPrice, flight.currency)}
                </p>
              )}
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(flight.price, flight.currency)}
              </p>
              <p className="text-xs text-slate-500">per person</p>
              <Link
                href={`/flights/${flight.id}`}
                className="mt-2 block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors text-center"
              >
                Select
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-blue-600 hover:bg-blue-50 border-t border-slate-100 transition-colors font-medium"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? "Hide details" : "View fare details"}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Luggage size={14} className="text-blue-500" /> Baggage
            </p>
            <div className="space-y-1 text-slate-600">
              <p>Checked: {flight.baggage}</p>
              <p>Carry-on: {flight.carryOn}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <Info size={14} className="text-blue-500" /> Fare Details
            </p>
            <div className="space-y-1 text-slate-600">
              <p>Type: {flight.fareType}</p>
              <p>Class: {flight.cabinClass}</p>
              {flight.aircraft && <p>Aircraft: {flight.aircraft}</p>}
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-blue-500" /> Policy
            </p>
            <div className="space-y-1">
              <p className={flight.refundable ? "text-emerald-600" : "text-slate-500"}>
                {flight.refundable ? "✓ Free cancellation" : "✗ Non-refundable"}
              </p>
              <p className="text-slate-600">Change fees may apply</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

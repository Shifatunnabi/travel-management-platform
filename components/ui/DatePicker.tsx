"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  containerClassName?: string;
  align?: "left" | "right";
}

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISO(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDisplay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  placeholder = "Select date",
  containerClassName = "flex-1 min-w-0 relative",
  align = "left",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const base = value ? new Date(`${value}T00:00:00`) : min ? new Date(`${min}T00:00:00`) : new Date();
  const [viewMonth, setViewMonth] = useState(base.getMonth());
  const [viewYear, setViewYear] = useState(base.getFullYear());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const minDate = min ? new Date(`${min}T00:00:00`) : null;
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: startWeekday }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    return new Date(viewYear, viewMonth, day) < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
  };

  const isSelected = (day: number) => !!value && toISO(new Date(viewYear, viewMonth, day)) === value;

  const selectDay = (day: number) => {
    onChange(toISO(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  };

  return (
    <div ref={ref} className={containerClassName}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full text-left border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-2.5 transition-all"
      >
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-500 shrink-0" />
          <span className={`text-sm font-bold truncate ${value ? "text-slate-800" : "text-slate-300"}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-72 z-50`}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {firstOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-full border border-slate-300 hover:border-blue-500 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((w) => (
              <span key={w} className="text-[10px] font-semibold text-slate-400 text-center py-1">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day === null ? (
                <span key={`empty-${i}`} />
              ) : (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled(day)}
                  onClick={() => selectDay(day)}
                  className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                    isSelected(day)
                      ? "bg-blue-600 text-white"
                      : isDisabled(day)
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

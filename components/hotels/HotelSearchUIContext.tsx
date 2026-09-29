"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * The mobile "Modify search" and "Filters" triggers live in the header bar
 * (HotelSearchBar), but the drawers they open live down in the results
 * column (HotelSearchCard's modal, HotelFilters' drawer). Sibling subtrees
 * with no props path between them, so the open/close state lives here
 * instead of being threaded through every layer.
 */
interface HotelSearchUIState {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  modifyOpen: boolean;
  setModifyOpen: (open: boolean) => void;
}

const HotelSearchUIContext = createContext<HotelSearchUIState | null>(null);

export function HotelSearchUIProvider({ children }: { children: ReactNode }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);

  return (
    <HotelSearchUIContext.Provider value={{ filtersOpen, setFiltersOpen, modifyOpen, setModifyOpen }}>
      {children}
    </HotelSearchUIContext.Provider>
  );
}

export function useHotelSearchUI() {
  const ctx = useContext(HotelSearchUIContext);
  if (!ctx) throw new Error("useHotelSearchUI must be used within HotelSearchUIProvider");
  return ctx;
}

import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: string;
}

export default function Skeleton({
  width,
  height,
  rounded = "rounded-lg",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={["skeleton", rounded, className].filter(Boolean).join(" ")}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton width="48px" height="48px" rounded="rounded-xl" />
          <div className="space-y-2">
            <Skeleton width="120px" height="14px" />
            <Skeleton width="80px" height="12px" />
          </div>
        </div>
        <Skeleton width="100px" height="32px" rounded="rounded-xl" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton width="80px" height="28px" />
        <Skeleton width="120px" height="16px" />
        <Skeleton width="80px" height="28px" />
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <Skeleton height="200px" rounded="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton width="70%" height="18px" />
        <Skeleton width="50%" height="14px" />
        <div className="flex gap-2">
          <Skeleton width="60px" height="22px" rounded="rounded-full" />
          <Skeleton width="80px" height="22px" rounded="rounded-full" />
        </div>
        <div className="flex justify-between items-end pt-2">
          <Skeleton width="80px" height="24px" />
          <Skeleton width="100px" height="36px" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

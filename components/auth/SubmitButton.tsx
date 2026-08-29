"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SubmitButton({
  children,
  pendingLabel,
  showArrow = true,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  showArrow?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" fullWidth size="lg" loading={pending} className="mt-2">
      {pending ? pendingLabel : children}
      {!pending && showArrow && <ArrowRight size={16} />}
    </Button>
  );
}

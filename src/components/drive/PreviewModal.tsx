"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PreviewModalProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  children?: ReactNode;
};

export function PreviewModal({ open, onClose, children }: PreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        {children}
      </DialogContent>
    </Dialog>
  );
}

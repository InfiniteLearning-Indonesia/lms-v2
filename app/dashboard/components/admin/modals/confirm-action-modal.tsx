"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmButtonText: string;
  confirmCountdown: number;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmButtonText,
  confirmCountdown,
  isDestructive = false,
  onConfirm,
}: ConfirmActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 bg-card border border-border rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-lg text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-xs font-semibold font-heading transition-colors"
              >
                Batal
              </button>
              <button
                disabled={confirmCountdown > 0}
                onClick={() => {
                  onClose();
                  onConfirm();
                }}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold font-heading transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDestructive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-brand-purple hover:bg-brand-purple-hover"
                }`}
              >
                {confirmButtonText}
                {confirmCountdown > 0 ? ` (${confirmCountdown}s)` : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

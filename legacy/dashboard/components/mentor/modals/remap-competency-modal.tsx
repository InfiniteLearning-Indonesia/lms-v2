import React, { useState } from "react";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface MismatchedItem {
  type: "material" | "assignment";
  id: string;
  title: string;
  oldCompetencyName: string;
}

interface RemapCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mismatchedItems: MismatchedItem[];
  availableCompetencies: { id: string; name: string }[];
  onSaveMapping: (remappingData: { type: "material" | "assignment"; id: string; newCompetencyName: string }[]) => void;
  isSubmitting: boolean;
}

export function RemapCompetencyModal({
  isOpen,
  onClose,
  mismatchedItems,
  availableCompetencies,
  onSaveMapping,
  isSubmitting,
}: RemapCompetencyModalProps) {
  // State for the new competency mapping: item.id -> newCompetencyName
  const [mappings, setMappings] = useState<Record<string, string>>({});

  const handleSelectChange = (itemId: string, newName: string) => {
    setMappings((prev) => ({
      ...prev,
      [itemId]: newName,
    }));
  };

  const handleSave = () => {
    const remappingData = mismatchedItems.map((item) => ({
      type: item.type,
      id: item.id,
      newCompetencyName: mappings[item.id] || availableCompetencies[0]?.name || "Kompetensi Umum",
    }));
    onSaveMapping(remappingData);
  };

  // Pre-fill with the first available competency if not selected
  React.useEffect(() => {
    if (isOpen && mismatchedItems.length > 0 && availableCompetencies.length > 0) {
      const initialMappings: Record<string, string> = {};
      mismatchedItems.forEach((item) => {
        initialMappings[item.id] = availableCompetencies[0].name;
      });
      setMappings(initialMappings);
    }
  }, [isOpen, mismatchedItems, availableCompetencies]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-xs"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="relative z-10 bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-6 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
            <div>
              <h3 className="font-heading font-bold text-lg text-amber-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Penyesuaian Silabus (Revisi Kurikulum)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ditemukan materi atau tugas yang merujuk pada kompetensi lama yang sudah tidak ada. Silakan petakan ke kompetensi yang baru.
              </p>
            </div>
            {/* No close button to force the user to remap */}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {mismatchedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        item.type === 'material' ? 'bg-blue-500/10 text-blue-600' : 'bg-brand-purple/10 text-brand-purple'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-through decoration-red-500/50">
                      Kompetensi Lama: {item.oldCompetencyName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    <select
                      value={mappings[item.id] || ""}
                      onChange={(e) => handleSelectChange(item.id, e.target.value)}
                      className="w-full sm:w-[220px] rounded-lg border border-amber-500/30 bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {availableCompetencies.map((comp) => (
                        <option key={comp.id} value={comp.name}>
                          {comp.name}
                        </option>
                      ))}
                      {availableCompetencies.length === 0 && (
                        <option value="Kompetensi Umum">Kompetensi Umum</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Penyesuaian"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

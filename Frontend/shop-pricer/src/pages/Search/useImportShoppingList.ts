import { useRef } from "react";
import type { ShoppingListStructure } from "../../types";

const useImportShoppingList = (onImport: (list: ShoppingListStructure) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-imported
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        if (isValidShoppingList(parsed)) {
          onImport(parsed);
        } else {
          alert("Invalid shopping list format.");
        }
      } catch {
        alert("Failed to parse file. Make sure it's a valid JSON.");
      }
    };

    reader.readAsText(file);
  };

  return { fileInputRef, triggerFileInput, handleFileChange };
};

// Type guard to validate the shape of the imported JSON
const isValidShoppingList = (data: unknown): data is ShoppingListStructure => {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  
  return (
    typeof d.id === "string" &&
    typeof d.name === "string" &&
    Array.isArray(d.items) &&
    typeof d.starred === "boolean" &&
    typeof d.createdAt === "string"
  );
};

export default useImportShoppingList;
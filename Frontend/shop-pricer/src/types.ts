import type { StoreResult, BrandDto } from "./pages/Search/types";

export interface SearchRequestItem {
    id: string;
    details: string;
    tags: string[];
    category?: string;
    categoryId: number;
    pieces?: number;
    weightAmount?: number | string;
    weightUnit?: 'кг' | 'г' | 'л' | 'мл';
    brands: BrandDto[];
    brandSelections?: BrandDto[];
    measurements: string[];
}

export interface ShoppingListStructure {
    id: string;
    name: string;
    items: SearchRequestItem[];
    starred: boolean;
    createdAt: string;
    lastResults: StoreResult[] | null;
    lastOriginalResults: StoreResult[] | null;
    lastResultsAt: string | null;
}
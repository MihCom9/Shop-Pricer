export interface SearchRequestItem {
    id: string;
    details: string;
    category?: string;
    pieces?: number;
    weightAmount?: number | string;
    weightUnit?: 'кг' | 'г' | 'л' | 'мл';
}

export interface ShoppingListStructure {
    id: string;
    name: string;
    items: SearchRequestItem[];
    starred: boolean;
    createdAt: string;
}
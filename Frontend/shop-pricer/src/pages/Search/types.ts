// name: item.details,
//             category: item.category,
//             brand: null,
//             quantity: item.pieces ?? 1,
//             weightGrams: toWeightGrams(item.weightAmount ? String(item.weightAmount) : '', item.weightUnit)

export interface CartItem {
    name: string;
    category?: string;
    brand: string | null;
    quantity: number;
    weightGrams: number | null;
}

interface PriceInfo {
    price: number;
    pricePromotion: number | null;
    effectivePrice: number;
    discountPercent: number;
    pricePerKg: number | null;
    savings: number;
}

export interface ShoppingProduct {
    productName: string;
    priceInfo: PriceInfo;
    measurements: string;
    id: number;
    weightBased: boolean;
    history: number[] | null;
}

export interface ShoppingProductResult {
    id: string;
    cartItem: CartItem;       
    product: ShoppingProduct | null; 
    sizeMismatch: boolean;
    matchTier: number | null;
    alts: ShoppingProduct[] | null;
}

interface StoreSummary{
    totalPrice: number;
    totalProductCount: number;
    foundProductCount: number;
    missingProductCount: number;
    best: boolean;
    savingsVsAvg: number;
    savingsVsBest: number;
}

export interface StoreResult {
    storeName: string;
    locations: string[];
    products: ShoppingProductResult[];
    totalPrice: number;
    storeSummary: StoreSummary;
}

export interface Filters {
    city: string;
    maxDistance: number | null;
    stores: string[];
    sortBy: "price" | "preferred" | "distance" | "most_products";
}

export interface DisplayResultProduct {
    id: number;
    name: string;
    size: string;
    effPrice: number;
    price: number;
    pricePromotion: number | null;
}
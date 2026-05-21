import type { CartItem } from "../../../types";

interface FoundProduct {
    id: string;
    productId: number;
    cartItem: CartItem;
    matched: string;
    measurements: string;
    history: number[];
    price: number;
    promo: number | null;
    mismatch: boolean;
    missing: false;
}

interface MissingProduct {
    id: string,
    cartItem: CartItem;
    mismatch: false;
    missing: true;
}

export type StoreDetailsProduct =  FoundProduct | MissingProduct
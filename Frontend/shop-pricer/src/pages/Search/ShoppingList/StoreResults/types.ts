import type { StoreResult } from "../../types";

export interface SelectedStore extends StoreResult {
    address: string;
    moreVsBest: number;
    isBest: boolean;
}
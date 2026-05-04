export declare class CreateTradeDto {
    learnerId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    orderCategory?: string;
    qty: number;
    price?: number;
}
export declare class CreateOrderDto {
    learnerId: string;
    symbol: string;
    orderType: 'BUY' | 'SELL';
    orderCategory?: string;
    quantity: number;
    price?: number;
}

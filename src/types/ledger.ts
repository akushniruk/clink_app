export interface LedgerEntry {
    id: number;
    account_id: string;
    account_type: number;
    asset: string;
    participant: string;
    credit: string;
    debit: string;
    created_at: string;
}

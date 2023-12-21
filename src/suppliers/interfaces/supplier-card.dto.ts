export interface SupplierCardDto {
    id: number;    
    name: string;
    cnpj: string;
    email?: string;
    website?: string;
    phoneMain?: string;
    phoneSecondary?: string;
    budgetCategory?: string;
}
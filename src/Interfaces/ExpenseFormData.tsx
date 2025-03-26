export type ExpenseFormData = {
    expenseName: string;
    date: string;
    amount: number;
    category: string;
    note?: string;
    image?: File;
};
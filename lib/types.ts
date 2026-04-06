export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  tax?: number;
  total: number;
}

export interface Invoice {
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

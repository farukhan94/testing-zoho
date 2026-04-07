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

// TailorJet Types
export interface TailorJetItem {
  id: string;
  item_code: string;
  name: { en: string };
  unit_price: string;
  vat_group: {
    id: string;
    label: string;
    vat_percentage: string;
  };
  measurement_unit: {
    id: string;
    label: string;
  };
  item_type: {
    id: string;
    label: string;
  };
}

export interface TailorJetJobOrderItem {
  id?: string;
  item: {
    id: string;
    item_code: string;
    label: string;
  };
  item_description: string;
  unit: string;
  quantity: string;
  unit_price: string;
  discount_percentage: string;
  line_amount: string;
  vat_amount: string;
  header_discount: string;
  amount_excl_vat: string;
  amount_incl_vat: string;
  vat_product_group: {
    id: string;
    label: string;
    vat_percentage: string;
  };
  vat_percentage: string;
  discount_amount: string;
}

export interface TailorJetCustomer {
  id: string;
  name: { en: string };
  label: string;
  country: {
    id: string;
    label: string;
  };
  phone: string;
  vat_group: {
    id: string;
    label: string;
  };
  vat_number: string;
  is_domestic: number;
  address1: any[];
  address2: string;
}

export interface TailorJetJobOrder {
  order_date: string;
  trial_date: string;
  due_date: string;
  customer: TailorJetCustomer;
  customer_name: { en: string };
  phone_number: string;
  vat_number: string;
  is_domestic: boolean;
  address1: any[];
  address2: string;
  country: {
    id: string;
    label: string;
  };
  location: {
    id: string;
    label: string;
    is_primary: number;
  };
  customer_location: {
    id: string;
    label: string;
    is_primary: number;
  };
  vat_group: {
    id: string;
    label: string;
  };
  branch: {
    id: string;
    name: string;
    label: string;
  };
  items: TailorJetJobOrderItem[];
  order_detail_info: string;
  discount_percentage: string;
  discount_amount: string;
  gross_total: string;
  sub_total: string;
  vat_amount: string;
  is_advance_job: boolean;
  net_total: string;
  advance_payment: string;
  balance: string;
  payment: string;
  payment_type: string;
  payment_date: string;
  payment_amount: string;
  payment_reference: string;
  payments: any[];
  trouser?: any;
  jacket?: any;
}

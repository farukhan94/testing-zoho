'use client';

import { useState } from 'react';
import { Invoice, InvoiceItem, TailorJetItem, TailorJetJobOrder, TailorJetJobOrderItem } from '@/lib/types';
import ItemSearch from './item-search';

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice, tailorjetData: any) => Promise<void>;
  bearerToken: string;
}

export default function InvoiceForm({ onSubmit, bearerToken }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice>({
    customerName: '',
    customerEmail: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: '',
  });

  const [currentItem, setCurrentItem] = useState<Omit<InvoiceItem, 'id' | 'total'>>({
    name: '',
    description: '',
    quantity: 1,
    rate: 0,
    tax: 0,
  });

  const [tailorjetItems, setTailorjetItems] = useState<TailorJetJobOrderItem[]>([]);
  const [selectedTailorJetItem, setSelectedTailorJetItem] = useState<TailorJetItem | null>(null);

  const calculateItemTotal = (item: Omit<InvoiceItem, 'id' | 'total'>) => {
    const subtotal = item.quantity * item.rate;
    const taxAmount = subtotal * ((item.tax || 0) / 100);
    return subtotal + taxAmount;
  };

  const calculateInvoiceTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);
    
    const tax = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.rate;
      return sum + (itemSubtotal * ((item.tax || 0) / 100));
    }, 0);

    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  };

  const handleItemSelect = (tailorjetItem: TailorJetItem) => {
    // Store the selected TailorJet item for later use
    setSelectedTailorJetItem(tailorjetItem);
    
    // Set the current item with TailorJet data
    setCurrentItem({
      name: `${tailorjetItem.item_code} - ${tailorjetItem.name.en}`,
      description: '',
      quantity: 1,
      rate: parseFloat(tailorjetItem.unit_price),
      tax: parseFloat(tailorjetItem.vat_group.vat_percentage),
    });
  };

  const addItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0 || currentItem.rate <= 0) {
      alert('Please fill in all required item fields with valid values');
      return;
    }

    if (!selectedTailorJetItem) {
      alert('Please select an item from TailorJet search');
      return;
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      ...currentItem,
      total: calculateItemTotal(currentItem),
    };

    // Create TailorJet job order item structure
    const discountPercentage = 0;
    const lineAmount = currentItem.quantity * currentItem.rate;
    const discountAmount = lineAmount * (discountPercentage / 100);
    const amountExclVat = lineAmount - discountAmount;
    const vatAmount = amountExclVat * ((currentItem.tax || 0) / 100);
    const amountInclVat = amountExclVat + vatAmount;

    const tailorjetItem: TailorJetJobOrderItem = {
      item: {
        id: selectedTailorJetItem.id,
        item_code: selectedTailorJetItem.item_code,
        label: selectedTailorJetItem.name.en,
      },
      item_description: currentItem.description || '',
      unit: selectedTailorJetItem.measurement_unit.label,
      quantity: currentItem.quantity.toString(),
      unit_price: currentItem.rate.toFixed(3),
      discount_percentage: discountPercentage.toString(),
      line_amount: amountExclVat.toFixed(3),
      vat_amount: vatAmount.toFixed(3),
      header_discount: '0.000',
      amount_excl_vat: amountExclVat.toFixed(3),
      amount_incl_vat: amountInclVat.toFixed(3),
      vat_product_group: {
        id: selectedTailorJetItem.vat_group.id,
        label: selectedTailorJetItem.vat_group.label,
        vat_percentage: selectedTailorJetItem.vat_group.vat_percentage,
      },
      vat_percentage: selectedTailorJetItem.vat_group.vat_percentage,
      discount_amount: discountAmount.toFixed(3),
    };

    const updatedItems = [...invoice.items, newItem];
    const updatedTailorjetItems = [...tailorjetItems, tailorjetItem];
    const totals = calculateInvoiceTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals,
    });
    
    setTailorjetItems(updatedTailorjetItems);

    setCurrentItem({
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      tax: 0,
    });
    
    setSelectedTailorJetItem(null);
  };

  const removeItem = (id: string) => {
    const itemIndex = invoice.items.findIndex(item => item.id === id);
    const updatedItems = invoice.items.filter(item => item.id !== id);
    const updatedTailorjetItems = tailorjetItems.filter((_, index) => index !== itemIndex);
    const totals = calculateInvoiceTotals(updatedItems);
    
    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals,
    });
    
    setTailorjetItems(updatedTailorjetItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoice.items.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    setIsLoading(true);
    try {
      // Build TailorJet job order data - using placeholder values for now
      const tailorjetData = {
        order_date: invoice.date,
        trial_date: invoice.date,
        due_date: invoice.dueDate,
        customer: {
          id: 'e1990885-7f4a-4fc2-81f4-b72b2059af9e', // Placeholder - should come from form
          name: { en: invoice.customerName },
          label: invoice.customerName,
          country: { id: '0adb6229-fae2-472f-af1e-168bcc9218ab', label: 'BAHRAIN' },
          phone: '-',
          vat_group: { id: '8f6a6b25-4149-4f42-83d4-2ce480fdcd59', label: 'Domestic R' },
          vat_number: '-',
          is_domestic: 1,
          address1: [],
          address2: 'building: -, road: -, flat: -, block: -, area: -',
        },
        customer_name: { en: invoice.customerName },
        phone_number: '-',
        vat_number: '-',
        is_domestic: true,
        address1: [],
        address2: 'building: -, road: -, flat: -, block: -, area: -',
        country: { id: '0adb6229-fae2-472f-af1e-168bcc9218ab', label: 'BAHRAIN' },
        location: { id: 'cc29727c-76a7-423e-8150-a67fe12797ef', label: 'Manama (LOC-FSGQEWIXFNLEV)', is_primary: 0 },
        customer_location: { id: 'a420edfe-8f0e-4a44-b69d-59bf0de06516', label: 'Showroom (CL-8OTQRODRZV7IX)', is_primary: 1 },
        vat_group: { id: '8f6a6b25-4149-4f42-83d4-2ce480fdcd59', label: 'Domestic R' },
        branch: { id: '5349a577-ead9-11f0-8047-e4a8dfd375a3', name: 'MANAMA', label: 'MANAMA' },
        items: tailorjetItems,
        order_detail_info: '',
        discount_percentage: '',
        discount_amount: '0.000',
        gross_total: invoice.subtotal.toFixed(3),
        sub_total: invoice.subtotal.toFixed(3),
        vat_amount: invoice.tax.toFixed(3),
        is_advance_job: false,
        net_total: invoice.total.toFixed(3),
        advance_payment: '0.000',
        balance: invoice.total.toFixed(3),
        payment: '0.000',
        payment_type: '',
        payment_date: invoice.date,
        payment_amount: '',
        payment_reference: '',
        payments: [],
      };

      await onSubmit(invoice, tailorjetData);
    } catch (error) {
      alert('Error submitting invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Create Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium mb-2 text-gray-900">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={invoice.customerName}
                onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2 text-gray-900">
                Customer Email
              </label>
              <input
                type="email"
                id="customerEmail"
                value={invoice.customerEmail}
                onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-2 text-gray-900">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2 text-gray-900">
                Invoice Date *
              </label>
              <input
                type="date"
                id="date"
                value={invoice.date}
                onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-2 text-gray-900">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={invoice.dueDate}
                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Add Items</h2>
          
          {/* Item Search */}
          <div className="mb-4">
            <ItemSearch 
              bearerToken={bearerToken} 
              onItemSelect={handleItemSelect}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="itemName" className="block text-sm font-medium mb-2 text-gray-900">
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-2 text-gray-900">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                min="0.01"
                step="0.01"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium mb-2 text-gray-900">
                Rate *
              </label>
              <input
                type="number"
                id="rate"
                min="0"
                step="0.01"
                value={currentItem.rate}
                onChange={(e) => setCurrentItem({ ...currentItem, rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="itemTax" className="block text-sm font-medium mb-2 text-gray-900">
                Tax (%)
              </label>
              <input
                type="number"
                id="itemTax"
                min="0"
                step="0.01"
                value={currentItem.tax}
                onChange={(e) => setCurrentItem({ ...currentItem, tax: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-900">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Item
          </button>
        </div>

        {/* Items List */}
        {invoice.items.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-900 font-semibold">Item</th>
                    <th className="px-4 py-2 text-right text-gray-900 font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right text-gray-900 font-semibold">Rate</th>
                    <th className="px-4 py-2 text-right text-gray-900 font-semibold">Tax</th>
                    <th className="px-4 py-2 text-right text-gray-900 font-semibold">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                   {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-700">{item.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-gray-900">${item.rate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{item.tax}%</td>
                      <td className="px-4 py-2 text-right text-gray-900 font-semibold">${item.total.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-900">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span className="font-medium">Tax:</span>
                  <span className="font-medium">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Additional Notes</h2>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Any additional notes or terms..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || invoice.items.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
        >
          {isLoading ? 'Sending to Zoho Books...' : 'Send to Zoho Books'}
        </button>
      </form>
    </div>
  );
}

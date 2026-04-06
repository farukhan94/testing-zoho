'use client';

import { useState } from 'react';
import { Invoice, InvoiceItem } from '@/lib/types';

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => Promise<void>;
}

export default function InvoiceForm({ onSubmit }: InvoiceFormProps) {
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

  const addItem = () => {
    if (!currentItem.name || currentItem.quantity <= 0 || currentItem.rate <= 0) {
      alert('Please fill in all required item fields with valid values');
      return;
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      ...currentItem,
      total: calculateItemTotal(currentItem),
    };

    const updatedItems = [...invoice.items, newItem];
    const totals = calculateInvoiceTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals,
    });

    setCurrentItem({
      name: '',
      description: '',
      quantity: 1,
      rate: 0,
      tax: 0,
    });
  };

  const removeItem = (id: string) => {
    const updatedItems = invoice.items.filter(item => item.id !== id);
    const totals = calculateInvoiceTotals(updatedItems);
    
    setInvoice({
      ...invoice,
      items: updatedItems,
      ...totals,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoice.items.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(invoice);
    } catch (error) {
      alert('Error submitting invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={invoice.customerName}
                onChange={(e) => setInvoice({ ...invoice, customerName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">
                Customer Email
              </label>
              <input
                type="email"
                id="customerEmail"
                value={invoice.customerEmail}
                onChange={(e) => setInvoice({ ...invoice, customerEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-2">
                Invoice Number
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                id="date"
                value={invoice.date}
                onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={invoice.dueDate}
                onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Add Items */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="md:col-span-2">
              <label htmlFor="itemName" className="block text-sm font-medium mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="itemName"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                min="0.01"
                step="0.01"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium mb-2">
                Rate *
              </label>
              <input
                type="number"
                id="rate"
                min="0"
                step="0.01"
                value={currentItem.rate}
                onChange={(e) => setCurrentItem({ ...currentItem, rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="itemTax" className="block text-sm font-medium mb-2">
                Tax (%)
              </label>
              <input
                type="number"
                id="itemTax"
                min="0"
                step="0.01"
                value={currentItem.tax}
                onChange={(e) => setCurrentItem({ ...currentItem, tax: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Tax</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">${item.rate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{item.tax}%</td>
                      <td className="px-4 py-2 text-right">${item.total.toFixed(2)}</td>
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
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

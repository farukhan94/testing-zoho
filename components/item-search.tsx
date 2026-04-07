'use client';

import { useState, useEffect } from 'react';
import { TailorJetItem } from '@/lib/types';

interface ItemSearchProps {
  bearerToken: string;
  onItemSelect: (item: TailorJetItem) => void;
}

export default function ItemSearch({ bearerToken, onItemSelect }: ItemSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<TailorJetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsOpen(true);
      searchItems();
    } else {
      loadInitialItems();
    }
  }, [searchQuery]);

  const loadInitialItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tailorjet/items?token=${encodeURIComponent(bearerToken)}&per_page=20`);
      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/tailorjet/items?token=${encodeURIComponent(bearerToken)}&search=${encodeURIComponent(searchQuery)}&per_page=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: TailorJetItem) => {
    onItemSelect(item);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-gray-900">
        Search Item
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder="Search by item code or name..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
      />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No items found</div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.item_code} - {item.name.en}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.measurement_unit.label} • VAT: {item.vat_group.vat_percentage}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {parseFloat(item.unit_price).toFixed(3)} BHD
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.item_type.label}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

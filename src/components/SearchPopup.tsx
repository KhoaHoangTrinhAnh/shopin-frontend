"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

interface SearchPopupProps {
  onSearch?: (query: string) => void;
}

// Mock data cho gợi ý tìm kiếm
const mockSuggestions = [
  "iPhone 15 Pro Max",
  "Samsung Galaxy S24",
  "MacBook Pro M3",
  "ASUS ROG Zephyrus",
  "AirPods Pro",
  "iPad Air",
  "Sony WH-1000XM5",
  "Nintendo Switch",
  "PlayStation 5",
  "Xbox Series X",
  "Apple Watch",
  "Samsung Galaxy Tab",
  "Dell XPS 13",
  "HP Spectre",
  "Lenovo ThinkPad"
];

const SearchPopup: React.FC<SearchPopupProps> = ({ onSearch }) => {
  const { isSearchOpen, closeSearch } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Tự động focus khi mở popup
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside để đóng popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, closeSearch]);

  // ESC key để đóng popup
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  // Tìm kiếm gợi ý
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // Giới hạn tối đa 6 gợi ý
      const limitedSuggestions = filtered.slice(0, 6);
      setSuggestions(limitedSuggestions);
    } else {
      // Khi không có query, hiển thị mảng rỗng để render 6 dòng trống
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    closeSearch();
    if (onSearch) {
      onSearch(suggestion);
    }
    // Navigate to all-products page with search query
    window.location.href = `/all-products?search=${encodeURIComponent(suggestion)}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      closeSearch();
      if (onSearch) {
        onSearch(searchQuery);
      }
      // Navigate to all-products page with search query
      window.location.href = `/all-products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClose = () => {
    closeSearch();
    setSearchQuery('');
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div 
        ref={popupRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Tìm kiếm sản phẩm</h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="flex">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập từ khóa tìm kiếm..."
                className="
                  w-full pl-4 pr-10 py-3 
                  border border-gray-300 rounded-l-lg
                  focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
                  text-sm text-gray-800 bg-white
                "
              />
              
              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim()}
              className="
                px-3 py-3 bg-green-600 text-white rounded-r-lg
                hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors duration-200 flex items-center justify-center
              "
            >
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestions - Fixed height container */}
        <div className="px-4 pb-4">
          <div className="bg-write-50 rounded-lg h-full overflow-hidden">
            {/* Always render 6 suggestion slots */}
            {Array.from({ length: 6 }, (_, index) => {
              const suggestion = suggestions[index];
              return (
                <div
                  key={index}
                  className={`
                    w-full px-4 py-3 text-left text-sm
                    last:border-b-0
                    first:rounded-t-lg last:rounded-b-lg
                    ${suggestion 
                      ? 'text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer' 
                      : 'text-transparent cursor-default'
                    }
                  `}
                  onClick={suggestion ? () => handleSuggestionClick(suggestion) : undefined}
                >
                  <div className="flex items-center">
                    <span className="truncate">{suggestion || 'placeholder'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SearchPopup;

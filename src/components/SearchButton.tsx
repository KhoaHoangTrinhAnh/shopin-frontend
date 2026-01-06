"use client";

import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

const SearchButton: React.FC = () => {
  const { openSearch } = useSearch();

  return (
    <button
      onClick={openSearch}
      className="p-2 rounded-full text-gray-700 hover:text-green-600 hover:bg-gray-100 transition-all duration-200"
    >
      <SearchIcon className="w-5 h-5" />
    </button>
  );
};

export default SearchButton;

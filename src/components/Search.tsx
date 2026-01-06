"use client";

import React from 'react';
import SearchButton from './SearchButton';

interface SearchProps {
  onSearch?: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSearch }) => {
  return <SearchButton />;
};

export default Search;

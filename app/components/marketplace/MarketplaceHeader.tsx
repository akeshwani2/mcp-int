"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const MarketplaceHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full">
      <div className="relative w-full max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full p-2 pl-10 text-xs tracking-tight text-white border border-gray-800 rounded-sm bg-black focus:ring-0 focus:border-gray-700 transition-all"
            placeholder="Search for MCP servers"
          />
        </div>
      </div>
    </div>
  );
}; 
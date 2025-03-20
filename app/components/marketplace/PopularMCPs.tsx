"use client";

import React from 'react';
import { MCPCard } from './MCPCard';
import { POPULAR_MCPS } from './mcp-data';

export const PopularMCPs = () => {
  return (
    <div id="popular-section" className="bg-black rounded-sm p-1">
      <div className="flex items-center mb-1 gap-2">
        <h2 className="text-sm font-medium tracking-tight text-white">Popular</h2>
      </div>
      <p className="text-xs text-gray-400 mb-5 tracking-tight">Most used tools and integrations</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {POPULAR_MCPS.map((mcp) => (
          <MCPCard
            key={mcp.id}
            id={mcp.id}
            name={mcp.name}
            icon={mcp.icon}
            description={mcp.description}
            link={mcp.link}
          />
        ))}
      </div>
    </div>
  );
}; 
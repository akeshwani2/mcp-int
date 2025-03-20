"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { MCPCard } from './MCPCard';
import { PRODUCTIVITY_MCPS } from './mcp-data';

export const ProductivityMCPs = () => {
  return (
    <div className="bg-black rounded-sm p-1">
      <div className="flex items-center mb-1 gap-2">
        <h2 className="text-sm font-medium tracking-tight text-white">Productivity</h2>
      </div>
      <p className="text-xs text-gray-400 mb-5 tracking-tight">Tools to improve workflow and efficiency</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRODUCTIVITY_MCPS.map((mcp) => (
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
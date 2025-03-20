"use client";

import React from 'react';
import { DEVELOPER_TOOLS_MCPS } from './mcp-data';
import { MCPCard } from './MCPCard';

export const DeveloperToolsMCPs: React.FC = () => {
  return (
    <div id="developer-tools-section" className="bg-black rounded-sm p-1">
      <div className="flex items-center mb-1 gap-2">
        <h2 className="text-sm font-medium tracking-tight text-white">Developer Tools & DevOps</h2>
      </div>
      <p className="text-xs text-gray-400 mb-5 tracking-tight">Developer and DevOps tools and integrations</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEVELOPER_TOOLS_MCPS.map((mcp) => (
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
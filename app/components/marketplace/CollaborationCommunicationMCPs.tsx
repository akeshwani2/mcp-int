"use client";

import React from 'react';
import { COLLABORATION_COMMUNICATION_MCPS } from './mcp-data';
import { MCPCard } from './MCPCard';

export const CollaborationCommunicationMCPs: React.FC = () => {
  return (
    <div id="collaboration-communication-section" className="bg-black rounded-sm p-1">
      <div className="flex items-center mb-1 gap-2">
        <h2 className="text-sm font-medium tracking-tight text-white">Collaboration & Communication</h2>
      </div>
      <p className="text-xs text-gray-400 mb-5 tracking-tight">Tools for team communication, video conferencing, and collaboration</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLLABORATION_COMMUNICATION_MCPS.map((mcp) => (
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
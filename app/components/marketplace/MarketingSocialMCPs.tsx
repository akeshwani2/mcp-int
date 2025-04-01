// "use client";

// import React from 'react';
// import { MARKETING_SOCIAL_MCPS } from './mcp-data';
// import { MCPCard } from './MCPCard';

// export const MarketingSocialMCPs: React.FC = () => {
//   return (
//     <div id="marketing-social-section" className="bg-black rounded-sm p-1">
//       <div className="flex items-center mb-1 gap-2">
//         <h2 className="text-sm font-medium tracking-tight text-white">Marketing & Social Media</h2>
//       </div>
//       <p className="text-xs text-gray-400 mb-5 tracking-tight">Marketing, social media, and SEO tools for growing your online presence</p>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {MARKETING_SOCIAL_MCPS.map((mcp) => (
//           <MCPCard
//             key={mcp.id}
//             id={mcp.id}
//             name={mcp.name}
//             icon={mcp.icon}
//             description={mcp.description}
//             link={mcp.link}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }; 
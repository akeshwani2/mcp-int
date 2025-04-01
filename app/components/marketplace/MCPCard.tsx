// This component is not currently used
// "use client";
// 
// import React, { useState } from 'react';
// import { ExternalLink } from 'lucide-react';
// import Link from 'next/link';
// export interface MCPProps {
//   id: string;
//   name: string;
//   icon: string;
//   description: string;
//   link: string;
// }
// 
// export const MCPCard: React.FC<MCPProps> = ({
//   id,
//   name,
//   icon,
//   description,
//   link,
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   
//   return (
//     <div 
//       className={`relative bg-black border border-gray-800 rounded-sm overflow-visible hover:border-gray-700 transition-all duration-200 hover:scale-105 ${isHovered ? 'z-40' : ''}`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <Link href={link} target="_blank" rel="noopener noreferrer">
//         <div className="p-4 cursor-pointer">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-3">
//               <div className="relative w-8 h-8">
//                 <img
//                   src={icon}
//                   alt={`${name} icon`}
//                   className="rounded-sm object-contain w-full h-full p-0.5 border border-gray-700 bg-white/5 shadow-[0_0_5px_rgba(255,255,255,0.1)]"
//                 />
//               </div>
//               <h3 className="text-sm font-medium tracking-tight text-white">{name}</h3>
//             </div>
//             
//             <div className="text-gray-500 hover:text-white transition-colors">
//               <ExternalLink size={16} />
//             </div>
//           </div>
//           
//           <p className="text-xs text-gray-400 mb-3 line-clamp-2 tracking-tight">{description}</p>
//         </div>
//       </Link>
//       
//       {/* Dropdown card with improved transitions */}
//       <div 
//         className={`absolute z-50 top-full left-0  mt-2 bg-white border border-gray-700 rounded-sm shadow-lg 
//                    transition-all duration-300 ease-in-out transform origin-top
//                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
//       >
//         <div className="p-4">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="relative w-10 h-10">
//               <img
//                 src={icon}
//                 alt={`${name} icon`}
//                 className="rounded-sm object-contain w-full h-full border border-gray-700 bg-white/5 shadow-[0_0_5px_rgba(255,255,255,0.1)] p-0.5"
//               />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium tracking-tight text-white">{name}</h3>
//             </div>
//           </div>
//           
//           <p className="text-xs text-gray-400 mb-4">{description}</p>
//           
//           <div className="flex justify-between items-center">
//             <Link 
//               href={link}
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-1 text-xs text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded-sm transition-colors"
//               onClick={(e) => e.stopPropagation()}
//             >
//               Get MCP Server <ExternalLink size={12} />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
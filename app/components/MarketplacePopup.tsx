
// 'use client'

// import React, { useEffect } from 'react'
// import { X } from 'lucide-react'
// import { MarketplaceHeader } from './marketplace/MarketplaceHeader'
// import { PopularMCPs } from './marketplace/PopularMCPs'
// import { ProductivityMCPs } from './marketplace/ProductivityMCPs'
// import { DeveloperToolsMCPs } from './marketplace/DeveloperToolsMCPs'
// import { MarketingSocialMCPs } from './marketplace/MarketingSocialMCPs'
// import { CollaborationCommunicationMCPs } from './marketplace/CollaborationCommunicationMCPs'
// import { AnalyticsDataMCPs } from './marketplace/AnalyticsDataMCPs'

// interface MarketplacePopupProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function MarketplacePopup({ isOpen, onClose }: MarketplacePopupProps) {
//   // Prevent body scrolling when popup is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.style.overflow = ''
//     }
//     return () => {
//       document.body.style.overflow = ''
//     }
//   }, [isOpen])

//   if (!isOpen) return null

//   return (
//     <div 
//       className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300"
//       onClick={onClose}
//     >
//       <div 
//         className="bg-black/80 rounded-xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-zinc-800 marketplace-header bg-zinc-900/90 backdrop-blur-sm">
//           <h2 className="text-xl font-medium text-white">Marketplace</h2>
//           <button 
//             onClick={onClose}
//             className="rounded-full p-2 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="flex-1 overflow-y-auto marketplace-content custom-scrollbar">
//           <div className="p-6">
//             <MarketplaceHeader />
//           </div>
          
//           <div className="px-6 pb-8 space-y-12">
//             {/* Popular Section */}
//             <section id="popular">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-purple-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-purple-400 text-xs">★</span>
//                 </span>
//                 Popular MCPs
//               </h3>
//               <PopularMCPs />
//             </section>
            
//             {/* Productivity Section */}
//             <section id="productivity">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-blue-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-blue-400 text-xs">⚡</span>
//                 </span>
//                 Productivity
//               </h3>
//               <ProductivityMCPs />
//             </section>
            
//             {/* Developer Tools Section */}
//             <section id="devtools">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-orange-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-orange-400 text-xs">⚙️</span>
//                 </span>
//                 Developer Tools
//               </h3>
//               <DeveloperToolsMCPs />
//             </section>
            
//             {/* Marketing & Social Section */}
//             <section id="marketing">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-green-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-green-400 text-xs">📈</span>
//                 </span>
//                 Marketing & Social
//               </h3>
//               <MarketingSocialMCPs />
//             </section>
            
//             {/* Collaboration & Communication Section */}
//             <section id="collaboration">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-indigo-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-indigo-400 text-xs">👥</span>
//                 </span>
//                 Collaboration & Communication
//               </h3>
//               <CollaborationCommunicationMCPs />
//             </section>
            
//             {/* Analytics & Data Section */}
//             <section id="analytics">
//               <h3 className="text-lg font-medium mb-4 text-white/90 flex items-center">
//                 <span className="bg-red-500/20 w-6 h-6 flex items-center justify-center rounded-md mr-2">
//                   <span className="text-red-400 text-xs">📊</span>
//                 </span>
//                 Analytics & Data
//               </h3>
//               <AnalyticsDataMCPs />
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// } 
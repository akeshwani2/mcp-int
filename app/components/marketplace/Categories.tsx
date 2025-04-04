// "use client";

// import React, { useState } from 'react';

// type Category = {
//   id: string;
//   name: string;
// };

// const CATEGORIES: Category[] = [
//   { id: 'popular', name: 'Popular' },
//   // { id: 'productivity', name: 'Productivity & Project Management' },
//   // { id: 'crm', name: 'CRM' },
//   // { id: 'productivity-only', name: 'Productivity' },
//   // { id: 'finance', name: 'Finance & Accounting' },
//   // { id: 'security', name: 'Security & Compliance' },
//   { id: 'devtools', name: 'Developer Tools & DevOps' },
//   { id: 'marketing', name: 'Marketing & Social Media' },
//   { id: 'collaboration', name: 'Collaboration & Communication' },
//   { id: 'analytics', name: 'Analytics & Data' },
//   { id: 'finance', name: 'Finance & Crypto' },
//   { id: 'document', name: 'Document & File Management' },
//   { id: 'misc', name: 'Other / Miscellaneous' },
// ];

// type CategoriesProps = {
//   onCategoryChange?: (categoryId: string) => void;
// };

// export const Categories: React.FC<CategoriesProps> = ({ onCategoryChange }) => {
//   const [selectedCategory, setSelectedCategory] = useState('popular');

//   const handleCategoryClick = (categoryId: string) => {
//     setSelectedCategory(categoryId);
//     if (onCategoryChange) {
//       onCategoryChange(categoryId);
//     }
//   };

//   return (
//     <div className="border border-gray-800 rounded-md p-4">
//       <h2 className="text-md tracking-tight mb-4">Categories</h2>
//       <div className="space-y-1">
//         {CATEGORIES.map((category) => (
//           <div
//             key={category.id}
//             className={`px-3 py-2 rounded-sm text-sm tracking-tight cursor-pointer transition-all duration-200 ${
//               selectedCategory === category.id
//                 ? 'bg-white text-black border-l-2 border-l-white'
//                 : 'hover:bg-gray-900 text-gray-300'
//             }`}
//             onClick={() => handleCategoryClick(category.id)}
//           >
//             {category.name}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }; 
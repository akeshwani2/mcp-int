"use client";

import { useState } from "react";

type ToolCallRendererProps = {
  name: string;
  args: any;
  status: string;
  result: any;
};

export const ToolCallRenderer: React.FC<ToolCallRendererProps> = ({
  name,
  args,
  status,
  result,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format JSON objects for display
  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    running: "bg-yellow-500/20 text-yellow-300",
    success: "bg-green-500/20 text-green-300",
    error: "bg-red-500/20 text-red-300",
    pending: "bg-blue-500/20 text-blue-300",
    unknown: "bg-gray-500/20 text-gray-300",
  };

  const statusColor = statusColors[status.toLowerCase()] || "bg-gray-700/20 text-gray-300";

  return (
    <div className="my-2 rounded-lg border border-gray-800 overflow-hidden shadow-sm bg-black">
      {/* Header - always visible */}
      <div 
        className="flex items-center justify-between p-3 bg-zinc-900 cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-2">
          <div className="tracking-tight text-white">{name}</div>
          {/* <div className={`text-xs px-1 py-1 rounded-lg uppercase ${statusColor}`}>
            {status}
          </div> */}
        </div>
        {/* <button 
          className="text-gray-400 hover:text-gray-200 focus:outline-none transition-transform transform"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <svg 
            className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button> */}
      </div>

      {/* Details - visible when expanded */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-800">
          {/* Arguments Section */}
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-400 mb-1">Arguments:</div>
            <pre className="text-xs bg-zinc-900 p-2 rounded overflow-auto max-h-40 text-gray-300">
              {formatJSON(args)}
            </pre>
          </div>

          {/* Result Section - shown only if there's a result */}
          {result && (
            <div>
              <div className="text-sm font-medium text-gray-400 mb-1">Result:</div>
              <pre className="text-xs bg-zinc-900 p-2 rounded overflow-auto max-h-40 text-gray-300">
                {formatJSON(result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 
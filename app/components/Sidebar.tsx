"use client";

import React from "react";
import { MessageCircle, Store, File, Mail, Calendar, CheckSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  
  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center 
                    bg-black border border-white/20 rounded-full py-4 px-2 z-50
                    shadow-lg"
    >
      <Link href="/">
        <button
          className={`p-2 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300 ${
            pathname === "/" ? "text-white bg-red-500" : "text-white/70"
          }`}
          aria-label="Chat"
        >
          <MessageCircle size={20} />
        </button>
      </Link>

      <Link href="/email">
        <button
          className={`p-2 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300 ${
            pathname === "/email" ? "text-white bg-red-500" : "text-white/70"
          }`}
          aria-label="Email"
        >
          <Mail size={20} />
        </button>
      </Link>

      <Link href="/calendar">
        <button
          className={`p-2 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300 ${
            pathname === "/calendar" ? "text-white bg-red-500" : "text-white/70"
          }`}
          aria-label="Calendar"
        >
          <Calendar size={20} />
        </button>
      </Link>

      {/* <Link href="/tasks">
        <button
          className={`p-2 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300 ${
            pathname === "/tasks" ? "text-white bg-red-500" : "text-white/70"
          }`}
          aria-label="Tasks"
        >
          <CheckSquare size={20} />
        </button>
      </Link> */}
      
      <Link href="/marketplace">
        <button
          className={`p-2 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300 ${
            pathname === "/marketplace" ? "text-white bg-red-500" : "text-white/70"
          }`}
          aria-label="Marketplace"
        >
          <Store size={20} />
        </button>
      </Link>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { Home, Settings, Info, MessageCircle } from 'lucide-react';

interface SidebarProps {
  onNavigate?: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate = () => {} }) => {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center 
                    bg-black border border-white/20 rounded-full py-4 px-2 z-50
                    shadow-lg">
      <button 
        onClick={() => onNavigate('/')}
        className="p-2 text-white/70 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300"
        aria-label="Home"
      >
        <Home size={20} />
      </button>
      
      <button 
        onClick={() => onNavigate('chat')}
        className="p-2 text-white/70 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300"
        aria-label="Chat"
      >
        <MessageCircle size={20} />
      </button>
      
      <button 
        onClick={() => onNavigate('settings')}
        className="p-2 text-white/70 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full mb-4 transition-all duration-300"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>
      
      <button 
        onClick={() => onNavigate('info')}
        className="p-2 text-white/70 cursor-pointer hover:scale-105 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        aria-label="Info"
      >
        <Info size={20} />
      </button>
    </div>
  );
};

export default Sidebar;

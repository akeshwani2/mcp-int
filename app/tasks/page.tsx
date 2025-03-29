"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TasksWidget from '../components/TasksWidget';
import { ServerTracker } from '../components/ServerTracker';
import { MCPConfigForm } from '../components/MCPConfigForm';
import { X } from 'lucide-react';

const TasksPage = () => {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-16 p-6">
        {/* Server tracker in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <ServerTracker onConfigClick={() => setConfigOpen(true)} />
        </div>

        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <TasksWidget />
        </div>
      </div>

      {/* Server config panel - Modal dialog */}
      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-4xl h-[90vh] bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => setConfigOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors z-10"
              aria-label="Close config"
            >
              <X size={20} />
            </button>
            <div className="h-full overflow-auto">
              <MCPConfigForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 
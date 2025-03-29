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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-xl h-auto max-h-[80vh] overflow-hidden shadow-xl">
            <button
              onClick={() => setConfigOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
              aria-label="Close config"
            >
              <X size={20} />
            </button>
            <div className="overflow-auto">
              <MCPConfigForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 
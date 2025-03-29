"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TasksWidget from '../components/TasksWidget';

const TasksPage = () => {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar 
        onNavigate={() => {}}
        onConfigClick={() => setConfigOpen(!configOpen)}
        activeView="tasks"
      />

      {/* Main Content */}
      <div className="flex-1 ml-16 p-6">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>
        
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <TasksWidget />
        </div>
      </div>
    </div>
  );
};

export default TasksPage; 
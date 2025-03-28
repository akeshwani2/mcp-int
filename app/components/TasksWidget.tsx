"use client";

import React, { useState, useEffect } from 'react';
import { CheckSquare, PlusCircle, Calendar, Clock, Tag, Search, Filter, Users, Check, X, Edit, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  assignee?: string;
  tags: string[];
  created_at: string;
}

interface TasksWidgetProps {
  // Props can be added as needed
}

export default function TasksWidget({}: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskSummary, setTaskSummary] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    incomplete_tasks: 0,
    completion_percentage: 0,
    priority_counts: {
      high: 0,
      medium: 0,
      low: 0
    },
    overdue: 0,
    due_today: 0,
    due_this_week: 0
  });

  // Sample tasks for demonstration
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Finish the draft and send to the team for review',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      priority: 'high',
      completed: false,
      assignee: 'me',
      tags: ['work', 'urgent'],
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Schedule team meeting',
      description: 'Discuss quarterly goals with the team',
      due_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      priority: 'medium',
      completed: false,
      assignee: 'me',
      tags: ['work', 'meeting'],
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Buy groceries',
      description: 'Get milk, eggs, bread, and vegetables',
      due_date: new Date().toISOString(), // Today
      priority: 'medium',
      completed: false,
      assignee: 'me',
      tags: ['personal'],
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Review code changes',
      priority: 'low',
      completed: true,
      tags: ['work', 'development'],
      created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
    }
  ];

  useEffect(() => {
    // Simulate loading tasks from an API
    const loadTasks = () => {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      setTimeout(() => {
        setTasks(sampleTasks);
        setIsLoading(false);
        
        // Update summary
        const completed = sampleTasks.filter(t => t.completed).length;
        const total = sampleTasks.length;
        const incomplete = total - completed;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdue = sampleTasks.filter(t => 
          !t.completed && 
          t.due_date && 
          new Date(t.due_date) < today
        ).length;
        
        const dueToday = sampleTasks.filter(t => {
          if (!t.due_date || t.completed) return false;
          const taskDate = new Date(t.due_date);
          return taskDate.getDate() === today.getDate() &&
                 taskDate.getMonth() === today.getMonth() &&
                 taskDate.getFullYear() === today.getFullYear();
        }).length;
        
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const dueThisWeek = sampleTasks.filter(t => 
          !t.completed && 
          t.due_date && 
          new Date(t.due_date) > today && 
          new Date(t.due_date) <= nextWeek
        ).length;
        
        setTaskSummary({
          total_tasks: total,
          completed_tasks: completed,
          incomplete_tasks: incomplete,
          completion_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          priority_counts: {
            high: sampleTasks.filter(t => t.priority === 'high').length,
            medium: sampleTasks.filter(t => t.priority === 'medium').length,
            low: sampleTasks.filter(t => t.priority === 'low').length
          },
          overdue,
          due_today: dueToday,
          due_this_week: dueThisWeek
        });
      }, 800);
    };
    
    loadTasks();
  }, []);

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
  };

  const addNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      priority: 'medium',
      completed: false,
      tags: [],
      created_at: new Date().toISOString()
    };
    
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply status filter
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate.getDate() === today.getDate() &&
               taskDate.getMonth() === today.getMonth() &&
               taskDate.getFullYear() === today.getFullYear();
      });
    } else if (filter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(task => 
        !task.completed && 
        task.due_date && 
        new Date(task.due_date) > today
      );
    } else if (filter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(term) || 
        (task.description && task.description.toLowerCase().includes(term)) ||
        task.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()) {
      return 'Today';
    } else if (date.getDate() === tomorrow.getDate() &&
              date.getMonth() === tomorrow.getMonth() &&
              date.getFullYear() === tomorrow.getFullYear()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-medium mb-1">Tasks</h2>
        <p className="text-zinc-400 text-sm">
          {taskSummary.incomplete_tasks} remaining • {taskSummary.completion_percentage}% complete
        </p>
      </div>

      {/* Task overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <Clock size={20} className="text-blue-400" />
            </div>
            <span className="text-2xl font-semibold">{taskSummary.due_today}</span>
          </div>
          <h3 className="text-zinc-300 text-sm">Due today</h3>
        </div>
        
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-amber-500/20 p-2 rounded-full">
              <Calendar size={20} className="text-amber-400" />
            </div>
            <span className="text-2xl font-semibold">{taskSummary.due_this_week}</span>
          </div>
          <h3 className="text-zinc-300 text-sm">Due this week</h3>
        </div>
        
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <Tag size={20} className="text-purple-400" />
            </div>
            <span className="text-2xl font-semibold">{taskSummary.priority_counts.high}</span>
          </div>
          <h3 className="text-zinc-300 text-sm">High priority</h3>
        </div>
        
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-green-500/20 p-2 rounded-full">
              <CheckSquare size={20} className="text-green-400" />
            </div>
            <span className="text-2xl font-semibold">{taskSummary.completed_tasks}</span>
          </div>
          <h3 className="text-zinc-300 text-sm">Completed</h3>
        </div>
      </div>

      {/* Task filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${filter === 'all' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${filter === 'today' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${filter === 'upcoming' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${filter === 'completed' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            Completed
          </button>
        </div>
        
        <div className="flex w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-800 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Add task button */}
      <button
        onClick={() => setShowAddTask(true)}
        className="flex items-center justify-center space-x-2 w-full p-3 mb-4 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
      >
        <PlusCircle size={18} />
        <span>Add Task</span>
      </button>

      {/* Add task form */}
      {showAddTask && (
        <div className="mb-4 p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="What do you need to do?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-transparent text-white border-b border-zinc-700 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex space-x-2 ml-2">
              <button
                onClick={addNewTask}
                disabled={!newTaskTitle.trim()}
                className="p-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskTitle('');
                }}
                className="p-2 rounded-md bg-zinc-700 text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-zinc-400">Loading tasks...</p>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-zinc-800 p-4 rounded-full inline-flex mx-auto mb-4">
              <CheckSquare size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-zinc-400 max-w-xs mx-auto">
              {searchTerm ? 'Try a different search term' : `No ${filter} tasks. Add a task to get started.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {filteredTasks.map(task => (
              <li 
                key={task.id} 
                className={`rounded-lg bg-zinc-800 transition-colors ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="p-3 flex items-start">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-0.5 mr-3 flex-shrink-0 w-5 h-5 rounded-full border ${
                      task.completed 
                        ? 'bg-green-600 border-green-600 flex items-center justify-center' 
                        : task.priority === 'high' 
                          ? 'border-red-500'
                          : task.priority === 'medium'
                            ? 'border-amber-500' 
                            : 'border-white/30'
                    }`}
                  >
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-zinc-400' : ''}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.due_date && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-300">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-700 text-zinc-300">
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 space-x-1 ml-2">
                    <button className="p-1 rounded hover:bg-zinc-700 transition-colors">
                      <Edit size={16} className="text-zinc-400" />
                    </button>
                    <button 
                      className="p-1 rounded hover:bg-zinc-700 transition-colors"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={16} className="text-zinc-400" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
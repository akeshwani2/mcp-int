"use client";

import { useState, useEffect } from "react";
import { useCoAgent } from "@copilotkit/react-core";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { CirclePlus, TerminalSquare, X, Plus, Trash2, Globe } from "lucide-react";

type ConnectionType = "stdio" | "sse";

interface StdioConfig {
  command: string;
  args: string[];
  transport: "stdio";
}

interface SSEConfig {
  url: string;
  transport: "sse";
}

type ServerConfig = StdioConfig | SSEConfig;

// Define a generic type for our state
interface AgentState {
  mcp_config: Record<string, ServerConfig>;
}

// Local storage key for saving agent state
const STORAGE_KEY = "mcp-agent-state";

const ExternalLink = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-3 h-3 ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

export function MCPConfigForm() {
  // Use our localStorage hook for persistent storage
  const [savedConfigs, setSavedConfigs] = useLocalStorage<
    Record<string, ServerConfig>
  >(STORAGE_KEY, {});

  // Initialize agent state with the data from localStorage
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>(
    {
      name: "sample_agent",
      initialState: {
        mcp_config: savedConfigs,
      },
    }
  );

  // Simple getter for configs
  const configs = agentState?.mcp_config || {};

  // Simple setter wrapper for configs
  const setConfigs = (newConfigs: Record<string, ServerConfig>) => {
    setAgentState({ ...agentState, mcp_config: newConfigs });
    setSavedConfigs(newConfigs);
  };

  const [serverName, setServerName] = useState("");
  const [connectionType, setConnectionType] = useState<ConnectionType>("stdio");
  const [command, setCommand] = useState("");
  const [args, setArgs] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddServerForm, setShowAddServerForm] = useState(false);
  const [showExampleConfigs, setShowExampleConfigs] = useState(false);

  // Calculate server statistics
  const totalServers = Object.keys(configs).length;
  const stdioServers = Object.values(configs).filter(
    (config) => config.transport === "stdio"
  ).length;
  const sseServers = Object.values(configs).filter(
    (config) => config.transport === "sse"
  ).length;

  // Set loading to false when state is loaded
  useEffect(() => {
    if (agentState) {
      setIsLoading(false);
    }
  }, [agentState]);

  const handleExampleConfig = (exampleConfig: Record<string, ServerConfig>) => {
    // Merge the example with existing configs or replace them based on user preference
    if (Object.keys(configs).length > 0) {
      const shouldReplace = window.confirm(
        "Do you want to replace your current configuration with this example? Click 'OK' to replace, or 'Cancel' to merge."
      );

      if (shouldReplace) {
        setConfigs(exampleConfig);
      } else {
        setConfigs({ ...configs, ...exampleConfig });
      }
    } else {
      setConfigs(exampleConfig);
    }

    // Close the examples panel after selection
    setShowExampleConfigs(false);
  };

  const addConfig = () => {
    if (!serverName) return;

    const newConfig =
      connectionType === "stdio"
        ? {
            command,
            args: args.split(" ").filter((arg) => arg.trim() !== ""),
            transport: "stdio" as const,
          }
        : {
            url,
            transport: "sse" as const,
          };

    setConfigs({
      ...configs,
      [serverName]: newConfig,
    });

    // Reset form
    setServerName("");
    setCommand("");
    setArgs("");
    setUrl("");
    setShowAddServerForm(false);
  };

  const removeConfig = (name: string) => {
    const newConfigs = { ...configs };
    delete newConfigs[name];
    setConfigs(newConfigs);
  };

  if (isLoading) {
    return <div className="p-4 animate-pulse text-gray-500">Loading configurations...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col p-6 bg-black text-zinc-300">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-light text-white tracking-wide">Echo</h1>
          <p className="text-xs text-zinc-500 mt-1">{totalServers} active server{totalServers !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAddServerForm(true)}
          className="px-3 hover:scale-105 transition-all duration-300 cursor-pointer py-1.5 bg-zinc-900 text-zinc-400 rounded border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Server
        </button>
      </header>

      {totalServers === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-zinc-600 border border-zinc-800 rounded-md bg-zinc-900/30">
          <p className="text-sm mb-3">Visit the <a href="/marketplace" className="text-zinc-400 hover:text-zinc-300">marketplace</a> to find a server to connect to!</p>
          <button
            onClick={() => setShowAddServerForm(true)}
            className="px-3 hover:scale-105 transition-all duration-300 cursor-pointer py-1.5 bg-zinc-800 text-zinc-400 rounded border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add your first server
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(configs).map(([name, config]) => (
            <div
              key={name}
              className="relative p-4 rounded-md border border-zinc-800 bg-zinc-900/30"
            >
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => removeConfig(name)}
                  className="cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              
              <div className="flex flex-col items-start">
                <div className="mb-2 inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs border border-zinc-700 bg-zinc-800/50">
                  {config.transport === "stdio" ? (
                    <TerminalSquare className="w-3 h-3 mr-1 text-zinc-500" />
                  ) : (
                    <Globe className="w-3 h-3 mr-1 text-zinc-500" />
                  )}
                  <span className="uppercase text-zinc-500">{config.transport}</span>
                </div>
                
                <h3 className="text-sm font-medium text-white mb-1">{name}</h3>
                
                <div className="text-xs text-zinc-500">
                  {config.transport === "stdio" ? (
                    <p className="font-mono">{config.command}</p>
                  ) : (
                    <p className="font-mono truncate max-w-[250px]" title={config.url}>{config.url}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddServerForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
              <h2 className="text-zinc-300 text-sm font-medium">Add Server</h2>
              <button
                onClick={() => setShowAddServerForm(false)}
                className="text-zinc-500 cursor-pointer hover:scale-105 transition-all duration-300 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
            <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  Server Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectionType("stdio")}
                    className={`flex items-center justify-center cursor-pointer px-3 py-2 rounded text-xs ${
                      connectionType === "stdio"
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    <TerminalSquare className="w-3.5 h-3.5 mr-1.5" />
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionType("sse")}
                    className={`flex items-center cursor-pointer justify-center px-3 py-2 rounded text-xs ${
                      connectionType === "sse"
                        ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    SSE
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="e.g. gmail-service, cal-bot"
                />
              </div>

              

              {connectionType === "stdio" ? (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">
                      Script
                    </label>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                      placeholder="e.g. python"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5">
                      Arguments
                    </label>
                    <input
                      type="text"
                      value={args}
                      onChange={(e) => setArgs(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                      placeholder="e.g. path/to/main.py"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    placeholder="e.g. https://mcp.composio.dev/gmail"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-zinc-800">
              <button
                onClick={() => setShowAddServerForm(false)}
                className="px-3 py-1.5 cursor-pointer border border-zinc-800 text-zinc-400 rounded text-xs hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={addConfig}
                className="px-3 py-1.5 cursor-pointer bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-xs hover:bg-zinc-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

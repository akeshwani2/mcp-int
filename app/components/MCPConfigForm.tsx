'use client'

import { useEffect, useState } from 'react'
import { useCoAgent } from '@copilotkit/react-core'
import {
  CirclePlus,
  Dot,
  Globe,
  Plus,
  StoreIcon,
  TerminalSquare,
  TerminalSquareIcon,
  Trash2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
// import { MarketplacePopup } from '../components/MarketplacePopup'

type ConnectionType = 'stdio' | 'sse'

interface StdioConfig {
  command: string
  args: string[]
  transport: 'stdio'
}

interface SSEConfig {
  url: string
  transport: 'sse'
}

type ServerConfig = StdioConfig | SSEConfig

// Define a generic type for our state
interface AgentState {
  mcp_config: Record<string, ServerConfig>
}

// Server for localStorage
interface MCPServer {
  id: string
  name: string
  transport: string
  command: string | null
  args: string | null
  url: string | null
  lastUsed: string | null
}

export function MCPConfigForm() {
  // State for server configurations
  const [configs, setConfigs] = useState<Record<string, ServerConfig>>({})
  
  // Update agent state when configs change
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>({
    name: 'sample_agent',
    initialState: {
      mcp_config: {},
    },
  })

  const [serverName, setServerName] = useState('')
  const [connectionType, setConnectionType] = useState<ConnectionType>('stdio')
  const [command, setCommand] = useState('')
  const [args, setArgs] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddServerForm, setShowAddServerForm] = useState(false)
  const [showExampleConfigs, setShowExampleConfigs] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)

  // Calculate server statistics
  const totalServers = Object.keys(configs).length
  const stdioServers = Object.values(configs).filter(
    (config) => config.transport === 'stdio'
  ).length
  const sseServers = Object.values(configs).filter((config) => config.transport === 'sse').length

  // Load servers from localStorage
  useEffect(() => {
    const loadServersFromLocalStorage = () => {
      try {
        // Get servers from localStorage
        const serversJson = localStorage.getItem('mcp_servers') || '[]'
        const servers: MCPServer[] = JSON.parse(serversJson)
        
        // Convert to ServerConfig format
        const configsFromStorage: Record<string, ServerConfig> = {}
        
        servers.forEach(server => {
          if (server.transport === 'stdio') {
            configsFromStorage[server.name] = {
              command: server.command || '',
              args: server.args ? JSON.parse(server.args) : [],
              transport: 'stdio' as const
            }
          } else if (server.transport === 'sse') {
            configsFromStorage[server.name] = {
              url: server.url || '',
              transport: 'sse' as const
            }
          }
        })
        
        setConfigs(configsFromStorage)
        
        // Only update agent state if it's different to prevent infinite loops
        if (agentState && JSON.stringify(agentState.mcp_config) !== JSON.stringify(configsFromStorage)) {
          setAgentState(prevState => ({
            ...prevState,
            mcp_config: configsFromStorage
          }))
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading servers from localStorage:', error)
        // Initialize with empty array if there's an error
        localStorage.setItem('mcp_servers', '[]')
        setIsLoading(false)
      }
    }
    
    loadServersFromLocalStorage()
    
    // Listen for storage changes
    window.addEventListener('storage', loadServersFromLocalStorage)
    window.addEventListener('mcp_servers_updated', loadServersFromLocalStorage)
    
    return () => {
      window.removeEventListener('storage', loadServersFromLocalStorage)
      window.removeEventListener('mcp_servers_updated', loadServersFromLocalStorage)
    }
  }, []) // Remove dependencies to prevent infinite updates

  const addConfig = () => {
    if (!serverName) return

    // Get current servers
    const serversJson = localStorage.getItem('mcp_servers') || '[]'
    const servers: MCPServer[] = JSON.parse(serversJson)
    
    // Check if server with this name already exists
    if (servers.some(server => server.name === serverName)) {
      alert('A server with this name already exists. Please choose a different name.')
      return
    }

    // Create new server config
    const newConfig: ServerConfig =
      connectionType === 'stdio'
        ? {
            command,
            args: args.split(' ').filter((arg) => arg.trim() !== ''),
            transport: 'stdio' as const,
          }
        : {
            url,
            transport: 'sse' as const,
          }

    // Create new server for localStorage
    const newServer: MCPServer = {
      id: uuidv4(),
      name: serverName,
      transport: connectionType,
      command: connectionType === 'stdio' ? command : null,
      args: connectionType === 'stdio' ? JSON.stringify(args.split(' ').filter(arg => arg.trim() !== '')) : null,
      url: connectionType === 'sse' ? url : null,
      lastUsed: new Date().toISOString()
    }
    
    // Add to localStorage
    servers.push(newServer)
    localStorage.setItem('mcp_servers', JSON.stringify(servers))
    
    // Dispatch custom event for updating other components
    window.dispatchEvent(new Event('mcp_servers_updated'))

    // Update local state
    const updatedConfigs = {
      ...configs,
      [serverName]: newConfig,
    }
    
    setConfigs(updatedConfigs)
    
    // Update agent state safely using the function form
    setAgentState(prevState => ({
      ...prevState,
      mcp_config: updatedConfigs
    }))

    // Reset form
    setServerName('')
    setCommand('')
    setArgs('')
    setUrl('')
    setShowAddServerForm(false)
  }

  const removeConfig = (name: string) => {
    try {
      // Get current servers
      const serversJson = localStorage.getItem('mcp_servers') || '[]'
      const servers: MCPServer[] = JSON.parse(serversJson)
      
      // Filter out the server to remove
      const updatedServers = servers.filter(server => server.name !== name)
      
      // Save back to localStorage
      localStorage.setItem('mcp_servers', JSON.stringify(updatedServers))
      
      // Dispatch custom event for updating other components
      window.dispatchEvent(new Event('mcp_servers_updated'))
      
      // Update local state
      const newConfigs = { ...configs }
      delete newConfigs[name]
      
      setConfigs(newConfigs)
      
      // Update agent state safely using the function form
      setAgentState(prevState => ({
        ...prevState,
        mcp_config: newConfigs
      }))
    } catch (error) {
      console.error('Error removing server:', error)
      alert('Failed to remove server. Please try again.')
    }
  }

  if (isLoading) {
    return <div className="p-4 animate-pulse text-gray-500">Loading your servers...</div>
  }

  return (
    <div className="max-w-3xl max-h-[80vh] overflow-y-auto flex flex-col p-4 bg-zinc-900 text-zinc-300 mx-auto">
      <header className="mb-3 border-b border-zinc-800 pb-3">
        <div className="grid grid-cols-3 gap-2 w-full">
          {/* Active Servers Card */}
          <div className={`${totalServers === 0 ? 'border border-gray-800' : 'border border-white/40'} rounded-lg p-2`}>
            <div className="flex items-center justify-between">
              <span className={`${totalServers === 0 ? 'text-xs text-zinc-500' : 'text-xs text-white'}`}>
                Active Servers
              </span>
              <span className={`${totalServers === 0 ? 'text-sm text-zinc-500' : 'text-sm text-white'}`}>
                {totalServers}
              </span>
            </div>
          </div>
          {/* SSE Servers Card */}
          <div className={`${sseServers === 0 ? 'border border-gray-800' : 'border border-white/40'} rounded-lg p-2`}>
            <div className="flex items-center justify-between">
              <span className={`${sseServers === 0 ? 'text-xs text-zinc-500' : 'text-xs text-white'}`}>
                SSE Servers
              </span>
              <span className={`${sseServers === 0 ? 'text-sm text-zinc-500' : 'text-sm text-white'}`}>
                {sseServers}
              </span>
            </div>
          </div>
          {/* Standard/IO Servers Card */}
          <div className={`${stdioServers === 0 ? 'border border-gray-800' : 'border border-white/40'} rounded-lg p-2`}>
            <div className="flex items-center justify-between">
              <span className={`${stdioServers === 0 ? 'text-xs text-zinc-500' : 'text-xs text-white'}`}>
                Standard Servers
              </span>
              <span className={`${stdioServers === 0 ? 'text-sm text-zinc-500' : 'text-sm text-white'}`}>
                {stdioServers}
              </span>
            </div>
          </div>
        </div>
      </header>

      {totalServers === 0 ? (
        <div className="flex flex-col items-center justify-center py-5 text-zinc-600 border border-zinc-800 rounded-md bg-background">
          <p className="text-xs mb-2">
            No servers connected yet. Add a server or browse the marketplace.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddServerForm(true)}
              className="px-3 hover:scale-105 transition-all duration-300 cursor-pointer py-1.5 bg-background text-zinc-400 rounded border border-zinc-700 hover:bg-zinc-700 flex items-center gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Server
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowAddServerForm(true)}
              className="px-3 flex-1 hover:scale-105 transition-all duration-300 cursor-pointer py-1.5 bg-background text-zinc-400 text-center justify-center rounded border border-zinc-800 hover:bg-zinc-800 flex items-center gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Server
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(configs).map(([name, config]) => (
              <div
                key={name}
                className="relative p-3 rounded-md border border-zinc-800 bg-zinc-900/30"
              >
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => removeConfig(name)}
                    className="cursor-pointer hover:scale-105 transition-all duration-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>

                <div className="flex flex-col items-start pr-5">
                  <div className="flex items-center">
                    {config.transport === 'stdio' ? (
                      <TerminalSquare size={14} className="mr-1.5 text-green-500" />
                    ) : (
                      <Globe size={14} className="mr-1.5 text-blue-500" />
                    )}
                    <h3 className="text-xs font-medium text-white">{name}</h3>
                  </div>

                  <div className="text-[10px] text-zinc-500 mt-1 max-w-full overflow-hidden">
                    {config.transport === 'stdio' ? (
                      <p className="font-mono truncate">{config.command}</p>
                    ) : (
                      <p className="font-mono truncate" title={config.url}>
                        {config.url}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddServerForm && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-zinc-800">
              <h2 className="text-zinc-300 text-xs font-medium">Add Server</h2>
              <button
                onClick={() => setShowAddServerForm(false)}
                className="text-zinc-500 cursor-pointer hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Server Name</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                  placeholder="e.g. Gmail"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Server Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectionType('stdio')}
                    className={`flex items-center justify-center cursor-pointer px-2 py-1.5 rounded text-xs ${
                      connectionType === 'stdio'
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    <TerminalSquare className="w-3.5 h-3.5 mr-1.5" />
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectionType('sse')}
                    className={`flex items-center cursor-pointer justify-center px-2 py-1.5 rounded text-xs ${
                      connectionType === 'sse'
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    SSE
                  </button>
                </div>
              </div>

              {connectionType === 'stdio' ? (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Command</label>
                    <input
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                      placeholder="e.g. python"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Arguments</label>
                    <input
                      type="text"
                      value={args}
                      onChange={(e) => setArgs(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                      placeholder="e.g. path/to/main.py"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">URL</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded text-xs px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                    placeholder="e.g. https://mcp.composio.dev/gmail"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-3 border-t border-zinc-800">
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

      {/* Marketplace popup */}
      {/* <MarketplacePopup isOpen={showMarketplace} onClose={() => setShowMarketplace(false)} /> */}
    </div>
  )
}

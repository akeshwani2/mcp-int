'use client'

import { useEffect, useState } from 'react'
import { Server, Plus } from 'lucide-react'
import { useCoAgent } from '@copilotkit/react-core'

interface AgentState {
  mcp_config: Record<string, any>
}

interface MCPServer {
  id: string
  name: string
  transport: string
  command: string | null
  args: string | null
  url: string | null
  lastUsed: string | null
}

interface ServerTrackerProps {
  onConfigClick: () => void
}

export function ServerTracker({ onConfigClick }: ServerTrackerProps) {
  const [serverCount, setServerCount] = useState(0)
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>({
    name: 'sample_agent',
  })

  useEffect(() => {
    const loadServersFromLocalStorage = () => {
      try {
        // Get servers from localStorage
        const serversJson = localStorage.getItem('mcp_servers') || '[]'
        const servers: MCPServer[] = JSON.parse(serversJson)
        setServerCount(servers.length)
        
        // Update the agent state with the server data
        if (agentState) {
          const configs: Record<string, any> = {}
          
          servers.forEach(server => {
            if (server.transport === 'stdio') {
              configs[server.name] = {
                command: server.command || '',
                args: server.args ? JSON.parse(server.args) : [],
                transport: 'stdio'
              }
            } else if (server.transport === 'sse') {
              configs[server.name] = {
                url: server.url || '',
                transport: 'sse'
              }
            }
          })
          
          // Only update if configurations are different
          if (JSON.stringify(agentState.mcp_config) !== JSON.stringify(configs)) {
            setAgentState(prevState => ({
              ...prevState,
              mcp_config: configs
            }))
          }
        }
      } catch (error) {
        console.error('Error loading servers from localStorage:', error)
        // Initialize with empty array if there's an error
        localStorage.setItem('mcp_servers', '[]')
      }
    }
    
    loadServersFromLocalStorage()
    
    // Add event listener for storage changes
    window.addEventListener('storage', loadServersFromLocalStorage)
    // Add custom event listener for our own storage changes
    window.addEventListener('mcp_servers_updated', loadServersFromLocalStorage)
    
    return () => {
      window.removeEventListener('storage', loadServersFromLocalStorage)
      window.removeEventListener('mcp_servers_updated', loadServersFromLocalStorage)
    }
  }, []) // Remove dependencies to prevent infinite updates

  return (
    <button 
      onClick={onConfigClick}
      className="hover:scale-105 transition-all duration-300 rounded-full cursor-pointer"
      aria-label="Open server configuration"
    >
      {serverCount > 0 ? (
        <div className="flex items-center bg-black/50 border border-white/10 rounded-full py-1 px-3 text-sm hover:bg-black/70">
          <Server size={14} className="mr-2" />
          <span>{serverCount}</span>
          <span className="ml-1 text-white/60">servers</span>
        </div>
      ) : (
        <div className="flex items-center bg-black/50 border border-white/10 rounded-full py-1 px-3 text-sm hover:bg-black/70">
          <Plus size={14} className="mr-2" />
          <span className="text-white/60">Add Servers</span>
        </div>
      )}
    </button>
  )
} 
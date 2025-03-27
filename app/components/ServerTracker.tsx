'use client'

import { useEffect, useState } from 'react'
import { Server } from 'lucide-react'
import { useCoAgent } from '@copilotkit/react-core'

interface AgentState {
  mcp_config: Record<string, any>
}

interface MCPServerFromDB {
  id: string
  name: string
  transport: string
  command: string | null
  args: string | null
  url: string | null
  sessionId: string
  createdAt: string
  updatedAt: string
  lastUsed: string | null
}

export function ServerTracker() {
  const [serverCount, setServerCount] = useState(0)
  const { state: agentState, setState: setAgentState } = useCoAgent<AgentState>({
    name: 'sample_agent',
  })

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/servers')
        if (!response.ok) {
          throw new Error('Failed to fetch servers')
        }
        
        const servers: MCPServerFromDB[] = await response.json()
        setServerCount(servers.length)
        
        // Update the agent state with the server data
        if (agentState) {
          const configsFromDB: Record<string, any> = {}
          
          servers.forEach(server => {
            if (server.transport === 'stdio') {
              configsFromDB[server.name] = {
                command: server.command || '',
                args: server.args ? JSON.parse(server.args) : [],
                transport: 'stdio'
              }
            } else if (server.transport === 'sse') {
              configsFromDB[server.name] = {
                url: server.url || '',
                transport: 'sse'
              }
            }
          })
          
          setAgentState({ ...agentState, mcp_config: configsFromDB })
        }
      } catch (error) {
        console.error('Error fetching servers:', error)
      }
    }
    
    fetchServers()
  }, [])

  return (
    <div className="flex items-center bg-black/50 border border-white/10 rounded-full py-1 px-3 text-sm">
      <Server size={14} className="mr-2" />
      <span>{serverCount}</span>
      <span className="ml-1 text-white/60">servers</span>
    </div>
  )
} 
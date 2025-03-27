import { useCoAgent } from '@copilotkit/react-core'
import { Server } from 'lucide-react'

interface AgentState {
  mcp_config: Record<string, any>
}

export function ServerTracker() {
  const { state: agentState } = useCoAgent<AgentState>({
    name: 'sample_agent',
  })

  // Get the total number of servers from the agent state
  const totalServers = agentState?.mcp_config ? Object.keys(agentState.mcp_config).length : 0

  return (
    <div className="flex items-center bg-black/50 border border-white/10 rounded-full py-1 px-3 text-sm">
      <Server size={14} className="mr-2" />
      <span>{totalServers}</span>
      <span className="ml-1 text-white/60">servers</span>
    </div>
  )
} 
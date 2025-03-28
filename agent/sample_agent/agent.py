from typing_extensions import Literal, TypedDict, Dict, List, Any, Union, Optional
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from copilotkit import CopilotKitState
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
import os

class StdioConnection(TypedDict):
    command: str
    args: List[str]
    transport: Literal["stdio"]

class SSEConnection(TypedDict):
    url: str
    transport: Literal["sse"]

MCPConfig = Dict[str, Union[StdioConnection, SSEConnection]]

class AgentState(CopilotKitState):
    """
    this is where we define the state of the agent.
    so here we are inheriting from the copilotkit state, which will bring in the fields for the copilotkit state.
    we are also adding a custom field called `mcp_config`, which will be used to configure the mcp services for the agent
    and we're adding additional fields to support a more comprehensive personal assistant
    """
    mcp_config: Optional[MCPConfig]
    calendar_data: Optional[Dict[str, Any]]
    tasks: Optional[List[Dict[str, Any]]]
    user_preferences: Optional[Dict[str, Any]]
    connected_services: Optional[Dict[str, bool]]

DEFAULT_MCP_CONFIG: MCPConfig = {
    "math": {
        "command": "python",
        "args": [os.path.join(os.path.dirname(__file__), "..", "math_server.py")],
        "transport": "stdio",
    },
    # Adding calendar service
    "calendar": {
        "command": "python",
        "args": [os.path.join(os.path.dirname(__file__), "..", "calendar_server.py")],
        "transport": "stdio",
    },
    # Adding task management service
    "tasks": {
        "command": "python",
        "args": [os.path.join(os.path.dirname(__file__), "..", "task_server.py")],
        "transport": "stdio",
    },
}

async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["__end__"]]:
    """
    this is an agent but, simplified, and it uses the react agent as a subgraph
    it should handle both chat responses and the tool executions in a single node (hopefully)
    and now handles comprehensive personal assistant capabilities
    """
    # get mcp configuration from state, or use the default config if not provided
    mcp_config = state.get("mcp_config", DEFAULT_MCP_CONFIG)

    print(f"mcp_config: {mcp_config}, default: {DEFAULT_MCP_CONFIG}")
    
    # set up the mcp client and tools using the configuration from state
    async with MultiServerMCPClient(mcp_config) as mcp_client:
        # get the tools
        mcp_tools = mcp_client.get_tools()
        
        # create the react agent with a more powerful model for comprehensive assistant capabilities
        model = ChatOpenAI(model="gpt-4o-mini")
        react_agent = create_react_agent(model, mcp_tools)
        
        # prepare messages for the react agent
        agent_input = {
            "messages": state["messages"]
        }
        
        # Add context about connected services and user preferences if available
        if state.get("connected_services"):
            connected_services_msg = {"role": "system", "content": f"The user has the following services connected: {state['connected_services']}"}
            agent_input["messages"].append(connected_services_msg)
            
        if state.get("user_preferences"):
            user_prefs_msg = {"role": "system", "content": f"User preferences: {state['user_preferences']}"}
            agent_input["messages"].append(user_prefs_msg)
        
        # run the react agent subgraph with our input
        agent_response = await react_agent.ainvoke(agent_input)
        
        # update the state with the new messages
        updated_messages = state["messages"] + agent_response.get("messages", [])
        
        # end the graph with the updated messages
        return Command(
            goto=END,
            update={"messages": updated_messages},
        )

# define a more comprehensive workflow graph with nodes for various assistant capabilities
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("chat_node")

# compile the workflow graph
graph = workflow.compile(MemorySaver())
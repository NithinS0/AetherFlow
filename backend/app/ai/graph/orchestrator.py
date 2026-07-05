import os
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from ..agents.opsgpt import opsgpt_node

# Define the State for the LangGraph orchestrator
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], "The conversation history"]
    intent: str
    organization_id: str

# Mock node for intent detection
def detect_intent(state: AgentState):
    # In a real implementation, this would use a lightweight LLM call or classifier
    # to determine which specialized agent (Monitoring, OpsGPT, Incident) should handle the request.
    # For now, route everything to OpsGPT.
    return {"intent": "opsgpt"}

# Router logic
def route_request(state: AgentState):
    if state["intent"] == "opsgpt":
        return "opsgpt"
    return "opsgpt" # Default fallback

# Build the graph
def build_graph():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("detect_intent", detect_intent)
    workflow.add_node("opsgpt", opsgpt_node)
    
    # Define edges
    workflow.set_entry_point("detect_intent")
    
    workflow.add_conditional_edges(
        "detect_intent",
        route_request,
        {
            "opsgpt": "opsgpt"
        }
    )
    
    workflow.add_edge("opsgpt", END)
    
    return workflow.compile()

# Global orchestrator instance
orchestrator_app = build_graph()

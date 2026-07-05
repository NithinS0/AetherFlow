import os
from langchain_core.messages import AIMessage
from langchain_groq import ChatGroq

def opsgpt_node(state):
    """
    The OpsGPT agent acts as the primary coordinator for operations.
    It takes the conversation history and generates a response using the Groq API.
    """
    messages = state["messages"]
    
    llm = ChatGroq(
        temperature=0.2,
        model_name="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY", "dummy_key")
    )
    
    try:
        # In a full implementation, we would inject the system prompt here
        # reading from app_v2/ai/prompts/opsgpt_prompt.md
        response = llm.invoke(messages)
        return {"messages": [response]}
    except Exception as e:
        # Graceful fallback on API failure
        return {"messages": [AIMessage(content=f"OpsGPT encountered an error communicating with Groq: {str(e)}")]}

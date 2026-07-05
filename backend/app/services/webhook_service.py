import logging
import httpx
from typing import Dict, Any

logger = logging.getLogger("aetherflow.webhooks")

class WebhookService:
    """Handles dispatching of outbound webhooks asynchronously."""
    
    @staticmethod
    async def dispatch(event_type: str, payload: Dict[str, Any], url: str, headers: Dict[str, str] = None):
        """
        Dispatches an event to the provided URL.
        Designed to be run as a FastAPI BackgroundTask.
        """
        if not headers:
            headers = {}
        
        headers["X-AetherFlow-Event"] = event_type
        
        logger.info(f"Dispatching webhook '{event_type}' to {url}")
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                logger.info(f"Webhook '{event_type}' delivered successfully. Status: {response.status_code}")
        except httpx.HTTPError as e:
            logger.error(f"Failed to deliver webhook '{event_type}' to {url}: {e}")
            # In a production system, this would queue a retry policy in the DLQ.

webhook_service = WebhookService()

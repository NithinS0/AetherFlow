import asyncio
import logging
from typing import Callable, Any, Dict, List

logger = logging.getLogger(__name__)

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
        logger.info(f"Subscribed handler to {event_type}")

    async def publish(self, event_type: str, payload: Any):
        handlers = self.subscribers.get(event_type, [])
        logger.info(f"Publishing {event_type} to {len(handlers)} handlers")
        
        # Fire-and-forget execution of event handlers
        for handler in handlers:
            asyncio.create_task(self._safe_execute(handler, payload))

    async def _safe_execute(self, handler: Callable, payload: Any):
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(payload)
            else:
                handler(payload)
        except Exception as e:
            logger.error(f"Error in event handler {handler.__name__}: {str(e)}")

# Global singleton event bus
bus = EventBus()

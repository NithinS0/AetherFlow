import uuid
from datetime import datetime
from app.database.session import AsyncSessionLocal
from app.models import SystemEvent
from app.api.sockets import socket_manager

class EventBus:
    @staticmethod
    async def publish(
        event_type: str,
        entity_type: str,
        entity_id: str,
        details: str = None
    ) -> None:
        """
        Publishes a system event. Persists the event in the database
        and broadcasts it in real time via Websockets.
        """
        async with AsyncSessionLocal() as db:
            event = SystemEvent(
                id=uuid.uuid4(),
                event_type=event_type,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details,
                timestamp=datetime.utcnow()
            )
            db.add(event)
            await db.commit()

        # Broadcast via WebSockets
        try:
            await socket_manager.broadcast(event_type, {
                "event_type": event_type,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "details": details,
                "timestamp": event.timestamp.isoformat()
            })
        except Exception:
            # WebSocket might not have active clients during tests
            pass

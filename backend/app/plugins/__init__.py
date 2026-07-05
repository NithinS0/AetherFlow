from .manager import BasePlugin, plugin_manager
from typing import Dict, Any
import logging

logger = logging.getLogger("aetherflow.plugins.email")

class EmailWorkerPlugin(BasePlugin):
    name = "EmailWorker"
    version = "1.0.0"
    author = "AetherFlow Enterprise"
    description = "Executes email delivery jobs via SMTP or SendGrid."

    async def execute(self, payload: Dict[str, Any]) -> Any:
        if not self.enabled:
            return {"status": "skipped", "reason": "plugin disabled"}
        
        to_email = payload.get("to")
        subject = payload.get("subject", "No Subject")
        
        logger.info(f"[EmailWorker] Sending email to {to_email} with subject '{subject}'")
        # In a real scenario, integrate SMTP/SendGrid here.
        return {"status": "success", "delivered_to": to_email}

class WebhookWorkerPlugin(BasePlugin):
    name = "WebhookWorker"
    version = "1.2.0"
    author = "AetherFlow Enterprise"
    description = "Dispatches HTTP POST webhooks for external integrations."

    async def execute(self, payload: Dict[str, Any]) -> Any:
        if not self.enabled:
            return {"status": "skipped", "reason": "plugin disabled"}
        
        url = payload.get("url")
        data = payload.get("data", {})
        
        logger.info(f"[WebhookWorker] Dispatching webhook to {url}")
        # In a real scenario, use httpx to POST data to the url.
        return {"status": "success", "dispatched_to": url}

class OcrWorkerPlugin(BasePlugin):
    name = "OCRWorker"
    version = "2.0.1"
    author = "AetherFlow Computer Vision"
    description = "Extracts text from images using optical character recognition."

    async def execute(self, payload: Dict[str, Any]) -> Any:
        if not self.enabled:
            return {"status": "skipped", "reason": "plugin disabled"}
        
        image_url = payload.get("image_url")
        logger.info(f"[OCRWorker] Processing image at {image_url}")
        return {"status": "success", "extracted_text": "Sample text extracted from image"}

# Register standard plugins
plugin_manager.register(EmailWorkerPlugin)
plugin_manager.register(WebhookWorkerPlugin)
plugin_manager.register(OcrWorkerPlugin)

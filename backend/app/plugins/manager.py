from typing import Dict, Any, Type
import logging

logger = logging.getLogger("aetherflow.plugins")

class BasePlugin:
    """Base class for all AetherFlow plugins."""
    name: str = "BasePlugin"
    version: str = "1.0.0"
    author: str = "AetherFlow"
    description: str = "Base plugin class"

    def __init__(self):
        self.enabled = False

    def enable(self):
        self.enabled = True
        logger.info(f"Plugin {self.name} v{self.version} enabled.")

    def disable(self):
        self.enabled = False
        logger.info(f"Plugin {self.name} v{self.version} disabled.")

    async def execute(self, payload: Dict[str, Any]) -> Any:
        raise NotImplementedError("Plugins must implement execute()")

class PluginManager:
    """Manages lifecycle of all installed plugins."""
    def __init__(self):
        self.plugins: Dict[str, BasePlugin] = {}

    def register(self, plugin_class: Type[BasePlugin]):
        plugin_instance = plugin_class()
        self.plugins[plugin_instance.name] = plugin_instance
        logger.info(f"Registered plugin: {plugin_instance.name}")

    def get_plugin(self, name: str) -> BasePlugin:
        return self.plugins.get(name)

    def list_plugins(self) -> Dict[str, Any]:
        return {
            name: {
                "name": p.name,
                "version": p.version,
                "author": p.author,
                "description": p.description,
                "enabled": p.enabled
            }
            for name, p in self.plugins.items()
        }

    def enable_plugin(self, name: str):
        if name in self.plugins:
            self.plugins[name].enable()

    def disable_plugin(self, name: str):
        if name in self.plugins:
            self.plugins[name].disable()

# Global plugin manager instance
plugin_manager = PluginManager()

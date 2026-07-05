"""
GET   /api/v1/plugins              — list installed plugins
PATCH /api/v1/plugins/{name}       — toggle plugin enabled/disabled
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.dependencies.auth import get_current_user
from app.models import User
from app.plugins import plugin_manager
from app.api.common import ok

router = APIRouter()


class PluginPatch(BaseModel):
    enabled: bool


@router.get(
    "",
    summary="List plugins",
    description="Returns all installed plugins and their enabled status.",
)
async def list_plugins(current_user: User = Depends(get_current_user)):
    return ok(plugin_manager.list_plugins(), "Plugins retrieved.")


@router.patch(
    "/{plugin_name}",
    summary="Toggle plugin",
    description="Enable or disable a plugin by name. Pass `{enabled: true}` to enable, `false` to disable.",
)
async def toggle_plugin(
    plugin_name: str,
    body: PluginPatch,
    current_user: User = Depends(get_current_user),
):
    if not plugin_manager.get_plugin(plugin_name):
        raise HTTPException(status_code=404, detail="Plugin not found")

    if body.enabled:
        plugin_manager.enable_plugin(plugin_name)
    else:
        plugin_manager.disable_plugin(plugin_name)

    return ok(
        {"plugin": plugin_name, "enabled": body.enabled},
        f"Plugin '{plugin_name}' {'enabled' if body.enabled else 'disabled'}.",
    )

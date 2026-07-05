"""
GET  /api/v1/settings              — get platform settings and feature flags
PUT  /api/v1/settings/features/{name} — toggle a feature flag
PUT  /api/v1/settings/platform        — update platform-wide settings
"""
import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models import Setting, User
from app.api.common import ok

router = APIRouter()

DEFAULT_FEATURE_FLAGS: Dict[str, bool] = {
    "ai_assistant": True,
    "workflow_builder": True,
    "plugins": True,
    "notifications": True,
    "analytics": True,
    "digital_twin": False,
    "replay_engine": False,
    "chat": True,
}

DEFAULT_PLATFORM_SETTINGS: Dict[str, Any] = {
    "maintenance_mode": False,
    "log_retention_days": 30,
    "max_concurrent_jobs": 1000,
    "theme": "dark",
}


def get_default_settings() -> Dict[str, Any]:
    return {
        "features": dict(DEFAULT_FEATURE_FLAGS),
        "platform": dict(DEFAULT_PLATFORM_SETTINGS),
    }


async def get_org_settings(db: AsyncSession, current_user: User) -> Setting:
    if current_user.organization_id:
        stmt = select(Setting).filter(Setting.organization_id == current_user.organization_id)
        res = await db.execute(stmt)
        setting = res.scalars().first()
        if setting:
            return setting

        setting = Setting(
            id=uuid.uuid4(),
            organization_id=current_user.organization_id,
            settings_json=get_default_settings(),
        )
        db.add(setting)
        await db.flush()
        return setting

    # Fallback to user-specific settings when organization context is missing.
    stmt = select(Setting).filter(Setting.user_id == current_user.id)
    res = await db.execute(stmt)
    setting = res.scalars().first()
    if setting:
        return setting

    setting = Setting(
        id=uuid.uuid4(),
        user_id=current_user.id,
        settings_json=get_default_settings(),
    )
    db.add(setting)
    await db.flush()
    return setting


def build_settings_payload(setting: Setting) -> Dict[str, Any]:
    settings_json = setting.settings_json or {}
    return {
        "features": dict(settings_json.get("features", DEFAULT_FEATURE_FLAGS)),
        "platform": dict(settings_json.get("platform", DEFAULT_PLATFORM_SETTINGS)),
    }


class FeatureToggle(BaseModel):
    enabled: bool


class PlatformSettings(BaseModel):
    settings: Dict[str, Any]


@router.get(
    "",
    summary="Get settings",
    description="Returns all platform feature flags and configuration settings.",
)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await get_org_settings(db, current_user)
    return ok(build_settings_payload(setting), "Settings retrieved.")


@router.put(
    "/features/{feature_name}",
    summary="Toggle feature flag",
    description="Enable or disable a feature flag by name.",
)
async def toggle_feature(
    feature_name: str,
    body: FeatureToggle | None = None,
    enabled: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await get_org_settings(db, current_user)
    current_payload = setting.settings_json or {}
    features = dict(current_payload.get("features", DEFAULT_FEATURE_FLAGS))
    if feature_name not in features:
        raise HTTPException(status_code=404, detail=f"Feature flag '{feature_name}' not found.")

    if enabled is not None:
        val = enabled
    elif body is not None:
        val = body.enabled
    else:
        raise HTTPException(status_code=400, detail="Missing 'enabled' value in body or query param.")

    features[feature_name] = val
    current_payload["features"] = features
    setting.settings_json = current_payload
    await db.flush()

    return ok(
        {"feature": feature_name, "enabled": val},
        f"Feature '{feature_name}' {'enabled' if val else 'disabled'}.",
    )


@router.get("/sections/{section}", summary="Get settings section")
async def get_settings_section(
    section: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await get_org_settings(db, current_user)
    payload = build_settings_payload(setting)

    if section == "platform":
        return ok({"platform": payload["platform"]}, "Platform settings.")
    if section == "appearance":
        return ok({"appearance": {"theme": payload["platform"].get("theme", "dark")}}, "Appearance settings.")
    if section == "features":
        return ok({"features": payload["features"]}, "Feature flags retrieved.")

    raise HTTPException(status_code=404, detail=f"Settings section '{section}' not found.")


class SectionUpdate(BaseModel):
    settings: Dict[str, Any] | None = None
    # allow simple payloads like {"theme":"dark"}


@router.put("/sections/{section}", summary="Update settings section")
async def update_settings_section(
    section: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await get_org_settings(db, current_user)
    payload = body.get("settings") if isinstance(body, dict) else {}
    if payload is None:
        payload = body

    current_payload = setting.settings_json or {}
    features = dict(current_payload.get("features", DEFAULT_FEATURE_FLAGS))
    platform = dict(current_payload.get("platform", DEFAULT_PLATFORM_SETTINGS))

    if section == "platform":
        for k, v in payload.items():
            if k in platform:
                platform[k] = v
        current_payload["platform"] = platform
        setting.settings_json = current_payload
        await db.flush()
        return ok(platform, "Platform settings updated.")

    if section == "appearance":
        theme = payload.get("theme") if isinstance(payload, dict) else None
        if not theme and isinstance(payload, dict):
            theme = payload.get("settings", {}).get("theme")
        if theme:
            platform["theme"] = theme
            current_payload["platform"] = platform
            setting.settings_json = current_payload
            await db.flush()
            return ok({"theme": theme}, "Appearance updated.")
        raise HTTPException(status_code=400, detail="Missing 'theme' value for appearance section.")

    if section == "features":
        for k, v in payload.items():
            if k in features:
                features[k] = bool(v)
        current_payload["features"] = features
        setting.settings_json = current_payload
        await db.flush()
        return ok(features, "Features updated.")

    raise HTTPException(status_code=404, detail=f"Settings section '{section}' not found or cannot be updated.")


@router.put(
    "/platform",
    summary="Update platform settings",
    description="Update one or more platform-level configuration values.",
)
async def update_platform_settings(
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = await get_org_settings(db, current_user)
    current_payload = setting.settings_json or {}
    platform = dict(current_payload.get("platform", DEFAULT_PLATFORM_SETTINGS))
    payload = body.get("settings") if isinstance(body, dict) else body

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid payload for platform settings update.")

    for key, value in payload.items():
        if key in platform:
            platform[key] = value

    current_payload["platform"] = platform
    setting.settings_json = current_payload
    await db.flush()
    return ok(platform, "Platform settings updated.")

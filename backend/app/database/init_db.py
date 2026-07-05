import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import User, Organization, Team, Project, Role, Permission, role_permissions, team_members, ProjectMember, RetryPolicy, Queue
from app.core.security import get_password_hash

async def init_db(db: AsyncSession) -> None:
    # 1. Seed Permissions
    permissions_list = [
        {"code": "manage_org", "description": "Manage workspace settings and ownership metadata"},
        {"code": "manage_members", "description": "Invite and remove workspace members"},
        {"code": "create_project", "description": "Create scheduler projects"},
        {"code": "delete_project", "description": "Archive scheduler projects"},
        {"code": "view_audit_logs", "description": "View system audit trails"},
        {"code": "manage_roles", "description": "Manage simplified role assignments"},
        {"code": "manage_api_keys", "description": "Manage integration API keys"},
        {"code": "manage_settings", "description": "Manage platform settings"},
    ]

    permissions_map = {}
    for p_data in permissions_list:
        res = await db.execute(select(Permission).filter(Permission.code == p_data["code"]))
        p = res.scalars().first()
        if not p:
            p = Permission(id=uuid.uuid4(), code=p_data["code"], description=p_data["description"])
            db.add(p)
            await db.flush()
        permissions_map[p_data["code"]] = p

    # 2. Seed Roles
    roles_list = [
        {"name": "Administrator", "description": "Full access across the distributed job scheduling platform"},
        {"name": "Operator", "description": "Operational access for queues, jobs, workers, retry, DLQ, and dashboards"},
        {"name": "Viewer", "description": "Read-only auditor"},
    ]

    roles_map = {}
    for r_data in roles_list:
        res = await db.execute(select(Role).filter(Role.name == r_data["name"]))
        r = res.scalars().first()
        if not r:
            r = Role(id=uuid.uuid4(), name=r_data["name"], description=r_data["description"])
            db.add(r)
            await db.flush()
        roles_map[r_data["name"]] = r

    # 3. Map permissions to simplified roles
    role_permission_map = {
        "Administrator": list(permissions_map.keys()),
        "Operator": ["create_project", "view_audit_logs", "manage_settings", "manage_api_keys"],
        "Viewer": [],
    }
    for role_name, codes in role_permission_map.items():
        role = roles_map[role_name]
        for code in codes:
            perm = permissions_map[code]
            link_res = await db.execute(
                select(1).select_from(role_permissions)
                .filter(role_permissions.c.role_id == role.id, role_permissions.c.permission_id == perm.id)
            )
            if not link_res.scalar():
                await db.execute(
                    role_permissions.insert().values(role_id=role.id, permission_id=perm.id)
                )

    # 4. Seed Organization
    org_res = await db.execute(select(Organization).filter(Organization.slug == "aetherflow-global"))
    org = org_res.scalars().first()
    if not org:
        org = Organization(
            id=uuid.uuid4(),
            name="AetherFlow Global",
            slug="aetherflow-global",
            logo_url="https://api.aetherflow.io/logos/global.png"
        )
        db.add(org)
        await db.flush()

    # 5. Seed Default Admin User & Demo Accounts
    demo_users = [
        ("admin@aetherflow.io", "admin123", "AetherFlow Administrator", "Administrator"),
        ("admin@aetherflow.com", "enterprise2026", "Administrator", "Administrator"),
        ("operator@aetherflow.com", "enterprise2026", "Operator", "Operator"),
        ("viewer@aetherflow.com", "enterprise2026", "Viewer", "Viewer"),
    ]
    admin = None
    seeded_users = []
    for u_email, u_pass, u_name, _ in demo_users:
        user_res = await db.execute(select(User).filter(User.email == u_email))
        u_obj = user_res.scalars().first()
        if not u_obj:
            u_obj = User(
                id=uuid.uuid4(),
                email=u_email,
                hashed_password=get_password_hash(u_pass),
                full_name=u_name,
                avatar_url=f"https://api.aetherflow.io/avatars/{u_email.split('@')[0]}.png",
                organization_id=org.id
            )
            db.add(u_obj)
            await db.flush()
        else:
            if not getattr(u_obj, "organization_id", None):
                u_obj.organization_id = org.id
        if u_email == "admin@aetherflow.io":
            admin = u_obj
        seeded_users.append(u_obj)

    # 6. Seed default Team
    team_res = await db.execute(select(Team).filter(Team.name == "Core DevOps Engineers", Team.organization_id == org.id))
    team = team_res.scalars().first()
    if not team:
        team = Team(
            id=uuid.uuid4(),
            name="Core DevOps Engineers",
            organization_id=org.id,
            team_lead_id=admin.id
        )
        db.add(team)
        await db.flush()

    # Add All Demo Users to Team
    for u_obj in seeded_users:
        link_res = await db.execute(
            select(1).select_from(team_members)
            .filter(team_members.c.team_id == team.id, team_members.c.user_id == u_obj.id)
        )
        if not link_res.scalar():
            await db.execute(
                team_members.insert().values(team_id=team.id, user_id=u_obj.id)
            )

    # 7. Seed default Project
    proj_res = await db.execute(select(Project).filter(Project.name == "Main Scheduling Hub", Project.organization_id == org.id))
    proj = proj_res.scalars().first()
    if not proj:
        proj = Project(
            id=uuid.uuid4(),
            name="Main Scheduling Hub",
            description="Root project orchestration center.",
            organization_id=org.id,
            is_archived=False,
            tags=["core", "devops"]
        )
        db.add(proj)
        await db.flush()

    # Add Demo Users to Project with roles
    for idx, (u_email, _, _, role_name) in enumerate(demo_users):
        u_obj = seeded_users[idx]
        proj_mem_res = await db.execute(
            select(ProjectMember).filter(ProjectMember.project_id == proj.id, ProjectMember.user_id == u_obj.id)
        )
        if not proj_mem_res.scalars().first():
            role_obj = roles_map.get(role_name, roles_map["Viewer"])
            db.add(ProjectMember(
                project_id=proj.id,
                user_id=u_obj.id,
                role_id=role_obj.id
            ))

    # --- Phase 2: Seeding Retry Policies and Default Queues ---

    # Seed Retry Policies
    retry_policies = [
        {"name": "Fixed Delay (5s)", "type": "fixed", "max_retries": 3, "delay_seconds": 5, "multiplier": 1.0},
        {"name": "Linear Backoff", "type": "linear", "max_retries": 4, "delay_seconds": 3, "multiplier": 1.5},
        {"name": "Exponential Backoff", "type": "exponential", "max_retries": 5, "delay_seconds": 2, "multiplier": 2.0},
    ]

    policies_map = {}
    for r_pol in retry_policies:
        pol_res = await db.execute(select(RetryPolicy).filter(RetryPolicy.name == r_pol["name"]))
        policy = pol_res.scalars().first()
        if not policy:
            policy = RetryPolicy(
                id=uuid.uuid4(),
                name=r_pol["name"],
                type=r_pol["type"],
                max_retries=r_pol["max_retries"],
                delay_seconds=r_pol["delay_seconds"],
                backoff_multiplier=r_pol["multiplier"]
            )
            db.add(policy)
            await db.flush()
        policies_map[r_pol["name"]] = policy

    # Seed Default Queues inside default organization and project
    default_queues = [
        {"name": "email-notification-queue", "priority": "high", "concurrency": 5, "policy": "Fixed Delay (5s)", "tags": ["email", "critical"]},
        {"name": "image-scaling-batch", "priority": "medium", "concurrency": 3, "policy": "Linear Backoff", "tags": ["media", "batch"]},
        {"name": "historical-analytics-logs", "priority": "low", "concurrency": 2, "policy": "Exponential Backoff", "tags": ["logs", "background"]},
    ]

    for q_conf in default_queues:
        q_res = await db.execute(select(Queue).filter(Queue.name == q_conf["name"], Queue.project_id == proj.id))
        queue = q_res.scalars().first()
        if not queue:
            pol = policies_map[q_conf["policy"]]
            queue = Queue(
                id=uuid.uuid4(),
                name=q_conf["name"],
                description=f"Standard template seeded for {q_conf['name']}.",
                organization_id=org.id,
                project_id=proj.id,
                priority=q_conf["priority"],
                concurrency_limit=q_conf["concurrency"],
                max_queue_size=1000,
                dlq_enabled=True,
                auto_retry=True,
                is_paused=False,
                is_archived=False,
                retry_policy_id=pol.id,
                created_by_id=admin.id,
                tags=q_conf["tags"]
            )
            db.add(queue)

    await db.commit()

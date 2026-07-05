import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models import Job, job_dependencies

class DependencyManager:
    @staticmethod
    async def is_runnable(db: AsyncSession, job_id: uuid.UUID) -> bool:
        """
        Verifies if all parent jobs for this job are completed successfully.
        """
        # Query parents
        stmt = (
            select(Job)
            .join(job_dependencies, Job.id == job_dependencies.c.parent_job_id)
            .filter(job_dependencies.c.child_job_id == job_id)
        )
        res = await db.execute(stmt)
        parents = res.scalars().all()
        
        # If no parents, it is runnable immediately
        if not parents:
            return True

        # Every parent must be "completed"
        for parent in parents:
            if parent.status != "completed":
                return False
                
        return True

    @staticmethod
    async def evaluate_children(db: AsyncSession, parent_job_id: uuid.UUID) -> None:
        """
        Evaluates child jobs of a recently completed parent.
        If all other parents of a child are completed, transitions the child from 'pending' to 'queued'.
        """
        # Find children
        stmt = (
            select(Job)
            .join(job_dependencies, Job.id == job_dependencies.c.child_job_id)
            .filter(job_dependencies.c.parent_job_id == parent_job_id, Job.status == "pending")
        )
        res = await db.execute(stmt)
        children = res.scalars().all()

        for child in children:
            # Check if this child can run now
            runnable = await DependencyManager.is_runnable(db, child.id)
            if runnable:
                child.status = "queued"
                
        await db.commit()
Defined = True

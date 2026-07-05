from .models import (
    User, Organization, Team, Project, ProjectMember, Role, Permission,
    AuditLog, Notification, Setting, RetryPolicy, Queue, ScheduledJob,
    BatchJob, Job, JobMetadata, Worker, WorkerHeartbeat, JobExecution,
    JobLog, WorkerEvent, SystemEvent, RecoveryEvent, ChaosRun,
    ReliabilityMetric, AiConversation, AiMessage, AiRecommendation,
    AiReport, AIActivity, AgentStatus, Channel, Message, MessageReaction,
    UserPresence, Incident, IncidentComment, Approval, AnalyticsSnapshot,
    AggregatedMetric, Report, ReportExport, ForecastResult,
    role_permissions, team_members, job_dependencies,
    
    # Merged V2 Classes
    UserProfile, Session, ApiKey, PasswordResetToken, LoginHistory,
    MessageThread, IncidentTimeline, JobPayload, JobResult, AnalyticsMetric,
    WorkflowTemplate, WorkflowNode, WorkflowEdge, Plugin, PluginInstallation,
    Webhook, OrganizationSetting, QueueTemplate, QueueLabel, QueueTag, QueueHealth,
    FailureHistory, RecoveryHistory, ChaosResult, SystemMetric, WorkerGroup, WorkerCapability,
    AiAgent, AgentActivity, AiApproval
)

# Aliases to map V1 uppercase AI names to V2 lowercase CamelCase
AIAgent = AiAgent
AgentActivity = AIActivity
AIConversation = AiConversation
AIMessage = AiMessage
AIRecommendation = AiRecommendation
AiApproval = Approval
AIReport = AiReport
Presence = UserPresence

__all__ = [
    "User", "Organization", "Team", "Project", "ProjectMember", "Role", "Permission",
    "AuditLog", "Notification", "Setting", "RetryPolicy", "Queue", "ScheduledJob",
    "BatchJob", "Job", "JobMetadata", "Worker", "WorkerHeartbeat", "JobExecution",
    "JobLog", "WorkerEvent", "SystemEvent", "RecoveryEvent", "ChaosRun",
    "ReliabilityMetric", "AIConversation", "AIMessage", "AIRecommendation",
    "AIReport", "AIActivity", "AgentStatus", "Channel", "Message", "MessageReaction",
    "UserPresence", "Incident", "IncidentComment", "Approval", "AnalyticsSnapshot",
    "AggregatedMetric", "Report", "ReportExport", "ForecastResult",
    "role_permissions", "team_members", "job_dependencies",
    
    "UserProfile", "Session", "ApiKey", "PasswordResetToken", "LoginHistory",
    "MessageThread", "IncidentTimeline", "JobPayload", "JobResult", "AnalyticsMetric",
    "WorkflowTemplate", "WorkflowNode", "WorkflowEdge", "Plugin", "PluginInstallation",
    "Webhook", "OrganizationSetting", "QueueTemplate", "QueueLabel", "QueueTag", "QueueHealth",
    "FailureHistory", "RecoveryHistory", "ChaosResult", "SystemMetric", "WorkerGroup", "WorkerCapability",
    
    # Aliases
    "AiAgent", "AgentActivity", "AiConversation", "AiMessage", "AiRecommendation", "AiApproval", "AiReport", "Presence"
]

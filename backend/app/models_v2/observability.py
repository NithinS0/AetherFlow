from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class AnalyticsMetric(Base, TimestampMixin):
    __tablename__ = "analytics_metrics"
    metric_type = Column(String)
    value = Column(String)
    
class Report(Base, TimestampMixin):
    __tablename__ = "reports"
    name = Column(String)
    configuration = Column(JSON)
    
    exports = relationship("ReportExport", back_populates="report", cascade="all, delete-orphan")

class ReportExport(Base, TimestampMixin):
    __tablename__ = "report_exports"
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"))
    file_url = Column(String)
    
    report = relationship("Report", back_populates="exports")

class WorkflowTemplate(Base, TimestampMixin):
    __tablename__ = "workflow_templates"
    name = Column(String)
    
    nodes = relationship("WorkflowNode", back_populates="template", cascade="all, delete-orphan")
    edges = relationship("WorkflowEdge", back_populates="template", cascade="all, delete-orphan")

class WorkflowNode(Base, TimestampMixin):
    __tablename__ = "workflow_nodes"
    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id", ondelete="CASCADE"))
    node_data = Column(JSON)
    
    template = relationship("WorkflowTemplate", back_populates="nodes")

class WorkflowEdge(Base, TimestampMixin):
    __tablename__ = "workflow_edges"
    template_id = Column(UUID(as_uuid=True), ForeignKey("workflow_templates.id", ondelete="CASCADE"))
    source_node = Column(String)
    target_node = Column(String)
    
    template = relationship("WorkflowTemplate", back_populates="edges")

class Plugin(Base, TimestampMixin):
    __tablename__ = "plugins"
    name = Column(String, unique=True)
    version = Column(String)
    
    installations = relationship("PluginInstallation", back_populates="plugin", cascade="all, delete-orphan")

class PluginInstallation(Base, TimestampMixin):
    __tablename__ = "plugin_installations"
    plugin_id = Column(UUID(as_uuid=True), ForeignKey("plugins.id", ondelete="CASCADE"))
    config = Column(JSON)
    
    plugin = relationship("Plugin", back_populates="installations")

class Webhook(Base, TimestampMixin):
    __tablename__ = "webhooks"
    target_url = Column(String)
    events = Column(JSON)

class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(UUID(as_uuid=True))
    payload = Column(JSON)

class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"
    title = Column(String)
    body = Column(String)
    status = Column(String, index=True) # read, unread

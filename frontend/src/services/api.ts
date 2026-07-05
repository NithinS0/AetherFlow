const defaultApiUrl = import.meta.env.VITE_API_URL;
export const API_URL = defaultApiUrl || (() => {
  throw new Error("Missing VITE_API_URL environment variable for frontend API requests.");
})();

interface RequestOptions extends RequestInit {
  json?: any;
}

type ApiEnvelope = { success: boolean; data: unknown };

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return (
    value !== null &&
    typeof value === "object" &&
    "success" in value &&
    "data" in value
  );
}

/** Extract list data from raw arrays or paginated `{ success, data: [] }` envelopes. */
export function unwrapList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (isApiEnvelope(payload)) {
    const { data } = payload;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (Array.isArray(record.items)) return record.items;
      if (Array.isArray(record.results)) return record.results;
    }
    return [];
  }

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  return [];
}

/** Extract single resource from raw objects or `{ success, data: T }` envelopes. */
export function unwrapData<T>(payload: unknown): T {
  if (isApiEnvelope(payload)) return payload.data as T;
  return payload as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("aetherflow_token");
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.json) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.json);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return [] as unknown as T;
  }

  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errRes = await response.json();
      errorDetail = errRes.detail || errorDetail;
    } catch {
      // Ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

async function requestList(path: string, options: RequestOptions = {}): Promise<any[]> {
  const payload = await request<unknown>(path, options);
  return unwrapList(payload);
}

async function requestData<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const payload = await request<unknown>(path, options);
  return unwrapData<T>(payload);
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Authentication failed");
    }

    return response.json();
  },

  async register(json: any): Promise<any> {
    return request("/auth/register", { method: "POST", json });
  },

  async getMe(): Promise<any> {
    return requestData("/auth/me");
  },

  async logout(): Promise<any> {
    return request("/auth/logout", { method: "POST" });
  },

  async forgotPassword(email: string): Promise<any> {
    return request("/auth/forgot-password", {
      method: "POST",
      json: { email }
    });
  },

  // Organizations
  async getOrganizations(): Promise<any[]> {
    return requestList("/organizations");
  },

  async createOrganization(json: any): Promise<any> {
    return request("/organizations", { method: "POST", json });
  },

  async updateOrganization(orgId: string, json: any): Promise<any> {
    return request(`/organizations/${orgId}`, { method: "PUT", json });
  },

  async deleteOrganization(orgId: string): Promise<any> {
    return request(`/organizations/${orgId}`, { method: "DELETE" });
  },

  async getOrgMembers(orgId: string): Promise<any[]> {
    return requestList(`/organizations/${orgId}/members`);
  },

  async inviteOrgMember(orgId: string, json: any): Promise<any> {
    return request(`/organizations/${orgId}/invite`, { method: "POST", json });
  },

  async removeOrgMember(orgId: string, userId: string): Promise<any> {
    return request(`/organizations/${orgId}/members/${userId}`, { method: "DELETE" });
  },

  async getOrgActivity(orgId: string): Promise<any[]> {
    return requestList(`/organizations/${orgId}/activity`);
  },

  // Teams
  async getTeams(orgId: string): Promise<any[]> {
    return requestList(`/teams?organization_id=${orgId}`);
  },

  async createTeam(json: any): Promise<any> {
    return request("/teams", { method: "POST", json });
  },

  async updateTeam(teamId: string, json: any): Promise<any> {
    return request(`/teams/${teamId}`, { method: "PUT", json });
  },

  async deleteTeam(teamId: string): Promise<any> {
    return request(`/teams/${teamId}`, { method: "DELETE" });
  },

  async addTeamMember(teamId: string, userId: string): Promise<any> {
    return request(`/teams/${teamId}/members?user_id=${userId}`, { method: "POST" });
  },

  async removeTeamMember(teamId: string, userId: string): Promise<any> {
    return request(`/teams/${teamId}/members/${userId}`, { method: "DELETE" });
  },

  // Projects
  async getProjects(orgId: string): Promise<any[]> {
    return requestList(`/projects?organization_id=${orgId}`);
  },

  async createProject(json: any): Promise<any> {
    return request("/projects", { method: "POST", json });
  },

  async updateProject(projectId: string, json: any): Promise<any> {
    return request(`/projects/${projectId}`, { method: "PUT", json });
  },

  async deleteProject(projectId: string): Promise<any> {
    return request(`/projects/${projectId}`, { method: "DELETE" });
  },

  async archiveProject(projectId: string): Promise<any> {
    return request(`/projects/${projectId}/archive`, { method: "POST" });
  },

  // Roles & Permissions
  async getRoles(): Promise<any[]> {
    return requestList("/roles");
  },

  async getPermissions(): Promise<any[]> {
    return requestList("/permissions");
  },

  // Notifications
  async getNotifications(): Promise<any[]> {
    return requestList("/notifications");
  },

  async markNotificationRead(id: string): Promise<any> {
    return requestData(`/notifications/${id}`, { method: "PATCH", json: { is_read: true } });
  },

  async markAllNotificationsRead(): Promise<any> {
    return requestData("/notifications/read-all", { method: "PATCH" });
  },

  async getNotificationPreferences(): Promise<any> {
    return requestData("/notifications/preferences");
  },

  async updateNotificationPreferences(json: any): Promise<any> {
    return request("/notifications/preferences", { method: "PUT", json });
  },

  // Audit Logs
  async getAuditLogs(action?: string, entityType?: string): Promise<any[]> {
    let url = "/audit";
    const params = [];
    if (action) params.push(`action=${action}`);
    if (entityType) params.push(`entity_type=${entityType}`);
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
    return requestList(url);
  },

  // Queues & Jobs
  async getQueues(projectId: string): Promise<any[]> {
    return requestList(`/queues?project_id=${projectId}`);
  },

  async getJobs(projectId: string): Promise<any[]> {
    return requestList(`/jobs?project_id=${projectId}`);
  },

  async getRetryPolicies(): Promise<any[]> {
    return requestList("/retry-policies");
  },

  async getScheduledJobs(projectId: string): Promise<any[]> {
    return requestList(`/jobs/scheduled?project_id=${projectId}`);
  },

  async getBatches(): Promise<any[]> {
    return requestList("/jobs/batches");
  },

  // Workers
  async getWorkers(): Promise<any[]> {
    return requestList("/workers");
  },

  async drainWorker(workerId: string): Promise<any> {
    return request(`/workers/${workerId}/drain`, { method: "PATCH" });
  },

  async toggleWorkerMaintenance(workerId: string, maintenance: boolean): Promise<any> {
    return request(`/workers/${workerId}`, {
      method: "PATCH",
      json: { maintenance }
    });
  },

  async restartWorker(workerId: string): Promise<any> {
    return request(`/workers/${workerId}/restart`, { method: "POST" });
  },

  // Executions
  async getExecutions(): Promise<any[]> {
    return requestList("/executions");
  },

  async getExecutionLogs(executionId: string): Promise<any[]> {
    return requestList(`/executions/${executionId}/logs`);
  },

  async retryDlqJob(jobId: string): Promise<any> {
    return request(`/dead-letter/${jobId}/retry`, { method: "POST" });
  },

  async deleteDlqJob(jobId: string): Promise<any> {
    return request(`/dead-letter/${jobId}`, { method: "DELETE" });
  },

  async getDlqJobs(): Promise<any[]> {
    return requestList("/dead-letter");
  },

  async registerWorker(json: any): Promise<any> {
    return request("/workers/register", { method: "POST", json });
  },

  async workerHeartbeat(workerId: string, json: any): Promise<any> {
    return request(`/workers/${workerId}/heartbeat`, { method: "POST", json });
  },

  async updateRetryPolicy(policyId: string, json: any): Promise<any> {
    return request(`/retry-policies/${policyId}`, { method: "PATCH", json });
  },

  async getQueueStats(queueId: string): Promise<any> {
    return requestData(`/queues/${queueId}/stats`);
  },

  async createJob(json: any): Promise<any> {
    return request("/jobs", { method: "POST", json });
  },

  async cancelJob(jobId: string): Promise<any> {
    return request(`/jobs/${jobId}`, { method: "PATCH", json: { status: "cancelled" } });
  },

  async createRetryPolicy(json: any): Promise<any> {
    return request("/retry-policies", { method: "POST", json });
  },

  async deleteRetryPolicy(policyId: string): Promise<any> {
    return request(`/retry-policies/${policyId}`, { method: "DELETE" });
  },

  // Reliability & Self-healing
  async getReliabilityMetrics(): Promise<any[]> {
    return requestList("/reliability/metrics");
  },

  async getSystemHealth(projectId: string): Promise<any> {
    return requestData(`/reliability/health?project_id=${projectId}`);
  },

  async getRecoveryEvents(): Promise<any[]> {
    return requestList("/reliability/recoveries");
  },

  async triggerManualHeal(): Promise<any> {
    return request("/reliability/heal", { method: "POST" });
  },

  // Chaos
  async executeChaosScenario(scenario: string, projectId?: string): Promise<any> {
    return request("/chaos/run", {
      method: "POST",
      json: { scenario, project_id: projectId }
    });
  },

  async getChaosRuns(): Promise<any[]> {
    return requestList("/chaos/history");
  },

  // Operations & Observability
  async getOperationsDashboard(): Promise<any> {
    return requestData("/operations/dashboard");
  },

  async getActivityFeed(eventType?: string): Promise<any[]> {
    let url = "/operations/activity";
    if (eventType) {
      url += `?event_type=${eventType}`;
    }
    return requestList(url);
  },

  async getTopology(): Promise<any> {
    return requestData("/operations/topology");
  },

  async dispatchCommand(command: string): Promise<any> {
    return request("/operations/command", {
      method: "POST",
      json: { command }
    });
  },

  // AI Intelligence Layer
  async createAiConversation(title?: string): Promise<any> {
    return request("/ai/chat/conversations", {
      method: "POST",
      json: { title }
    });
  },

  async getAiConversations(): Promise<any[]> {
    return requestList("/ai/chat/conversations");
  },

  async getAiMessages(convId: string): Promise<any[]> {
    return requestList(`/ai/chat/conversations/${convId}/messages`);
  },

  async sendAiMessage(convId: string, content: string): Promise<any> {
    return request(`/ai/chat/conversations/${convId}/messages`, {
      method: "POST",
      json: { content }
    });
  },

  async getAiRecommendations(): Promise<any[]> {
    return requestList("/ai/recommendations");
  },

  async approveRecommendation(recId: string): Promise<any> {
    return request(`/ai/recommendations/${recId}/approve`, { method: "POST" });
  },

  async rejectRecommendation(recId: string): Promise<any> {
    return request(`/ai/recommendations/${recId}/reject`, { method: "POST" });
  },

  async getAiReports(): Promise<any[]> {
    return requestList("/ai/reports");
  },

  async getAiDashboard(): Promise<any> {
    return requestData("/ai/dashboard");
  },

  async runAiAgent(agent: string): Promise<any> {
    return request(`/ai/${agent}`, { method: "POST" });
  },

  async chatWithAi(message: string, conversationId?: string): Promise<any> {
    return request("/ai/chat", {
      method: "POST",
      json: { message, conversation_id: conversationId }
    });
  },

  async generateAiReport(): Promise<any> {
    return request("/ai/reports/generate", { method: "POST" });
  },

  // ─── Phase 7: Incidents ───────────────────────────────────────────────────
  async getIncidents(status_filter?: string, severity?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (status_filter) params.append("status_filter", status_filter);
    if (severity) params.append("severity", severity);
    const qs = params.toString();
    return requestList(`/incidents${qs ? `?${qs}` : ""}`);
  },

  async createIncident(data: { title: string; description?: string; severity?: string; trigger?: string; queue_id?: string; worker_id?: string; job_id?: string }): Promise<any> {
    return request("/incidents", { method: "POST", json: data });
  },

  async getIncident(id: string): Promise<any> {
    return request(`/incidents/${id}`);
  },

  async acknowledgeIncident(id: string): Promise<any> {
    return request(`/incidents/${id}/acknowledge`, { method: "POST" });
  },

  async assignIncident(id: string, assigned_to_id: string): Promise<any> {
    return request(`/incidents/${id}/assign`, { method: "POST", json: { assigned_to_id } });
  },

  async escalateIncident(id: string, reason: string): Promise<any> {
    return request(`/incidents/${id}/escalate`, { method: "POST", json: { reason } });
  },

  async resolveIncident(id: string, resolution_note?: string): Promise<any> {
    return request(`/incidents/${id}/resolve`, { method: "POST", json: { resolution_note } });
  },

  async closeIncident(id: string): Promise<any> {
    return request(`/incidents/${id}/close`, { method: "POST" });
  },

  async addIncidentComment(id: string, content: string): Promise<any> {
    return request(`/incidents/${id}/comments`, { method: "POST", json: { content } });
  },

  async triggerAIAnalysis(id: string): Promise<any> {
    return request(`/incidents/${id}/analyze-failure`, { method: "POST" });
  },

  // ─── Phase 7: Channels & Messaging ───────────────────────────────────────
  async getChannels(context_type?: string, context_id?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (context_type) params.append("context_type", context_type);
    if (context_id) params.append("context_id", context_id);
    const qs = params.toString();
    return requestList(`/channels${qs ? `?${qs}` : ""}`);
  },

  async createChannel(data: { name: string; description?: string; context_type: string; context_id?: string; is_private?: boolean }): Promise<any> {
    return request("/channels", { method: "POST", json: data });
  },

  async ensureDefaultChannels(): Promise<any> {
    return request("/channels/defaults");
  },

  async getMessages(channelId: string, limit = 50): Promise<any[]> {
    return requestList(`/channels/${channelId}/messages?limit=${limit}`);
  },

  async sendMessage(channelId: string, content: string): Promise<any> {
    return request(`/channels/${channelId}/messages`, { method: "POST", json: { content } });
  },

  async deleteMessage(channelId: string, messageId: string): Promise<any> {
    return request(`/channels/${channelId}/messages/${messageId}`, { method: "DELETE" });
  },

  async reactToMessage(channelId: string, messageId: string, emoji: string): Promise<any> {
    return request(`/channels/${channelId}/messages/${messageId}/react`, { method: "POST", json: { emoji } });
  },

  // ─── Phase 7: Presence ────────────────────────────────────────────────────
  async getPresence(): Promise<any[]> {
    return requestList("/presence");
  },

  async updatePresence(status: string, activity?: string): Promise<any> {
    return request("/presence/update", { method: "POST", json: { status, activity } });
  },

  // ─── Phase 7: Approvals ───────────────────────────────────────────────────
  async getApprovals(status_filter?: string): Promise<any[]> {
    const qs = status_filter ? `?status_filter=${status_filter}` : "";
    return requestList(`/approvals${qs}`);
  },

  async createApproval(data: { approval_type: string; title: string; description: string; severity?: string; payload?: any }): Promise<any> {
    return request("/approvals", { method: "POST", json: data });
  },

  async approveRequest(id: string, review_note?: string): Promise<any> {
    return request(`/approvals/${id}/approve`, { method: "POST", json: { review_note } });
  },

  async rejectRequest(id: string, review_note?: string): Promise<any> {
    return request(`/approvals/${id}/reject`, { method: "POST", json: { review_note } });
  },

  // Legacy opsAction stub (kept for compatibility)
  async approveOpsAction(id: string, action: string, _parameters?: any): Promise<any> {
    return request(`/approvals/${id}/approve`, { method: "POST", json: { review_note: action } });
  },

  // --- Analytics ---
  async getDashboardMetrics(): Promise<any> {
    return requestData("/analytics/dashboard");
  },
  async getQueueAnalytics(): Promise<any> {
    return requestData("/analytics/queues");
  },
  async getWorkerAnalytics(): Promise<any> {
    return requestData("/analytics/workers");
  },
  async getJobDistribution(): Promise<any> {
    return requestData("/analytics/jobs/distribution");
  },
  async getIncidentSummary(): Promise<any> {
    return requestData("/analytics/incidents/summary");
  },
  async getAiSummary(): Promise<any> {
    return requestData("/analytics/ai/summary");
  },
  async getTrends(period: string = "daily"): Promise<any> {
    return requestData(`/analytics/trends?period=${period}`);
  },
  async getForecast(metric: string, days: number = 14): Promise<any> {
    return requestData(`/analytics/forecast?metric=${metric}&days=${days}`);
  },
  async getHeatmap(type: string): Promise<any> {
    return requestData(`/analytics/heatmap?type=${type}`);
  },
  async getReports(): Promise<any> {
    return requestData("/analytics/reports");
  },
  async createReport(data: any): Promise<any> {
    return request("/analytics/reports", { method: "POST", json: data });
  },

  // --- Search, Settings & Plugins ---
  async globalSearch(q: string): Promise<{ results: any[] }> {
    const data = await requestData<{ results?: any[] }>(`/search?q=${encodeURIComponent(q)}`);
    return { results: Array.isArray(data?.results) ? data.results : [] };
  },
  async getSettings(): Promise<any> {
    return requestData("/settings");
  },
  async getSettingsSection(section: string): Promise<any> {
    return requestData(`/settings/sections/${section}`);
  },
  async updateFeatureFlag(feature: string, enabled: boolean): Promise<any> {
    return request(`/settings/features/${feature}?enabled=${enabled}`, { method: "PUT" });
  },
  async updateSettingsSection(section: string, payload: any): Promise<any> {
    return request(`/settings/sections/${section}`, { method: "PUT", json: payload });
  },
  async updatePlatformSettings(settings: any): Promise<any> {
    return request("/settings/platform", { method: "PUT", json: settings });
  },
  async getPlugins(): Promise<any> {
    return requestData("/plugins");
  },
  async enablePlugin(name: string): Promise<any> {
    return request(`/plugins/${name}/enable`, { method: "POST" });
  },
  async disablePlugin(name: string): Promise<any> {
    return request(`/plugins/${name}/disable`, { method: "POST" });
  },
  async getApiKeys(): Promise<any[]> {
    return requestList("/api-keys");
  },
  async createApiKey(data: any): Promise<any> {
    return request("/api-keys", { method: "POST", json: data });
  },
  async revokeApiKey(id: string): Promise<any> {
    return request(`/api-keys/${id}/revoke`, { method: "POST" });
  },
};

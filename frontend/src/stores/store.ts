import { create } from "zustand";
import { api } from "../services/api";

interface State {
  user: any | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  organizations: any[];
  activeOrg: any | null;
  teams: any[];
  projects: any[];
  members: any[];
  roles: any[];
  permissions: any[];
  notifications: any[];
  auditLogs: any[];
  globalSearchOpen: boolean;
  realtimeConnected: boolean;

  // Phase 2 state
  queues: any[];
  jobs: any[];
  retryPolicies: any[];
  scheduledJobs: any[];
  batches: any[];

  // Phase 3 state
  workers: any[];
  executions: any[];

  // Phase 4 state
  reliabilityMetrics: any[];
  systemHealth: any | null;
  recoveryEvents: any[];
  chaosRuns: any[];

  // Phase 5 state
  operationsDashboard: any | null;
  activityFeed: any[];
  topologyData: any | null;

  // Phase 6 state
  aiConversations: any[];
  activeConversationMessages: any[];
  aiRecommendations: any[];
  aiReports: any[];

  // Phase 7 state
  channels: any[];
  activeChannelMessages: any[];
  activeChannelId: string | null;
  incidents: any[];
  activeIncidentId: string | null;
  presence: any[];
  approvals: any[];
  unreadNotifCount: number;

  // Phase 8 state
  analyticsDashboard: any | null;
  analyticsQueues: any | null;
  analyticsWorkers: any | null;
  analyticsJobDistribution: any | null;
  analyticsIncidentSummary: any | null;
  analyticsAiSummary: any | null;
  analyticsReports: any[];

  setUser: (user: any | null) => void;
  setAuthenticated: (auth: boolean) => void;
  setAuthReady: (ready: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  logout: () => void;

  fetchOrgs: () => Promise<void>;
  setActiveOrg: (org: any) => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;

  // Phase 2 actions
  fetchQueues: (projectId: string) => Promise<void>;
  fetchJobs: (projectId: string) => Promise<void>;
  fetchRetryPolicies: () => Promise<void>;
  fetchScheduledJobs: (projectId: string) => Promise<void>;
  fetchBatches: () => Promise<void>;

  // Phase 3 actions
  fetchWorkers: () => Promise<void>;
  fetchExecutions: () => Promise<void>;

  // Phase 4 actions
  fetchReliability: (projectId: string) => Promise<void>;
  fetchChaosRuns: () => Promise<void>;

  // Phase 5 actions
  fetchOperationsDashboard: () => Promise<void>;
  fetchActivityFeed: (eventType?: string) => Promise<void>;
  fetchTopology: () => Promise<void>;

  // Phase 6 actions
  fetchAiConversations: () => Promise<void>;
  fetchAiMessages: (convId: string) => Promise<void>;
  fetchAiRecommendations: () => Promise<void>;
  fetchAiReports: () => Promise<void>;

  fetchIncidents: (status_filter?: string) => Promise<void>;
  createIncident: (data: any) => Promise<any>;
  acknowledgeIncident: (id: string) => Promise<void>;
  resolveIncident: (id: string, note?: string) => Promise<void>;
  escalateIncident: (id: string, reason: string) => Promise<void>;
  closeIncident: (id: string) => Promise<void>;
  addIncidentComment: (id: string, content: string) => Promise<void>;
  setActiveIncidentId: (id: string | null) => void;

  fetchChannels: (context_type?: string, context_id?: string) => Promise<void>;
  setActiveChannel: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;

  fetchPresence: () => Promise<void>;
  updatePresence: (status: string, activity?: string) => Promise<void>;

  fetchApprovals: (status?: string) => Promise<void>;
  approveRequest: (id: string, note?: string) => Promise<void>;
  rejectRequest: (id: string, note?: string) => Promise<void>;

  // Phase 8 actions
  fetchAnalyticsDashboard: () => Promise<void>;
  fetchAnalyticsQueues: () => Promise<void>;
  fetchAnalyticsWorkers: () => Promise<void>;
  fetchAnalyticsJobDistribution: () => Promise<void>;
  fetchAnalyticsIncidentSummary: () => Promise<void>;
  fetchAnalyticsAiSummary: () => Promise<void>;
  fetchAnalyticsReports: () => Promise<void>;
  createAnalyticsReport: (data: any) => Promise<any>;

  // Settings & Plugins
  platformSettings: any | null;
  fetchSettings: () => Promise<void>;
  updateFeatureFlag: (feature: string, enabled: boolean) => Promise<void>;
  updatePlatformSettings: (settings: any) => Promise<void>;

  plugins: any | null;
  fetchPlugins: () => Promise<void>;
  enablePlugin: (name: string) => Promise<void>;
  disablePlugin: (name: string) => Promise<void>;

  apiKeys: any[];
  fetchApiKeys: () => Promise<void>;
  createApiKey: (data: any) => Promise<any>;
  revokeApiKey: (id: string) => Promise<void>;

  setRealtimeConnected: (connected: boolean) => void;
  handleRealtimeEvent: (eventType: string, data: any) => void;
}

export const useStore = create<State>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,
  organizations: [],
  activeOrg: null,
  teams: [],
  projects: [],
  members: [],
  roles: [],
  permissions: [],
  notifications: [],
  auditLogs: [],
  globalSearchOpen: false,
  realtimeConnected: false,
  
  // Analytics State
  analyticsDashboard: null,
  analyticsQueues: null,
  analyticsWorkers: null,
  analyticsJobDistribution: null,
  analyticsIncidentSummary: null,
  analyticsAiSummary: null,
  analyticsReports: [],

  // Settings & Plugins
  platformSettings: null,
  plugins: null,
  apiKeys: [],

  // Phase 2 initial state
  queues: [],
  jobs: [],
  retryPolicies: [],
  scheduledJobs: [],
  batches: [],

  // Phase 3 initial state
  workers: [],
  executions: [],

  // Phase 4 initial state
  reliabilityMetrics: [],
  systemHealth: null,
  recoveryEvents: [],
  chaosRuns: [],

  // Phase 5 initial state
  operationsDashboard: null,
  activityFeed: [],
  topologyData: null,

  // Phase 6 initial state
  aiConversations: [],
  activeConversationMessages: [],
  aiRecommendations: [],
  aiReports: [],

  // Phase 7 initial state
  channels: [],
  activeChannelMessages: [],
  activeChannelId: null,
  incidents: [],
  activeIncidentId: null,
  presence: [],
  approvals: [],
  unreadNotifCount: 0,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),
  setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),

  logout: () => {
    localStorage.removeItem("aetherflow_token");
    localStorage.removeItem("aetherflow_remember");
    localStorage.removeItem("aetherflow_active_org");
    set({
      user: null,
      isAuthenticated: false,
      organizations: [],
      activeOrg: null,
      teams: [],
      projects: [],
      members: [],
      roles: [],
      permissions: [],
      notifications: [],
      auditLogs: [],
      queues: [],
      jobs: [],
      retryPolicies: [],
      scheduledJobs: [],
      batches: []
    });
  },

  fetchOrgs: async () => {
    try {
      const orgs = await api.getOrganizations();
      set({ organizations: orgs });

      const { activeOrg } = get();
      if (orgs.length > 0 && !activeOrg) {
        await get().setActiveOrg(orgs[0]);
      }
    } catch (e: any) {
      console.error("Fetch organizations failed", e);
    }
  },

  // Settings
  fetchSettings: async () => {
    try {
      const data = await api.getSettings();
      set({ platformSettings: data });
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  },

  updateFeatureFlag: async (feature, enabled) => {
    try {
      await api.updateFeatureFlag(feature, enabled);
      get().fetchSettings();
    } catch (e) {
      console.error("Failed to update feature flag", e);
    }
  },

  updatePlatformSettings: async (settings) => {
    try {
      await api.updatePlatformSettings({ settings });
      get().fetchSettings();
    } catch (e) {
      console.error("Failed to update platform settings", e);
    }
  },

  fetchPlugins: async () => {
    try {
      const data = await api.getPlugins();
      set({ plugins: data });
    } catch (e) {
      console.error("Failed to fetch plugins", e);
    }
  },

  enablePlugin: async (name) => {
    try {
      await api.enablePlugin(name);
      get().fetchPlugins();
    } catch (e) {
      console.error("Failed to enable plugin", e);
    }
  },

  disablePlugin: async (name) => {
    try {
      await api.disablePlugin(name);
      get().fetchPlugins();
    } catch (e) {
      console.error("Failed to disable plugin", e);
    }
  },

  fetchApiKeys: async () => {
    try {
      const keys = await api.getApiKeys();
      set({ apiKeys: keys });
    } catch (e) {
      console.error("Failed to fetch API keys", e);
    }
  },

  createApiKey: async (data) => {
    const res = await api.createApiKey(data);
    get().fetchApiKeys();
    return res;
  },

  revokeApiKey: async (id) => {
    await api.revokeApiKey(id);
    set((s) => ({
      apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, is_revoked: true } : k))
    }));
  },

  setRealtimeConnected: (connected) => {
    set({ realtimeConnected: connected });
  },

  setActiveOrg: async (org: any) => {
    set({ activeOrg: org });
    if (org) {
      const { fetchTeams, fetchProjects, fetchMembers, fetchRetryPolicies } = get();
      await Promise.all([
        fetchTeams(),
        fetchProjects(),
        fetchMembers(),
        fetchRetryPolicies()
      ]);
    }
  },

  fetchTeams: async () => {
    const { activeOrg } = get();
    if (!activeOrg) return;
    try {
      const teams = await api.getTeams(activeOrg.id);
      set({ teams });
    } catch (e) {
      console.error("Fetch teams failed", e);
    }
  },

  fetchProjects: async () => {
    const { activeOrg } = get();
    if (!activeOrg) return;
    try {
      const projects = await api.getProjects(activeOrg.id);
      set({ projects });
    } catch (e) {
      console.error("Fetch projects failed", e);
    }
  },

  fetchMembers: async () => {
    const { activeOrg } = get();
    if (!activeOrg) return;
    try {
      const members = await api.getOrgMembers(activeOrg.id);
      set({ members });
    } catch (e) {
      console.error("Fetch members failed", e);
    }
  },

  fetchRoles: async () => {
    try {
      const roles = await api.getRoles();
      const perms = await api.getPermissions();
      set({ roles, permissions: perms });
    } catch (e) {
      console.error("Fetch roles failed", e);
    }
  },

  fetchNotifications: async () => {
    try {
      const notifications = await api.getNotifications();
      set({ notifications });
    } catch (e) {
      console.error("Fetch notifications failed", e);
    }
  },

  fetchAuditLogs: async () => {
    try {
      const logs = await api.getAuditLogs();
      set({ auditLogs: logs });
    } catch (e) {
      console.error("Fetch audit logs failed", e);
    }
  },

  // --- Phase 2 Actions ---

  fetchQueues: async (projectId: string) => {
    try {
      const queues = await api.getQueues(projectId);
      set({ queues });
    } catch (e) {
      console.error("Fetch queues failed", e);
    }
  },

  fetchJobs: async (projectId: string) => {
    try {
      const jobs = await api.getJobs(projectId);
      set({ jobs });
    } catch (e) {
      console.error("Fetch jobs failed", e);
    }
  },

  fetchRetryPolicies: async () => {
    try {
      const p = await api.getRetryPolicies();
      set({ retryPolicies: p });
    } catch (e) {
      console.error("Fetch policies failed", e);
    }
  },

  fetchScheduledJobs: async (projectId: string) => {
    try {
      const p = await api.getScheduledJobs(projectId);
      set({ scheduledJobs: p });
    } catch (e) {
      console.error("Fetch scheduled failed", e);
    }
  },

  fetchBatches: async () => {
    try {
      const p = await api.getBatches();
      set({ batches: p });
    } catch (e) {
      console.error("Fetch batches failed", e);
    }
  },

  fetchWorkers: async () => {
    try {
      const workers = await api.getWorkers();
      set({ workers });
    } catch (e) {
      console.error("Fetch workers failed", e);
    }
  },

  fetchExecutions: async () => {
    try {
      const execs = await api.getExecutions();
      set({ executions: execs });
    } catch (e) {
      console.error("Fetch executions failed", e);
    }
  },

  fetchReliability: async (projectId: string) => {
    try {
      const health = await api.getSystemHealth(projectId);
      const metrics = await api.getReliabilityMetrics();
      const recoveries = await api.getRecoveryEvents();
      set({
        systemHealth: health,
        reliabilityMetrics: Array.isArray(metrics) ? metrics : [],
        recoveryEvents: Array.isArray(recoveries) ? recoveries : [],
      });
    } catch (e) {
      console.error("Fetch reliability metrics failed", e);
    }
  },

  fetchChaosRuns: async () => {
    try {
      const chaos = await api.getChaosRuns();
      set({ chaosRuns: chaos });
    } catch (e) {
      console.error("Fetch chaos runs failed", e);
    }
  },

  fetchOperationsDashboard: async () => {
    try {
      const dash = await api.getOperationsDashboard();
      set({ operationsDashboard: dash });
    } catch (e) {
      console.error("Fetch operations dashboard failed", e);
    }
  },

  fetchActivityFeed: async (eventType?: string) => {
    try {
      const feed = await api.getActivityFeed(eventType);
      set({ activityFeed: feed });
    } catch (e) {
      console.error("Fetch activity feed failed", e);
    }
  },

  fetchTopology: async () => {
    try {
      const topo = await api.getTopology();
      set({ topologyData: topo });
    } catch (e) {
      console.error("Fetch topology twin failed", e);
    }
  },

  fetchAiConversations: async () => {
    try {
      const convs = await api.getAiConversations();
      set({ aiConversations: convs });
    } catch (e) {
      console.error("Fetch AI conversations failed", e);
    }
  },

  fetchAiMessages: async (convId: string) => {
    try {
      const msgs = await api.getAiMessages(convId);
      set({ activeConversationMessages: msgs });
    } catch (e) {
      console.error("Fetch AI messages failed", e);
    }
  },

  fetchAiRecommendations: async () => {
    try {
      const recs = await api.getAiRecommendations();
      set({ aiRecommendations: recs });
    } catch (e) {
      console.error("Fetch AI recommendations failed", e);
    }
  },

  fetchAiReports: async () => {
    try {
      const reports = await api.getAiReports();
      set({ aiReports: reports });
    } catch (e) {
      console.error("Fetch AI reports failed", e);
    }
  },

  fetchIncidents: async (status_filter?: string) => {
    try {
      const incidents = await api.getIncidents(status_filter);
      set({ incidents });
    } catch (e) {
      console.error("Fetch incidents failed", e);
    }
  },

  createIncident: async (data: any) => {
    const incident = await api.createIncident(data);
    set((s) => ({ incidents: [incident, ...s.incidents] }));
    return incident;
  },

  acknowledgeIncident: async (id: string) => {
    const updated = await api.acknowledgeIncident(id);
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? updated : i)) }));
  },

  resolveIncident: async (id: string, note?: string) => {
    const updated = await api.resolveIncident(id, note);
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? updated : i)) }));
  },

  escalateIncident: async (id: string, reason: string) => {
    const updated = await api.escalateIncident(id, reason);
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? updated : i)) }));
  },

  closeIncident: async (id: string) => {
    const updated = await api.closeIncident(id);
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? updated : i)) }));
  },

  addIncidentComment: async (id: string, content: string) => {
    await api.addIncidentComment(id, content);
    const updated = await api.getIncident(id);
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? updated : i)) }));
  },

  setActiveIncidentId: (activeIncidentId) => set({ activeIncidentId }),

  fetchChannels: async (context_type?: string, context_id?: string) => {
    try {
      const channels = await api.getChannels(context_type, context_id);
      set({ channels });
    } catch (e) {
      console.error("Fetch channels failed", e);
    }
  },

  setActiveChannel: async (channelId: string) => {
    set({ activeChannelId: channelId, activeChannelMessages: [] });
    try {
      const msgs = await api.getMessages(channelId);
      set({ activeChannelMessages: msgs });
    } catch (e) {
      console.error("Fetch messages failed", e);
    }
  },

  sendMessage: async (channelId: string, content: string) => {
    const msg = await api.sendMessage(channelId, content);
    set((s) => ({ activeChannelMessages: [...s.activeChannelMessages, msg] }));
  },

  fetchPresence: async () => {
    try {
      const presence = await api.getPresence();
      set({ presence });
    } catch (e) {
      console.error("Fetch presence failed", e);
    }
  },

  updatePresence: async (status: string, activity?: string) => {
    try {
      await api.updatePresence(status, activity);
    } catch (e) {
      console.error("Update presence failed", e);
    }
  },

  fetchApprovals: async (status_filter?: string) => {
    try {
      const approvals = await api.getApprovals(status_filter);
      set({ approvals });
    } catch (e) {
      console.error("Fetch approvals failed", e);
    }
  },

  approveRequest: async (id: string, note?: string) => {
    await api.approveRequest(id, note);
    set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: "approved" } : a)) }));
  },

  rejectRequest: async (id: string, note?: string) => {
    const updated = await api.rejectRequest(id, note);
    set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? updated : a)) }));
  },

  // --- Phase 8: Analytics ---
  fetchAnalyticsDashboard: async () => {
    const data = await api.getDashboardMetrics();
    set({ analyticsDashboard: data });
  },
  fetchAnalyticsQueues: async () => {
    const data = await api.getQueueAnalytics();
    set({ analyticsQueues: data });
  },
  fetchAnalyticsWorkers: async () => {
    const data = await api.getWorkerAnalytics();
    set({ analyticsWorkers: data });
  },
  fetchAnalyticsJobDistribution: async () => {
    const data = await api.getJobDistribution();
    set({ analyticsJobDistribution: data });
  },
  fetchAnalyticsIncidentSummary: async () => {
    const data = await api.getIncidentSummary();
    set({ analyticsIncidentSummary: data });
  },
  fetchAnalyticsAiSummary: async () => {
    const data = await api.getAiSummary();
    set({ analyticsAiSummary: data });
  },
  fetchAnalyticsReports: async () => {
    const data = await api.getReports();
    set({ analyticsReports: data });
  },
  createAnalyticsReport: async (data: any) => {
    const res = await api.createReport(data);
    get().fetchAnalyticsReports();
    return res;
  },



  handleRealtimeEvent: (eventType, _data) => {
    const { fetchNotifications, fetchAuditLogs, fetchOrgs } = get();

    switch (eventType) {
      case "notification_new":
        fetchNotifications();
        set((s) => ({ unreadNotifCount: s.unreadNotifCount + 1 }));
        break;
      case "audit_new":
        fetchAuditLogs();
        break;
      case "organization_update":
        fetchOrgs();
        break;
      case "incident_new":
      case "incident_updated":
        get().fetchIncidents();
        break;
      case "channel_message":
        // Refresh messages in the active channel
        {
          const { activeChannelId } = get();
          if (activeChannelId) get().setActiveChannel(activeChannelId);
        }
        break;
      case "approval_new":
        get().fetchApprovals();
        break;
      default:
        break;
    }
  }
}));

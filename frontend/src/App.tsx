import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "./stores/store";
import { useWebSockets } from "./hooks/useWebSockets";
import { api } from "./services/api";
import { useThemeStore } from "./stores/themeStore";
import { Layout } from "./layouts/Layout";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Organizations } from "./pages/Organizations";
import { Teams } from "./pages/Teams";
import { Projects } from "./pages/Projects";
import { Queues } from "./pages/Queues";
import { Jobs } from "./pages/Jobs";
import { WorkflowVisualizer } from "./pages/WorkflowVisualizer";
import { Workers } from "./pages/Workers";
import { Executions } from "./pages/Executions";
import { Reliability } from "./pages/Reliability";
import { Chaos } from "./pages/Chaos";
import { CommandCenter } from "./pages/CommandCenter";
import { Topology } from "./pages/Topology";
import { ActivityFeed } from "./pages/ActivityFeed";
import { AiDashboard } from "./pages/AiDashboard";
import { OpsGpt } from "./pages/OpsGpt";
import { AiAgentsHub } from "./pages/AiAgentsHub";
import { AuditLogs } from "./pages/AuditLogs";
import { Settings } from "./pages/Settings";
// Settings admin layout
import * as SettingsAdmin from "./pages/SettingsAdmin/SettingsLayout";
import { Plugins } from "./pages/Plugins";
import { DeveloperSettings } from "./pages/DeveloperSettings";
import { Documentation } from "./pages/Documentation";
import { Incidents } from "./pages/Incidents";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthLoadingScreen } from "./components/AuthLoadingScreen";
import { Chat } from "./pages/Chat";
import { ApprovalCenter } from "./pages/ApprovalCenter";
import { NotificationCenter } from "./pages/NotificationCenter";
import { Analytics } from "./pages/analytics/Analytics";
import { ScheduledJobs } from "./pages/ScheduledJobs";
import { JobExplorer } from "./pages/JobExplorer";
import { WorkerMonitoring } from "./pages/WorkerMonitoring";
import { RetryManagement } from "./pages/RetryManagement";
import { DeadLetterQueue } from "./pages/DeadLetterQueue";
import { QueueAnalyticsPage } from "./pages/QueueAnalyticsPage";
import { SystemHealthPage } from "./pages/SystemHealthPage";
import { AiReports } from "./pages/AiReports";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import PublicPage from "./components/PublicPage";
import { AboutPage } from "./pages/public/AboutPage";
import { SecurityPage } from "./pages/public/SecurityPage";
import { PrivacyPolicy } from "./pages/public/PrivacyPolicy";
import { TermsOfService } from "./pages/public/TermsOfService";
import { DocsHome } from "./pages/public/DocsHome";
import { ApiReferencePage } from "./pages/public/ApiReferencePage";
import { StatusPage } from "./pages/public/StatusPage";
import { ReleasesPage } from "./pages/public/ReleasesPage";
import { QueueManagementPage } from "./pages/public/QueueManagementPage";
import { JobSchedulerPage } from "./pages/public/JobSchedulerPage";
import { WorkerOrchestrationPage } from "./pages/public/WorkerOrchestrationPage";
import { PlatformAnalyticsPage } from "./pages/public/PlatformAnalyticsPage";

function RequireAuth() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function GuestOnly() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <AuthLoadingScreen />;
  }
  return <Outlet />;
}

export default function App() {
  const isAuthReady = useStore((state) => state.isAuthReady);
  const setUser = useStore((state) => state.setUser);
  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const setAuthReady = useStore((state) => state.setAuthReady);
  const logout = useStore((state) => state.logout);
  const fetchOrgs = useStore((state) => state.fetchOrgs);
  const initTheme = useThemeStore((state) => state.initTheme);
  const theme = useThemeStore((state) => state.theme);

  // Initialise theme from localStorage / system preference before first paint
  useEffect(() => { initTheme(); }, [initTheme]);

  // Determine Toaster theme based on current theme setting
  const resolvedTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  useEffect(() => {
    async function bootstrapAuth() {
      const token = localStorage.getItem("aetherflow_token");
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const user = await api.getMe();
        setUser(user);
        setAuthenticated(true);
        await fetchOrgs();
      } catch {
        logout();
      } finally {
        setAuthReady(true);
      }
    }

    bootstrapAuth();
  }, [setUser, setAuthenticated, setAuthReady, logout, fetchOrgs]);

  const location = useLocation();

  useWebSockets();

  if (!isAuthReady) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes — no duplicate path="/" parent */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PublicPage title="AetherFlow — Distributed Orchestration" description="AetherFlow Enterprise unifies high-throughput job scheduling, real-time worker telemetry, failover resilience, and AI-driven observability."><LandingPage /></PublicPage>} />
        </Route>

        {/* Public information pages — no auth required */}
        <Route path="/about" element={<PublicPage title="About AetherFlow" breadcrumbs={[{label:'Home', href:'/'},{label:'Company'},{label:'About'}]}><AboutPage /></PublicPage>} />
        <Route path="/security" element={<PublicPage title="Security" breadcrumbs={[{label:'Home', href:'/'},{label:'Company'},{label:'Security'}]}><SecurityPage /></PublicPage>} />
        <Route path="/privacy" element={<PublicPage title="Privacy Policy" breadcrumbs={[{label:'Home', href:'/'},{label:'Company'},{label:'Privacy'}]}><PrivacyPolicy /></PublicPage>} />
        <Route path="/terms" element={<PublicPage title="Terms of Service" breadcrumbs={[{label:'Home', href:'/'},{label:'Company'},{label:'Terms'}]}><TermsOfService /></PublicPage>} />
        <Route path="/docs" element={<PublicPage title="Documentation" breadcrumbs={[{label:'Home', href:'/'},{label:'Resources'},{label:'Documentation'}]}><DocsHome /></PublicPage>} />
        <Route path="/api-reference" element={<PublicPage title="API Reference" breadcrumbs={[{label:'Home', href:'/'},{label:'Resources'},{label:'REST API Reference'}]}><ApiReferencePage /></PublicPage>} />
        <Route path="/status" element={<PublicPage title="System Status" breadcrumbs={[{label:'Home', href:'/'},{label:'Resources'},{label:'System Status'}]}><StatusPage /></PublicPage>} />
        <Route path="/releases" element={<PublicPage title="Release Notes" breadcrumbs={[{label:'Home', href:'/'},{label:'Resources'},{label:'Release Notes'}]}><ReleasesPage /></PublicPage>} />
        <Route path="/platform/queue-management" element={<PublicPage title="Queue Management" breadcrumbs={[{label:'Home', href:'/'},{label:'Platform', href:'/platform/queue-management'},{label:'Queue Management'}]}><QueueManagementPage /></PublicPage>} />
        <Route path="/platform/job-scheduler" element={<PublicPage title="Job Scheduler" breadcrumbs={[{label:'Home', href:'/'},{label:'Platform', href:'/platform'},{label:'Job Scheduler'}]}><JobSchedulerPage /></PublicPage>} />
        <Route path="/platform/workers" element={<PublicPage title="Worker Orchestration" breadcrumbs={[{label:'Home', href:'/'},{label:'Platform', href:'/platform'},{label:'Worker Orchestration'}]}><WorkerOrchestrationPage /></PublicPage>} />
        <Route path="/platform/analytics" element={<PublicPage title="Platform Analytics" breadcrumbs={[{label:'Home', href:'/'},{label:'Platform', href:'/platform'},{label:'Analytics & Monitoring'}]}><PlatformAnalyticsPage /></PublicPage>} />
        <Route path="/platform" element={<Navigate to="/platform/queue-management" replace />} />

        {/* Authenticated shell */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/organizations" element={<ErrorBoundary><Organizations /></ErrorBoundary>} />
            <Route path="/teams" element={<ErrorBoundary><Teams /></ErrorBoundary>} />
            <Route path="/projects" element={<ErrorBoundary><Projects /></ErrorBoundary>} />
            <Route path="/queues" element={<ErrorBoundary><Queues /></ErrorBoundary>} />
            <Route path="/jobs" element={<ErrorBoundary><Jobs /></ErrorBoundary>} />
            <Route path="/scheduled-jobs" element={<ErrorBoundary><ScheduledJobs /></ErrorBoundary>} />
            <Route path="/job-explorer" element={<ErrorBoundary><JobExplorer /></ErrorBoundary>} />
            <Route path="/visualizer" element={<ErrorBoundary><WorkflowVisualizer /></ErrorBoundary>} />
            <Route path="/workers" element={<ErrorBoundary><Workers /></ErrorBoundary>} />
            <Route path="/worker-monitoring" element={<ErrorBoundary><WorkerMonitoring /></ErrorBoundary>} />
            <Route path="/executions" element={<ErrorBoundary><Executions /></ErrorBoundary>} />
            <Route path="/retry-management" element={<ErrorBoundary><RetryManagement /></ErrorBoundary>} />
            <Route path="/dlq" element={<ErrorBoundary><DeadLetterQueue /></ErrorBoundary>} />
            <Route path="/queue-analytics" element={<ErrorBoundary><QueueAnalyticsPage /></ErrorBoundary>} />
            <Route path="/system-health" element={<ErrorBoundary><SystemHealthPage /></ErrorBoundary>} />
            <Route path="/reliability" element={<ErrorBoundary><Reliability /></ErrorBoundary>} />
            <Route path="/chaos" element={<ErrorBoundary><Chaos /></ErrorBoundary>} />
            <Route path="/command-center" element={<ErrorBoundary><CommandCenter /></ErrorBoundary>} />
            <Route path="/topology" element={<ErrorBoundary><Topology /></ErrorBoundary>} />
            <Route path="/activity" element={<ErrorBoundary><ActivityFeed /></ErrorBoundary>} />
            <Route path="/ai-dashboard" element={<ErrorBoundary><AiDashboard /></ErrorBoundary>} />
            <Route path="/ai-agents" element={<ErrorBoundary><AiAgentsHub /></ErrorBoundary>} />
            <Route path="/opsgpt" element={<ErrorBoundary><OpsGpt /></ErrorBoundary>} />
            <Route path="/ai-reports" element={<ErrorBoundary><AiReports /></ErrorBoundary>} />
            <Route path="/audit-logs" element={<ErrorBoundary><AuditLogs /></ErrorBoundary>} />
            <Route path="/settings/legacy" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
            <Route path="/settings" element={<ErrorBoundary><React.Suspense fallback={<div>Loading...</div>}><SettingsAdmin.SettingsLayout /></React.Suspense></ErrorBoundary>} />
            <Route path="/plugins" element={<ErrorBoundary><Plugins /></ErrorBoundary>} />
            <Route path="/developer" element={<ErrorBoundary><DeveloperSettings /></ErrorBoundary>} />
            <Route path="/documentation" element={<ErrorBoundary><Documentation /></ErrorBoundary>} />
            <Route path="/incidents" element={<ErrorBoundary><Incidents /></ErrorBoundary>} />
            <Route path="/chat" element={<ErrorBoundary><Chat /></ErrorBoundary>} />
            <Route path="/approvals" element={<ErrorBoundary><ApprovalCenter /></ErrorBoundary>} />
            <Route path="/notifications" element={<ErrorBoundary><NotificationCenter /></ErrorBoundary>} />
            <Route path="/analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AnimatePresence>
      <Toaster theme={resolvedTheme} closeButton />
    </>
  );
}

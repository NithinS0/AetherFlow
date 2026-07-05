export interface Job {
  id: string;
  queue_id: string;
  status: "queued" | "running" | "completed" | "failed";
  retry_count: number;
}


export const jobService = {
  getJobs: async (queueId: string): Promise<Job[]> => {
    // If the endpoint is /jobs?queue_id=... or similar in API
    // We will just do a direct fetch since the queueId is what's provided
    const response = await fetch(`/api/v1/jobs?queue_id=${queueId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
      }
    });
    if (!response.ok) return [];
    const result = await response.json();
    return result.data || result || [];
  },

  claimJob: async (queueId: string, workerId: string): Promise<Job> => {
    const response = await fetch(`/api/v1/jobs/${queueId}/claim?worker_id=${workerId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
      }
    });
    const result = await response.json();
    return result.data;
  }
};

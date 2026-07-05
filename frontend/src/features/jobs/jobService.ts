export interface Job {
  id: string;
  queue_id: string;
  status: "queued" | "running" | "completed" | "failed";
  retry_count: number;
}

export const jobService = {
  getJobs: async (queueId: string): Promise<Job[]> => {
    // API mock mapping client logic
    return [
      { id: "1", queue_id: queueId, status: "completed", retry_count: 0 },
      { id: "2", queue_id: queueId, status: "queued", retry_count: 1 }
    ];
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

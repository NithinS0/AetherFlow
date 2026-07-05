import { useEffect, useState } from "react";
import { useStore } from "../../stores/store";
import { FileText, Download, Printer, Plus, Calendar } from "lucide-react";

export function Reports() {
  const { analyticsReports, fetchAnalyticsReports, createAnalyticsReport } = useStore();
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportName, setReportName] = useState("");

  useEffect(() => {
    fetchAnalyticsReports();
  }, [fetchAnalyticsReports]);

  const handleCreate = async () => {
    if (!reportName) return;
    await createAnalyticsReport({ name: reportName, description: "Custom auto-generated report." });
    setShowNewReport(false);
    setReportName("");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCsvExport = (id: string) => {
    // In a real app, this would trigger a download via API Blob
    alert(`Downloading CSV for report ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-white">Custom Reports</h3>
        <button 
          onClick={() => setShowNewReport(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {showNewReport && (
        <div className="bg-gray-800/40 backdrop-blur-md border border-indigo-500/30 rounded-xl p-5 flex flex-col gap-4">
          <h4 className="text-white font-medium">Create New Report</h4>
          <input 
            type="text" 
            placeholder="Report Name (e.g. Q3 Performance)" 
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-3">
            <button onClick={handleCreate} className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save</button>
            <button onClick={() => setShowNewReport(false)} className="px-4 py-2 bg-gray-700 text-white rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {analyticsReports?.map((report: any) => (
          <div key={report.id} className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5 flex items-center justify-between hover:bg-gray-800/60 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">{report.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => handleCsvExport(report.id)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Export CSV">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={handlePrint} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Export PDF">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!analyticsReports || analyticsReports.length === 0) && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
            No reports created yet.
          </div>
        )}
      </div>
    </div>
  );
}

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in UI:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">System UI Error</h1>
              <p className="text-sm text-gray-400 mt-2">
                An unexpected error occurred in the React component tree. The platform successfully captured the exception.
              </p>
            </div>
            
            {this.state.error && (
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-left overflow-hidden">
                <code className="text-xs text-red-400 font-mono break-words">
                  {this.state.error.message}
                </code>
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

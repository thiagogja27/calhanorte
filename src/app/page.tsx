"use client";

import React from "react";
import App from "../App";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error during runtime:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans p-6">
          <div className="w-full max-w-lg bg-red-950/20 border border-red-500/20 p-8 rounded-3xl space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">Ocorreu um erro no Calha Norte PRO:</h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-red-900/30 overflow-auto text-xs font-mono max-h-60 text-slate-300">
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Isso costuma ocorrer caso as configurações e regras do Realtime Database ainda não estejam prontas para receber requisições, ou com chaves incorretas.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-black bg-red-500 hover:bg-red-600 text-slate-950 px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Home() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}



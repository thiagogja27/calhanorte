"use client";

import dynamic from "next/dynamic";

const AppWithNoSSR = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-slate-400 font-medium">Carregando Calha Norte PRO...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AppWithNoSSR />;
}


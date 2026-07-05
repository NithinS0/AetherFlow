import React, { Suspense } from "react";
import SettingsAccordion from "../../components/SettingsAccordion";

const GeneralPanel = React.lazy(() => import("./panels/GeneralPanel"));
const AppearancePanel = React.lazy(() => import("./panels/AppearancePanel"));
const FeatureFlagsPanel = React.lazy(() => import("./panels/FeatureFlagsPanel"));

export function SettingsLayout() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-white">Administration — Settings</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SettingsAccordion
              items={[
                { id: "general", title: "General", children: <Suspense fallback={<div>Loading...</div>}><GeneralPanel /></Suspense> },
                { id: "appearance", title: "Appearance", children: <Suspense fallback={<div>Loading...</div>}><AppearancePanel /></Suspense> },
                { id: "features", title: "Feature Flags", children: <Suspense fallback={<div>Loading...</div>}><FeatureFlagsPanel /></Suspense> },
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-6 min-h-[320px]">
              <p className="text-gray-400">Select a section from the left to view and edit settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsLayout;

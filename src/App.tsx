import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { DroneFleetPage } from './pages/DroneFleetPage';
import { AgentCenterPage } from './pages/AgentCenterPage';
import { ComputerVisionPage } from './pages/ComputerVisionPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

export function App() {
  return (
    <HashRouter>
      <SimulationProvider>
        <div className="min-h-screen bg-aero-950 text-slate-100 flex flex-col font-sans selection:bg-aero-cyan selection:text-black">
          {/* Top Aerospace Mission Header */}
          <Header />

          {/* Body with Sidebar & Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* 9-Page Sidebar */}
            <Sidebar />

            {/* Dynamic Content Viewport */}
            <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 bg-gradient-to-b from-aero-950 via-aero-900/40 to-aero-950">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/fleet" element={<DroneFleetPage />} />
                  <Route path="/agents" element={<AgentCenterPage />} />
                  <Route path="/vision" element={<ComputerVisionPage />} />
                  <Route path="/mission" element={<MissionControlPage />} />
                  <Route path="/communication" element={<CommunicationPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/architecture" element={<ArchitecturePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </SimulationProvider>
    </HashRouter>
  );
}

export default App;

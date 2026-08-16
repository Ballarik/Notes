import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './pages/HomeDashboard';
import { EconomiaSection } from './pages/EconomiaSection';
import { ScuolaSection } from './pages/ScuolaSection';
import { CalendarioSection } from './pages/CalendarioSection';
import { GenericPageEditor } from './pages/GenericPageEditor';

const MainContent = () => {
  const { activeTab } = useWorkspace();

  return (
    <main className="flex-1 overflow-y-auto bg-white dark:bg-[#191919] min-h-screen">
      {activeTab === 'home' && <HomeDashboard />}
      {activeTab === 'economia' && <EconomiaSection />}
      {activeTab === 'scuola' && <ScuolaSection />}
      {activeTab === 'calendario' && <CalendarioSection />}
      {activeTab === 'custom_page' && <GenericPageEditor />}
    </main>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#d4d4d4]">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <MainContent />
        </div>
      </div>
    </WorkspaceProvider>
  );
}

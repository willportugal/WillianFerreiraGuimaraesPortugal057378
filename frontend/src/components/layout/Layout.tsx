import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Player } from './Player';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col bg-spotify-black overflow-hidden">
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-light-gray to-spotify-dark-gray pb-24">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Player - Fixed at bottom */}
      <Player />
    </div>
  );
};

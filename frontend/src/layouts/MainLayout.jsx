import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children, isLoading }) => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Fixed Width 220px */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-[220px]">
        {/* Navbar - Fixed Height 64px */}
        <Navbar isLoading={isLoading} />
        
        <main className="flex-1 mt-[64px] p-6 overflow-y-auto">
          <div className="container-custom">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

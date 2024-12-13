import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

const DashboardLayout = () => {
  return (
    <div className="flex overflow-hidden flex-col bg-black bg-opacity-0">
      <Header />
      <div className="flex flex-col w-full bg-black bg-opacity-0 max-md:max-w-full">
        <div className="pt-1 pb-3 w-full max-md:pr-5 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <Sidebar />
            <MainContent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React from "react";
import UserProfile from "./UserProfile";
import StatCards from "./StatCards";
import HistorySection from "./HistorySection";

const MainContent = () => {
  return (
    <div className="flex flex-col ml-5 w-[74%] max-md:ml-0 max-md:w-full">
      <div className="flex flex-col items-start mx-auto mt-16 w-full bg-black bg-opacity-0 max-md:mt-10 max-md:max-w-full">
        <UserProfile />
        <StatCards />
        <HistorySection />
      </div>
    </div>
  );
};

export default MainContent;

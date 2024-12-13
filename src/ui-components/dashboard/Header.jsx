import React from "react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <div className="flex relative flex-col justify-center items-end px-20 py-px w-full min-h-[180px] max-md:px-5 max-md:max-w-full">
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/61a76304b175a4099a4e7128b73b72dc2fb673596045ccf51341d4ae766df17c?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
        alt=""
        className="object-cover absolute inset-0 size-full"
      />
      <div className="flex relative flex-col justify-center items-start py-px max-w-full bg-black bg-opacity-0 w-[2221px] max-md:pr-5">
        <div className="flex flex-wrap gap-5 justify-between w-full max-md:max-w-full">
          <div className="flex flex-wrap gap-10 px-20 py-11 font-semibold whitespace-nowrap bg-black bg-opacity-0 max-md:px-5 max-md:max-w-full">
            <div className="my-auto text-5xl text-neutral-600">JOBSCAPE</div>
            <SearchBar />
          </div>
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;

import React from "react";

const SearchBar = () => {
  return (
    <form className="flex flex-col px-2 pt-2 pb-px text-3xl bg-black bg-opacity-0 text-stone-500 max-md:max-w-full">
      <div className="flex flex-wrap gap-5 justify-between px-12 py-5 bg-white border-2 border-solid border-zinc-300 rounded-[36px] max-md:px-5 max-md:max-w-full">
        <label htmlFor="search" className="sr-only">
          なにをお探しですか？
        </label>
        <input
          type="search"
          id="search"
          placeholder="なにをお探しですか？"
          className="bg-transparent border-none outline-none w-full"
        />
        <button type="submit" aria-label="検索">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c16b65288e75b0fe940041c6d37a0c9749a4d30e39fae962824235dd5c58a718?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
            alt=""
            className="object-contain shrink-0 aspect-[0.87] w-[34px]"
          />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

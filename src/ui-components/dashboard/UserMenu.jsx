import React from "react";

const UserMenu = () => {
  return (
    <div className="flex gap-7 my-auto">
      <div className="flex items-start self-start mt-3.5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/8b065c92aefd0a3978096c69151ed60ffa1090ff5a7dbfff09525ad51b3c69e4?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
          alt=""
          className="object-contain shrink-0 self-end mt-5 w-8 aspect-[0.76]"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3a0e08ade4309db568c61e748e8d114bf04560901c6a62a2481d553736b1a0ff?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
          alt=""
          className="object-contain shrink-0 self-start aspect-[1.02] w-[46px]"
        />
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/f3995be3e22a2d56a2542a9a01920a46ec50b6eca9732efe8438fd4ed58f927a?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
        alt=""
        className="object-contain shrink-0 w-20 aspect-square"
      />
    </div>
  );
};

export default UserMenu;

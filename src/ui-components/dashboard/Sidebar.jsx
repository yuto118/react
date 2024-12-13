import React from "react";

const Sidebar = () => {
  const menuItems = [
    { icon: "ext_6-", label: "ホーム", active: true },
    { icon: "ext_7-", label: "さがす" },
    { icon: "ext_8-", label: "閲覧履歴" },
    { icon: "ext_9-", label: "マイページ" },
    { icon: "ext_10-", label: "取引管理", section: true },
    { icon: "ext_11-", label: "残高・ポイント", section: true },
    { icon: "ext_12-", label: "設定", section: true },
    { icon: "ext_13-", label: "ヘルプ", section: true },
  ];

  return (
    <nav className="flex flex-col w-[26%] max-md:w-full" role="navigation">
      <div className="flex flex-col mt-16 text-xl bg-black bg-opacity-0 max-md:mt-10">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center px-7 py-8 ${
              item.active ? "text-indigo-700" : "text-zinc-600"
            } hover:bg-gray-50 transition-colors duration-200 ease-in-out`}
            aria-current={item.active ? "page" : undefined}
          >
            <img
              loading="lazy"
              src={`http://b.io/${item.icon}`}
              alt=""
              className="object-contain w-10 aspect-square"
            />
            <span className="mt-4">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;

import React from "react";

const HistorySection = () => {
  const historyItems = [
    {
      title: "イトシンプルプラン",
      subtitle: "代理店募集",
      description: "電気料金にお悩みの方へご提案ください",
      category: "不動産",
      content: "楽々でんきライトシンプルプラン」販売代理店の販売代理店て.",
      company: "株式会社テキストが入る",
      price: "￥100,000",
      image: "ext_32-",
    },
  ];

  return (
    <div className="flex flex-col px-3 pt-2 mt-16 ml-5 max-w-full bg-black bg-opacity-0 w-[1889px] max-md:mt-10">
      <div className="flex flex-col pb-16 w-full bg-white border border-gray-100 border-solid max-md:max-w-full">
        <h2 className="self-start ml-16 text-5xl text-neutral-700 font-semibold max-md:ml-2.5">
          閲覧履歴
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-6">
          {historyItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={`http://b.io/${item.image}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-blue-600 text-lg">{item.subtitle}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {item.category}
                </div>
                <p className="mt-4 text-gray-600">{item.content}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-gray-500">{item.company}</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    {item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistorySection;

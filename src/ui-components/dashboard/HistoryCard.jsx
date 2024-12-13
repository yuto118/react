import React from "react";

const HistoryCard = () => {
  const historyItems = [
    {
      image: "ext_32-",
      title: "イトシンプルプラン",
      subtitle: "代理店募集",
      description: "電気料金にお悩みの方へご提案ください",
      category: "不動産",
      content: "楽々でんきライトシンプルプラン」販売代理店の販売代理店て.",
      company: "株式会社テキストが入る",
      price: "￥100,000",
    },
  ];

  return (
    <div className="flex flex-col px-3 pt-2 mt-16 ml-5 max-w-full bg-black bg-opacity-0 w-[1889px] max-md:mt-10">
      <div className="flex flex-col pb-16 w-full bg-white border border-gray-100 border-solid max-md:max-w-full">
        <h2 className="self-start ml-16 text-5xl text-neutral-700 max-md:ml-2.5 font-semibold">
          閲覧履歴
        </h2>
        {historyItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-end pt-2 pr-1 pl-6 mt-20 w-full bg-black bg-opacity-0 max-md:pl-5 max-md:mt-10 max-md:max-w-full"
          >
            <div className="flex z-10 self-stretch max-md:mr-1.5 max-md:max-w-full">
              <img
                loading="lazy"
                src={`http://b.io/${item.image}`}
                alt=""
                className="object-contain z-10 shrink-0 my-auto -mr-9 aspect-square rounded-[36px] w-[72px]"
              />
              <div className="flex relative flex-col grow shrink-0 items-start pt-36 pr-20 pb-16 pl-1.5 basis-0 min-h-[288px] w-fit max-md:pt-24 max-md:pr-5 max-md:max-w-full">
                <div className="relative ml-8 text-xl text-lime-900 max-md:ml-2.5">
                  {item.title}
                </div>
                <div className="relative mt-5 text-5xl text-blue-400 max-md:text-4xl">
                  {item.subtitle}
                </div>
                <div className="flex flex-col justify-center p-1 max-w-full text-2xl text-lime-300 bg-black bg-opacity-0 w-[477px] max-md:mr-1">
                  <div className="py-2 bg-sky-500 border border-blue-500 border-solid max-md:max-w-full">
                    {item.description}
                  </div>
                </div>
                <div className="flex flex-col items-start pt-2 pr-7 pb-9 pl-2.5 mt-1.5 max-w-full bg-white w-[484px] max-md:pr-5">
                  <div className="flex flex-col justify-center px-1.5 py-1 w-36 max-w-full text-2xl bg-black bg-opacity-0 text-zinc-400 max-md:ml-0.5">
                    <div className="p-3.5 bg-white rounded-3xl border border-solid border-neutral-400 max-md:px-5">
                      {item.category}
                    </div>
                  </div>
                  <div className="self-stretch mt-6 text-2xl leading-9 text-zinc-600 max-md:max-w-full">
                    {item.content}
                  </div>
                  <div className="mt-11 text-2xl text-neutral-400 max-md:mt-10">
                    {item.company}
                  </div>
                  <div className="mt-9 ml-2.5 text-3xl text-zinc-600">
                    {item.price}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryCard;

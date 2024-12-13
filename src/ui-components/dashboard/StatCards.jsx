import React from "react";

const StatCards = () => {
  const stats = [
    { title: "フォーム送信", count: 7 },
    { title: "商談中", count: 3 },
    { title: "取引不成立", count: 1 },
    { title: "取引完了", count: 4 },
  ];

  return (
    <div className="flex flex-wrap gap-5 justify-between mt-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col justify-center p-1 w-[calc(25%-1rem)] font-semibold whitespace-nowrap bg-black bg-opacity-0 max-md:mt-6 max-md:max-w-full"
        >
          <div className="flex flex-col py-14 pr-6 pl-20 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
            <div className="self-center text-3xl text-neutral-700">
              {stat.title}
            </div>
            <div className="flex gap-5 justify-between items-start self-end mt-5">
              <div className="flex gap-6 self-end mt-5">
                <div className="text-5xl text-indigo-500 max-md:text-4xl">
                  {stat.count}
                </div>
                <div className="self-start mt-2.5 text-3xl text-neutral-700">
                  件
                </div>
              </div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5379355b3a18e3d7ef54a61910a29756d43a571d28ef8e4f23b873ccf7462e3?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
                alt=""
                className="object-contain shrink-0 self-start aspect-[0.61] w-[17px]"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;

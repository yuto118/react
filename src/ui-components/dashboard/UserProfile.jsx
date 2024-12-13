import React from "react";

const UserProfile = () => {
  return (
    <div className="flex flex-col items-start ml-7 max-w-full font-semibold whitespace-nowrap w-[1849px]">
      <div className="flex flex-wrap gap-5 self-stretch">
        <div className="flex flex-col text-3xl text-neutral-600">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/6b2e750e9461d1725834f79a7d015be07f9d4c6d55012cf0addff657e3fc735f?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
            alt="プロフィール画像"
            className="object-contain aspect-square rounded-[72px] w-[147px] max-md:mr-2.5"
          />
          <div className="flex gap-2.5 mt-9">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/650e770e44cc3de2c1fa0c2fbf6523d404b611833f1f5a9f72d8ffd29cdfe9d8?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
              alt=""
              className="object-contain shrink-0 aspect-[0.86] w-[30px]"
            />
            <div className="grow shrink my-auto w-[106px]">本人確認</div>
          </div>
        </div>
        <div className="flex flex-col grow shrink-0 self-start mt-8 basis-0 w-fit max-md:max-w-full">
          <div className="flex flex-wrap gap-5 justify-between items-start w-full max-md:max-w-full">
            <div className="flex gap-8 text-4xl text-zinc-600">
              <div className="flex-auto max-md:max-w-full">
                アカウント名20文字まで
              </div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/2d579df90566063cb2b3a9c01aad8e9383d3add946535bf1e0b6de78482211ad?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
                alt=""
                className="object-contain shrink-0 my-auto aspect-[0.61] w-[17px]"
              />
            </div>
            <button className="mt-5 text-2xl text-neutral-500">
              プロフィールを編集する
            </button>
          </div>
          <div className="flex gap-7 self-start mt-5">
            <div className="grow my-auto text-3xl text-indigo-500">
              ベーシック
            </div>
            <button className="flex flex-col justify-center px-1.5 py-1 text-xl text-cyan-200 bg-black bg-opacity-0">
              <div className="px-6 py-3.5 bg-cyan-400 rounded-3xl border border-teal-400 border-solid max-md:px-5">
                ランクアップする
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-5 justify-between px-7 py-6 mt-4 max-w-full bg-sky-100 w-[698px] max-md:px-5">
        <div className="flex gap-4">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/005dca3083c1317a29f0104fde29c0f37e4e1f31f92ffb16d626ef27b0b51268?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
            alt=""
            className="object-contain shrink-0 aspect-[0.99] w-[82px]"
          />
          <div className="flex flex-col grow shrink-0 self-start mt-1 basis-0 w-fit">
            <div className="text-2xl text-zinc-700">
              本人確認が完了していません
            </div>
            <div className="self-start mt-5 text-2xl text-gray-700">
              振込申請ができません
            </div>
          </div>
        </div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/6c186e615e16f70c69a90e155e216807147700b916a0ccddad8c3d8d467afbcc?placeholderIfAbsent=true&apiKey=bfaa4e62f8e9439bb5df5aed766111e3"
          alt=""
          className="object-contain shrink-0 my-auto w-3.5 aspect-[0.56]"
        />
      </div>
      <div className="mt-7 text-2xl leading-10 text-neutral-500 max-md:max-w-full">
        紹介文テキストが入ります紹介文テキストが入ります紹介文テキストが
        <br />
        入ります紹介文テキストが入ります紹介文テキストが入ります
        <br />
        紹介文テキストが入りますストが入ります紹介文
      </div>
    </div>
  );
};

export default UserProfile;

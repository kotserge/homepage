// React
import React, { useState } from "react";

import Image from "next/image";

export default function Home() {
  const images = [
    "/images/me.webp",
    "/images/8-bit-serge.webp",
    "/images/futurama-simulation.webp",
  ];
  const [currentImage, setCurrentImage] = useState<number>(0);

  const handleImageClick = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  return (
    <div className="m-auto flex flex-col items-center justify-center px-2 lg:-mx-32 lg:flex-row xl:-mx-64">
      <div className="my-8 flex aspect-square max-h-64 lg:mr-16 lg:max-h-96 xl:max-h-[32rem]">
        <Image
          src={images[currentImage]}
          alt="Profile Picture"
          width={500}
          height={500}
          className="cursor-pointer rounded-full bg-accent"
          loading="eager"
          onClick={handleImageClick}
        />
      </div>

      <h1 className="whitespace-nowrap text-3xl font-black lg:text-left lg:text-7xl xl:text-8xl">
        KOTCHOURKO SERGE <br /> COMPUTER SCIENTIST
      </h1>
    </div>
  );
}

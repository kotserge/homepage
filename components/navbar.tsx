import React from "react";

// Next component
import Image from "next/image";
import Link from "next/link";

const Navbar: React.FC<{}> = () => {
  return (
    <div className="flex flex-row items-center justify-between px-2 font-bold">
      <Link className="group flex flex-row items-center py-2" href="/">
        <div className="flex justify-center rounded-full group-hover:animate-wiggle">
          <Image
            src="/favicon.png"
            alt="Duck"
            width={18}
            height={18}
            loading="eager"
          />
        </div>
        <span className="smooth-underline group-hover:smooth-underline-active ml-2 text-xl">
          {" "}
          KOTCHOURKO{" "}
        </span>
      </Link>

      <div className="flex flex-row space-x-2 pt-2">
        <Link
          className="group cursor-pointer rounded-md px-4 py-6 transition-all duration-700"
          href="/about"
        >
          <span className="smooth-underline group-hover:smooth-underline-active">
            About
          </span>
        </Link>

        {/* <Link
          className="group cursor-pointer rounded-md px-4 py-6 transition-all duration-700"
          href="/blog"
        >
          <span className="smooth-underline group-hover:smooth-underline-active">
            Blog
          </span>
        </Link> */}
      </div>
    </div>
  );
};

export default Navbar;

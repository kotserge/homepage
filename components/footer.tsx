import React from "react";

// Next component
import type { AppProps } from "next/app";
import Link from "next/link";

const Footer: React.FC<{}> = () => {
  return (
    <div className="flex flex-row items-center justify-center space-x-4 px-4 py-6 opacity-75 lg:space-x-16">
      <Link href="/privacy-policy">Privacy Policy</Link>
      <span>·</span>
      <Link href="/legal-notice">Legal Notice</Link>
      <span>·</span>
      <Link href="/licenses" prefetch={false}>
        Licenses
      </Link>
    </div>
  );
};

export default Footer;

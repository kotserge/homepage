import React from "react";

// Next component
import type { AppProps } from "next/app";
import Link from "next/link";
import Head from "next/head";

// Component
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// CSS
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex h-full min-h-screen justify-center bg-primary font-sans text-secondary">
      <div className="flex w-full max-w-4xl flex-col">
        <Head>
          <title>Kotchourko</title>
          <link rel="icon" href="/favicon.png" />

          <meta charSet="UTF-8" />
          <meta
            name="description"
            content="
                        Hey there! I am Serge Kotchourko, a computer scientist from Germany.
                        I enjoy learning all things related and unrelated to my field,
                        though artificial intelligence and information security scratch an itch for me.
                    "
          />
          <meta
            name="keywords"
            content="Serge Kotchourko, Kotchourko Serge, Kotchourko, Serge, Computer Science, Computer Scientist, Blog, Quantum Computing, Artificial Intelligence, Information Security, Software Engineering"
          />
          <meta name="author" content="Serge Kotchourko" />

          {/* Open Graph */}
          <meta property="og:title" content="Kotchourko" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://kotchourko-serge.de/" />
          <meta
            property="og:image"
            content="https://kotchourko-serge.de/images/me.webp"
          />
          <meta
            property="og:description"
            content="
                        Hey there! I am Serge Kotchourko, a computer scientist from Germany.
                        I enjoy learning all things related and unrelated to my field,
                        though artificial intelligence and information security scratch an itch for me.
                    "
          />
          <meta property="og:site_name" content="Kotchourko" />
        </Head>

        <div className="top-0 z-50">
          <Navbar />
        </div>

        <Component {...pageProps} />

        <div className="bottom-0 z-50">
          <Footer />
        </div>
      </div>
    </div>
  );
}

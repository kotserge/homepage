// Next
import Link from "next/link";
import Head from "next/head";

// Import icons
import { Github, Linkedin, Notes } from "iconoir-react";

export default function About() {
  return (
    <div className="my-auto flex flex-col items-center space-y-8 py-16">
      <Head>
        <title>About · Kotchourko</title>
      </Head>

      <div className="flex flex-col items-center lg:flex-row">
        <div className="flex aspect-square h-32 items-center justify-center rounded-full bg-accent">
          <h1 className="text-ellipsis p-6 text-center text-2xl font-black">
            ABOUT ME
          </h1>
        </div>
        <div className="m-8 text-justify">
          Hej there! I am Serge, a computer scientist working as a Software
          Engineer to refactor some code written before my time. On the side, I
          research artificial intelligence and information security, currently
          focusing on Scientific Machine Learning for Physics. I do enjoy some
          respite from this, by trying out all sorts of activities unrelated to
          my field. Hit me up, if you want to have a chat.
        </div>
      </div>

      <div className="my-16 flex flex-row space-x-8">
        <div className="flex aspect-square h-16 items-center justify-center rounded-full bg-accent transition-all duration-500 hover:scale-110">
          <Link href="https://github.com/kotserge">
            <Github className="p-4 text-center text-4xl" />
          </Link>
        </div>

        <div className="flex aspect-square h-16 items-center justify-center rounded-full bg-accent transition-all duration-500 hover:scale-110">
          <Link href="https://www.linkedin.com/in/kotchourko-serge/">
            <Linkedin className="p-4 text-center text-4xl" />
          </Link>
        </div>

        <div className="flex aspect-square h-16 items-center justify-center rounded-full bg-accent transition-all duration-500 hover:scale-110">
          <a href="/pdf/resume.pdf" target="_blank">
            <Notes className="p-4 text-center text-4xl" />
          </a>
        </div>
      </div>
    </div>
  );
}

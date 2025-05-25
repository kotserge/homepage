// React
import React, { useState } from "react";

// Next
import Head from "next/head";

// Lib
import { getSortedBlogHeaders } from "@/lib/util/useBlog";

// Model
import BlogEntry from "@/lib/model/blog/BlogEntry";

// Components
import Header from "@/components/head";
import BlogCard from "@/components/blogcard";

export default function Blog({
  blogEntries,
}: Readonly<{ blogEntries: BlogEntry[] }>) {
  return (
    <div className="mx-16 my-16 h-full justify-center">
      <Head>
        <title>Blog · Kotchourko</title>
      </Head>

      <Header
        title="Posts"
        description="A collection of thoughts, ideas, and projects that I've worked on."
      />

      <div className="mt-8 flex flex-col space-y-16">
        {blogEntries.map((blogEntry) => {
          return <BlogCard key={blogEntry.id} blog={blogEntry} />;
        })}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const blogEntries: BlogEntry[] = getSortedBlogHeaders();
  return {
    props: {
      blogEntries: JSON.parse(JSON.stringify(blogEntries)),
    },
  };
}

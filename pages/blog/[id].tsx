// Next Component
import Head from "next/head";

// Lib
import BlogEntry from "@/lib/model/blog/BlogEntry";
import { getAllBlogIds, getBlog } from "@/lib/util/useBlog";

// Components
import Header from "@/components/head";

export default function BlogPage({ blog }: Readonly<{ blog: BlogEntry }>) {
  const pageName = `${blog.title} · Kotchourko`;

  return (
    <div className="mx-16 my-16 h-full justify-center">
      <Head>
        <title>{pageName}</title>
      </Head>

      <Header
        title={blog.title}
        description={blog.description}
        date={blog.formattedDate}
      />

      <div
        className="markdown-page mt-8"
        dangerouslySetInnerHTML={{ __html: blog.content ?? "" }}
      />
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getAllBlogIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {
  const blog: BlogEntry = await getBlog(params.id);
  return {
    props: {
      blog: JSON.parse(JSON.stringify(blog)),
    },
  };
}

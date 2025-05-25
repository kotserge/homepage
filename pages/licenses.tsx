// Next Component
import Head from "next/head";

// Lib
import { getMarkdownFormatted } from "@/lib/util/useMarkdown";

// Components
import Header from "@/components/head";

export default function LicensesPage({
  pagedata,
}: Readonly<{ pagedata: string }>) {
  return (
    <div className="mx-16 my-16 h-full justify-center">
      <Head>
        <title>Licenses · Kotchourko</title>
      </Head>

      <Header
        title="Licenses"
        description="This website used the following open source libraries for its development:"
      />

      <div
        className="markdown-page"
        dangerouslySetInnerHTML={{ __html: pagedata }}
      />
    </div>
  );
}

export async function getStaticProps() {
  const pagedata: string = getMarkdownFormatted("", "LICENSE.DEPENDENCIES.md");
  return {
    props: {
      pagedata: JSON.parse(JSON.stringify(pagedata)),
    },
  };
}

// React
import { useState } from "react";

// Next
import Head from "next/head";

// Custom Components
import { getMarkdownFormatted } from "@/lib/util/useMarkdown";

// Components
import Toggle from "@/components/toggle";
import Header from "@/components/head";

export default function LegalNoticePage({
  de,
  eng,
}: Readonly<{
  de: string;
  eng: string;
}>) {
  const [isOn, setIsOn] = useState(true);

  return (
    <div className="mx-16 my-16 h-full justify-center">
      <Head>
        {isOn ? (
          <title>Impressum · Kotchourko</title>
        ) : (
          <title>Legal Notice · Kotchourko</title>
        )}
      </Head>

      <Header
        title={isOn ? "Impressum" : "Legal Notice"}
        description={
          isOn
            ? "Im Folgenden finden Sie das Impressum."
            : "Below you will find the legal notice."
        }
      />

      <Toggle
        on={isOn}
        onClick={() => setIsOn(!isOn)}
        leftText="ENG"
        rightText="DE"
      />

      <div
        className="markdown-page"
        dangerouslySetInnerHTML={{ __html: isOn ? de : eng }}
      />
    </div>
  );
}

export async function getStaticProps() {
  const legalnoticede: string = getMarkdownFormatted(
    "",
    "data/legal-notice/legal-notice-de.md",
  );
  const legalnoticeeng: string = getMarkdownFormatted(
    "",
    "data/legal-notice/legal-notice-eng.md",
  );
  return {
    props: {
      de: JSON.parse(JSON.stringify(legalnoticede)),
      eng: JSON.parse(JSON.stringify(legalnoticeeng)),
    },
  };
}

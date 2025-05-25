// React
import { useState } from "react";

// Next
import Head from "next/head";

// Custom Components
import { getMarkdownFormatted } from "@/lib/util/useMarkdown";

// Components
import Header from "@/components/head";
import Toggle from "@/components/toggle";

export default function PrivacyPolicyPage({
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
          <title>Datenschutzerklärung · Kotchourko</title>
        ) : (
          <title>Privacy Policy · Kotchourko</title>
        )}
      </Head>

      <Header
        title={isOn ? "Datenschutzerklärung" : "Privacy Policy"}
        description={
          isOn
            ? "Im Folgenden finden Sie Informationen zur Datenschutzerklärung."
            : "In the following you will find information on our privacy policy."
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
    "data/privacy-policy/privacy-policy-de.md",
  );
  const legalnoticeeng: string = getMarkdownFormatted(
    "",
    "data/privacy-policy/privacy-policy-eng.md",
  );
  return {
    props: {
      de: JSON.parse(JSON.stringify(legalnoticede)),
      eng: JSON.parse(JSON.stringify(legalnoticeeng)),
    },
  };
}

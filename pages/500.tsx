import Head from "next/head";

export default function Custom500() {
    return (
        <div className="flex flex-col h-full items-center justify-center">
            <Head>
                <title>500 · Kotchourko</title>
            </Head>

            <h1 className="text-9xl font-black">500</h1>
            <h2 className="text-4xl font-bold">Internal Server Error</h2>
        </div>
    );
}

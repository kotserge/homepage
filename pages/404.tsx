import Head from "next/head";

export default function Custom404() {
    return (
        <div className="flex flex-col h-full items-center justify-center">
            <Head>
                <title>404 · Kotchourko</title>
            </Head>

            <h1 className="text-9xl font-black">404</h1>
            <h2 className="text-4xl font-bold">Page Not Found</h2>
        </div>
    );
}

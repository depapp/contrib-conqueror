import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <title>ContribConqueror</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script
        src="https://eu.umami.is/script.js"
        data-website-id={process.env.UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

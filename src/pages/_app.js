import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <title>ContribConqueror</title>
        <link rel="icon" href="/favicon.ico" />
        <script defer src={`https://eu.umami.is/script.js`} data-website-id={process.env.UMAMI_WEBSITE_ID} crossorigin="anonymous"></script>
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

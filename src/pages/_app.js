import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
    <Head>
      <link href="/favicon.ico" type="image/png" />
      <script defer src={`https://eu.umami.is/script.js`} data-website-id={process.env.UMAMI_WEBSITE_ID} crossorigin="anonymous"></script>
    </Head>
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
    </>
  );
}

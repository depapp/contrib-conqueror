import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import Head from "next/head";
import posthog from "posthog-js";
import { PostHogProvider } from 'posthog-js/react';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <Head>
        <title>ContribConqueror</title>
        <link rel="icon" href="/favicon.ico" />
        <script defer src={`https://eu.umami.is/script.js`} data-website-id={process.env.UMAMI_WEBSITE_ID} crossorigin="anonymous"></script>
      </Head>
      <SessionProvider session={session}>
        <PostHogProvider client={posthog}>
          <Component {...pageProps} />
        </PostHogProvider>
      </SessionProvider>
    </>
  );
}

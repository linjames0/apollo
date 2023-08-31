import { Layout } from '@vercel/examples-ui'
import Head from 'next/head'
import { Chat } from '../components/Chat'

function Home() {
  return (<>
    <Head>
      <title>Apollo AI - Research Chat</title>
      <meta name="description" content="Chat and ask questions about clinical trials, medicine, or healthcare with AI. Powered by ChatGPT." />
      <meta property="og:title" content="Apollo AI - Research Chat" />
      <meta property="og:description" content="Chat and ask questions about clinical trials, medicine, or healthcare with AI. Powered by ChatGPT." />
      <meta property="og:url" content="https://apollo-gejhce3tq-lin-james.vercel.app" />
      <meta property="og:site_name" content="Apollo AI - Research Chat" />
      <meta property="og:image" content="https://apollo-gejhce3tq-lin-james.vercel.app/ApolloThumbnail.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en-US" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Apollo AI - Research Chat" />
      <meta name="twitter:description" content="Chat and ask questions about clinical trials, medicine, or healthcare with AI. Powered by ChatGPT." />
      <meta name="twitter:site" content="@macrocosmcorp" />
      <meta name="twitter:site:id" content="1515531815594864640" />
      <meta name="twitter:image" content="https://apollo-gejhce3tq-lin-james.vercel.app/ApolloThumbnail.png" />
    </Head>
    <div className="w-full max-w-[700px]">
      <Chat researchType='clinical_trials' />
    </div>
  </>
  )
}

Home.Layout = Layout

export default Home

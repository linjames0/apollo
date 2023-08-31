import { Layout } from '@vercel/examples-ui'
import Head from 'next/head'
import { Chat } from '../components/Chat'

function Home() {
  return (<>
    <Head>
      <title>AI Bible Scholar</title>
      <meta name="description" content="Chat and ask questions about the Bible with AI. Powered by ChatGPT." />
      <meta property="og:title" content="AI Bible Scholar" />
      <meta property="og:description" content="Chat and ask questions about the Bible with AI. Powered by ChatGPT." />
      <meta property="og:url" content="https://tensor.church" />
      <meta property="og:site_name" content="AI Bible Scholar" />
      <meta property="og:image" content="https://tensor.church/static/open_graph_2.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en-US" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI Bible Scholar" />
      <meta name="twitter:description" content="Chat and ask questions about the Bible with AI. Powered by ChatGPT." />
      <meta name="twitter:site" content="@macrocosmcorp" />
      <meta name="twitter:site:id" content="1515531815594864640" />
      <meta name="twitter:image" content="https://tensor.church/static/open_graph_2.png" />
    </Head>
    <div className="w-full max-w-[700px]">
      {/* <Chat researchType='christian' /> */}
    </div>
  </>
  )
}

Home.Layout = Layout

export default Home

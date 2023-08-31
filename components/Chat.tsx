import { useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Button } from './Button'
import { ChatLine, LoadingChatLine, type ChatGPTMessage } from './ChatLine'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'


export type ResearchType = 'clinical_trials'


// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: Record<ResearchType, ChatGPTMessage[]> = {
  clinical_trials: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI assistant trained on databases of millions of clinical trial data. I'm here to help answer all your questions about clinical trials. Feel free to start by asking me a question.",
    }
  ]
}

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="mt-6 flex clear-both">
    <input
      type="text"
      aria-label="chat input"
      required
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
    />
    <Button
      type="submit"
      className="ml-4 flex-none"
      onClick={() => {
        sendMessage(input)
        setInput('')
      }}
    >
      Say
    </Button>
  </div>
)


export function Chat({ researchType }: { researchType: ResearchType }) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages[researchType])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    // const last10messages = newMessages.slice(-10) // remember last 10 messages

    const response = await fetch('/api/chat', {
    // const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: newMessages,
        user: cookie[COOKIE_NAME],
        belief: researchType,
      }),
    })

    console.log('Edge function returned.')
    console.log(response) 

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data: any = await response.json()
    if (!data) {
      throw new Error('No data received.')
    }

    console.log(data)
    setMessages([
      ...data,
    ])

    setLoading(false)
  }

  if (!messages) {
    return <div>loading...</div>
  }
  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-6">
      {/* <span className="mx-auto flex flex-grow text-red-400 clear-both mb-3 -mt-1 text-sm">
        We&apos;re currently experiencing high traffic. Please be patient as things may be slow.
      </span> */}
      <span className="mx-auto flex flex-grow text-gray-400 clear-both mb-5 -mt-1 text-sm">
        Disclaimer: This is a beta version of Apollo AI. The answers provided by the AI are not guaranteed to be accurate. Please consult a certified medical professional for any serious questions.
        All languages are supported, but the AI is trained on English.
        No personal information is stored, all chats are anonymous and deleted as soon as the chat is over.
      </span>
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both">
          Type a message to start the conversation
        </span>
      )}
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}

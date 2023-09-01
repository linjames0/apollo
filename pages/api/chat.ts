import { type ResearchType } from "../../components/Chat";
import { type ChatGPTMessage } from "../../components/ChatLine";

const system_messages: Record<ResearchType, ChatGPTMessage> = {
  'clinical_trials': {
    role: "system",
    content: `An AI assistant that is an expert in biological, clinical, and medical understanding, to answer any questions about the health and medical field.
    The AI assistant has specific knowledge about clinical trials and life science research.
    AI assistant has access to all the clinical trial data from clinicaltrials.gov.
    The traits of AI include expert knowledge, helpfulness, vast knowledge, and articulateness.
    AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
    AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
    If the user is confused or starts the conversation without a clear goal, AI assistant will prompt the user with questions to help them figure out what they want to talk about.`,
  },
}

const search_function = (textName: string) => {
  return {
    name: `search_${textName}`,
    description: `Search the ${textName} with natural language, returning clinical studies that match.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: `A query to search the ${textName} with, best formatted as a question or a statement.`,
        },
        num_results: {
          type: "integer",
          description: "The number of results to return.",
          default: 5,
        },
      },
      required: ["query"],
    },
  }
}

const research_functions: Record<ResearchType, object[]> = {
  'clinical_trials': [
    search_function('clinical_trials'),
  ],
}
    
// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};

const requestHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
};

if (process.env.OPENAI_API_ORG) {
  requestHeaders["OpenAI-Organization"] = process.env.OPENAI_API_ORG;
}

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json();

  console.log("Handler was called");

  if (!body?.messages || !body?.research) {
    return new Response("Missing body", { status: 400 });
  }

  const research: ResearchType = body.research;
  const messages: ChatGPTMessage[] = [];
  messages.push(system_messages[research]);
  messages.push(...body?.messages);

  let result_messages = await get_response(messages, research);
  if (!result_messages) {
    return new Response("OpenAI API Error", { status: 500 });
  }

  let output = result_messages.filter(x => x.role == "assistant" || x.role == "user")

  return new Response(JSON.stringify(output), { status: 200 });
};
export default handler;

const payload_template = {
  model: "gpt-3.5-turbo-0613",
  function_call: "auto",
};

type SearchFunctions =  'search_clinical_trials'

const search_functions: Record<SearchFunctions, string> = {
  'search_clinical_trials': 'http://127.0.0.1:5000/chat',
}

async function get_response(messages: ChatGPTMessage[], research: ResearchType): Promise<ChatGPTMessage[] | null> {
  let payload = { ...payload_template, messages, functions: research_functions[research] };

  // const res = await fetch("https://api.openai.com/v1/chat/completions", {
  const res = await fetch("http://127.0.0.1:5000/chat", {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.status !== 200) {
    console.log("openai error:", res.status, res.statusText, await res.text(), process.env.OPENAI_API_KEY);
    return null
  }

  let json = await res.json();
  let message = json?.choices[0].message;

  if (message.function_call) {
    let function_name: SearchFunctions = message.function_call.name;
    let function_args = JSON.parse(message.function_call.arguments);

    // call function and get result SearchFunctions
    if (!search_functions[function_name]) {
      console.log("error: unknown function", function_name);    
      return null
    }

    if (!function_args.query) {
      console.log("error: missing query");
      return null
    }
    
    const res = await fetch(search_functions[function_name], {
      method: "POST",
      body: JSON.stringify({
        query: function_args.query,
        num_results: function_args.num_results,
      }),
    });

    if (res.status !== 200) {
      console.log("error:", res.status, res.statusText);
      return null
    }

    let studies = await res.json();
    // verify that we got a valid response
    if (!studies || !studies.length) {
      console.log("error: no studies returned", studies);
      return null
    }

    // add to conversation
    messages.push({
      role: "function",
      name: function_name,
      content: JSON.stringify(studies),
    });
    return get_response(messages, research);
  }

  messages.push(message);

  return messages
}

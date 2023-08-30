from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import chromadb
import openai
from tenacity import retry, stop_after_attempt, wait_random_exponential

client = chromadb.PersistentClient(path="/Users/jameslin/Documents/Code/Alexandria/apollo/chroma-db")
collection = client.get_collection(name="clinical_trials")

@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(6))
def get_embedding(text: str, id: str, model="text-embedding-ada-002") -> tuple[int, list[float]]:
    try:
        result = openai.Embedding.create(input=[text], model=model)
    except:
        print("Error: " + str(id))
        print("Text: " + text)
        
    return (id, result["data"][0]["embedding"], text)

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST', 'GET'])
def chat():
    data = request.get_json()
    print("data received")
    # print(data)

    query_text = data.get("messages")[-1]["content"]

    print(query_text)
        
    n_results = ""
    while n_results not in ["0", "1", "2", "3", "4", "5"]:
        n_results = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a classifier that takes in the input query and returns an integer from 0 to 5. Based on the input query, the integer you return represents the number of clinical trials that are necessary to best answer the query. If you don't think any clinical trials are necessary, return 0. Else, return the number of clinical trials you think are necessary. The entirety of your response should just be a single alphanumeric number. DO NOT WRITE ANYTHING ELSE IN YOUR RESPONSE."},
                {"role": "user", "content": query_text},
            ],
        )["choices"][0]["message"]["content"]
        print("N Results: " + n_results)

    query_embedding = get_embedding(query_text, 'query')[1]

    system_results = []
    if n_results != "0":
        results = collection.query(
            query_embeddings=query_embedding,
            include=["documents"],
            n_results=int(n_results),
        )

        docs = results['documents'][0]
        ixs = results['ids'][0]
        for doc, ix in zip(docs, ixs):
            system_results.append({"role": "system", "content": "The following content after 'Clinical Trial Study: ' are the clinical trial results for the queries that you'll be answering. Use the results from these studies to answer the question reasonably. Always cite the study title and NCTID. Clinical Trial Study: " + doc + " (NCTID: " + ix + ")"})
        
        print(docs[0])

    context = data.get("messages") + system_results

    print(context)

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=context,
    )

    # print("response: " + response)

    # chatgpt_response = { "role": "assistant", "content": response }
    print(response)

    return jsonify(response)

@app.route('/api/chat', methods=['POST', 'GET'])
def api_chat():
    data = request.get_json()
    print("data received1")
    print(data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
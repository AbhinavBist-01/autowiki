import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new Pinecone();

function wrapIndex(index) {
  return new Proxy(index, {
    get(target, prop, receiver) {
      if (prop === "namespace") {
        return function (ns) {
          const namespaced = target.namespace(ns);
          return wrapIndex(namespaced);
        };
      }
      if (prop === "upsert") {
        return function (options, ...rest) {
          if (Array.isArray(options)) {
            return target.upsert({ records: options }, ...rest);
          }
          return target.upsert(options, ...rest);
        };
      }
      const val = Reflect.get(target, prop, receiver);
      return typeof val === "function" ? val.bind(target) : val;
    },
  });
}

export function getIndex() {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || "autowiki");
  return wrapIndex(index);
}

export async function saveChunks(repo, docs) {
  if (!docs || docs.length === 0) {
    console.warn(`No documents to save to Pinecone for ${repo}`);
    return;
  }

  const namespace = repo.replace("/", "-");

  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex: getIndex(),
    namespace,
  });
}

export async function search(repo, query, topK = 5) {
  const namespace = repo.replace("/", "-");
  const queryEmbedding = await embeddings.embedQuery(query);
  const index = getIndex();
  const queryResponse = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return (queryResponse.matches || []).map((match) => ({
    pageContent: match.metadata?.text || "",
    metadata: match.metadata || {},
    score: match.score,
  }));
}
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const pinecone = new Pinecone();

function getIndex() {
  return pinecone.Index(process.env.PINECONE_INDEX_NAME || "autowiki");
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

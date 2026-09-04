import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkFiles(files, repo) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const documents = [];

  for (const file of files) {
    const text = file.content ?? file.contents ?? "";
    const chunks = await splitter.createDocuments(
      [text],
      [{ path: file.path, repo }],
    );
    documents.push(...chunks);
  }
  return documents;
}

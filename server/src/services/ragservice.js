const { generateLocalEmbedding } = require("./embeddingservice");
const { searchSimilarChunks } = require("./vectorStore");
const { generateAnswer } = require("./llmservice");
const retrieveContext = async (question, repo, topK = 5) => {
  // Step 1: Convert the user's question into an embedding
  const queryEmbedding = await generateLocalEmbedding(question);

  // Step 2: Search Vectra for relevant repository chunks
const results = await searchSimilarChunks(queryEmbedding, 20);

const filteredResults = results
  .filter((result) => result.item.metadata.repo === repo)
  .slice(0, topK);
  // Step 3: Combine the retrieved chunks into one context string
  if (filteredResults.length === 0) {
  return {
    context: "",
    answer: "No relevant code chunks were found for this repository. Please analyze the repository again or try a different question.",
  };
}

const context = filteredResults
  .map((result) => {
    const metadata = result.item.metadata;

    return `FILE: ${metadata.path}\n${metadata.text}`;
  })
  .join("\n\n--------------------\n\n");

const answer = await generateAnswer(question, context);
return {
  context,
  answer,
};
};

module.exports = {
  retrieveContext,
};
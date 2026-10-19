const {
  generateLocalEmbedding,
} = require("./embeddingservice");

const {
  searchSimilarChunks,
} = require("./vectorStore");

const testRetrieval = async () => {
  const query = "How does this project handle API requests?";

  console.log("Query:", query);

  const queryEmbedding = await generateLocalEmbedding(query);

  console.log("Query embedding length:", queryEmbedding.length);

  const results = await searchSimilarChunks(queryEmbedding, 5);
console.log("RESULT TYPE:", typeof results);
console.log("IS ARRAY:", Array.isArray(results));
console.log("RESULTS:", results);
console.log("FIRST METADATA:", results[0].item.metadata);
  console.log("\nRetrieved chunks:\n");

  results.forEach((result, index) => {
    console.log(`--- Result ${index + 1} ---`);
    console.log("Score:", result.score);
    console.log("Path:", result.item.metadata.path);
    console.log("Chunk:", result.item.metadata.chunkIndex);
    console.log("Text:", result.item.metadata.text.slice(0, 500));
    console.log();
  });
};

testRetrieval();
require("dotenv").config();

const OpenAI = require("openai");
const { pipeline } = require("@huggingface/transformers");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -------------------------
// OpenAI Embedding
// -------------------------

const generateOpenAIEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
};

// -------------------------
// Local Embedding
// -------------------------

let embeddingPipeline = null;

const getEmbeddingPipeline = async () => {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  return embeddingPipeline;
};

const generateLocalEmbedding = async (text) => {
  const extractor = await getEmbeddingPipeline();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};

// -------------------------
// Common Embedding Function
// -------------------------

const generateEmbedding = async (text) => {
  return generateLocalEmbedding(text);
};

module.exports = {
  generateEmbedding,
  generateLocalEmbedding,
  generateOpenAIEmbedding,
};
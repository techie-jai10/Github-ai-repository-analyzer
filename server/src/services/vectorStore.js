const path = require("path");
const { LocalIndex } = require("vectra");

const INDEX_PATH = path.join(process.cwd(), "vector-index");

const vectorIndex = new LocalIndex(INDEX_PATH);

// Prevent multiple simultaneous initialization attempts.
let initializationPromise = null;

const initializeVectorStore = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const exists = await vectorIndex.isIndexCreated();

      if (!exists) {
        await vectorIndex.createIndex({
          version: 1,
          metadata_config: {
            indexed: ["repo", "path"],
          },
        });

        console.log("Vector index created");
      }

      return vectorIndex;
    })();
  }

  try {
    return await initializationPromise;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
};

// Insert one embedding into the vector store.
const addEmbedding = async (embedding, metadata) => {
  await initializeVectorStore();

  return vectorIndex.insertItem({
    vector: embedding,
    metadata: metadata,
  });
};

// Serialize writes to prevent overlapping vector-index updates.
let writeQueue = Promise.resolve();

const storeChunk = (embedding, chunkData) => {
  const operation = writeQueue.then(async () => {
    await initializeVectorStore();

    return addEmbedding(embedding, {
      repo: chunkData.repo,
      path: chunkData.path,
      chunkIndex: chunkData.chunkIndex,
      text: chunkData.text,
    });
  });

  // Keep the queue usable if an individual write fails.
  writeQueue = operation.catch(() => {});

  return operation;
};

// Retrieve the most similar chunks for a query embedding.
const searchSimilarChunks = async (queryEmbedding, topK = 5) => {
  await initializeVectorStore();

  return vectorIndex.queryItems(queryEmbedding, "", topK);
};

module.exports = {
  initializeVectorStore,
  addEmbedding,
  storeChunk,
  searchSimilarChunks,
};
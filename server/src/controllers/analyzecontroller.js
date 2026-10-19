const axios = require("axios");
require("dotenv").config();

const { generateEmbedding } = require("../services/embeddingservice");
const { storeChunk } = require("../services/vectorStore");
const { retrieveContext } = require("../services/ragservice");

// GitHub API authentication
const githubHeaders = {
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

// Split text into overlapping chunks
const chunkText = (text, chunkSize = 4000, overlap = 500) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    chunks.push(text.slice(start, end));

    start += chunkSize - overlap;
  }

  return chunks;
};

const analyzeRepository = async (req, res) => {
  const { repoUrl, task } = req.body;

  // Validate repository URL
  if (!repoUrl) {
    return res.status(400).json({
      message: "Repository URL is required",
    });
  }

  if (!repoUrl.startsWith("https://github.com/")) {
    return res.status(400).json({
      message: "Please provide a valid GitHub repository URL",
    });
  }

  // Extract owner and repository name
  const parts = repoUrl.replace(/\/+$/, "").split("/");

  const owner = parts[3];
  const repo = parts[4];

  if (!owner || !repo) {
    return res.status(400).json({
      message: "Invalid GitHub repository URL",
    });
  }

  try {
    // 1. Fetch repository information
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: githubHeaders,
      }
    );

    const branch = response.data.default_branch;

    // 2. Fetch repository file tree
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: githubHeaders,
      }
    );

    // Supported file extensions
    const allowedExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".go",
      ".rs",
      ".html",
      ".css",
      ".md",
      ".json",
    ];

    const MAX_FILE_SIZE = 20000;

    // Select supported files
    const files = treeResponse.data.tree.filter((item) => {
      if (item.type !== "blob") {
        return false;
      }

      return allowedExtensions.some((extension) =>
        item.path.endsWith(extension)
      );
    });

    // Limit initial analysis to 10 files
    const selectedFiles = files.slice(0, 10);

    // 3. Fetch files, generate embeddings, and store chunks
    const fileContents = await Promise.all(
      selectedFiles.map(async (file) => {
        const filePath = file.path;

        const fileResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
          {
            headers: githubHeaders,
            params: {
              ref: branch,
            },
          }
        );

        // GitHub's Contents API normally returns Base64 content.
        const decodedContent = Buffer.from(
          fileResponse.data.content,
          "base64"
        ).toString("utf-8");

        const limitedContent = decodedContent.slice(0, MAX_FILE_SIZE);

        const chunks = chunkText(limitedContent);

        const embeddedChunks = await Promise.all(
          chunks.map(async (chunk, index) => {
            // Generate a local semantic embedding
            const embedding = await generateEmbedding(chunk);

            // Store the vector and its metadata
            await storeChunk(embedding, {
              repo: `${owner}/${repo}`,
              path: filePath,
              chunkIndex: index,
              text: chunk,
            });

            return {
              index,
              text: chunk,
              embedding,
            };
          })
        );

        console.log("File:", filePath);
        console.log("Chunks:", embeddedChunks.length);

        if (embeddedChunks.length > 0) {
          console.log(
            "First vector length:",
            embeddedChunks[0].embedding.length
          );
        }

        return {
          path: filePath,
          chunks: embeddedChunks,
        };
      })
    );

    // 4. Retrieve relevant context and generate an AI answer
    let ragResult = null;

    if (task && task.trim()) {
      ragResult = await retrieveContext(task, `${owner}/${repo}`);
    }

    // 5. Return the result to the frontend
    return res.json({
      message: "GitHub repository analyzed successfully",
      repoUrl,
      owner,
      repo,
      task,
      branch,
      files: fileContents.map((file) => ({
        path: file.path,
        chunks: file.chunks.length,
      })),
      retrievedContext: ragResult?.context || "",
      answer: ragResult?.answer || "",
    });
  } catch (error) {
    console.error("Repository analysis failed:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    // Provide a useful error response
    if (error.response?.status === 403) {
      const rateLimitRemaining =
        error.response.headers?.["x-ratelimit-remaining"];

      if (rateLimitRemaining === "0") {
        return res.status(429).json({
          message: "GitHub API rate limit exceeded.",
          error:
            "Please wait for the rate limit to reset or configure a valid GITHUB_TOKEN in server/.env.",
        });
      }
    }

    return res.status(error.response?.status || 500).json({
      message: "Error analyzing GitHub repository",
      error: error.response?.data?.message || error.message,
    });
  }
};

module.exports = { analyzeRepository };